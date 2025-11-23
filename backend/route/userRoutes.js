// route/userRoutes.js - FIXED VERSION
const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../utils/emailService");

const router = express.Router();

// ===== USER SIGNUP =====
router.post("/signup", async (req, res) => {
  try {
    const { fullname, username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullname,
      username,
      email,
      password: hashedPassword,
      role: "user",
      status: "active",
    });

    await newUser.save();
    res.json({ success: true, message: "User registered successfully", user: newUser });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== USER LOGIN =====
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // CHECK IF USER IS BLOCKED
    if (user.status === "blocked") {
      return res.status(403).json({ 
        success: false, 
        message: "Your account has been blocked. Please contact support for assistance.",
        blocked: true
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, "your_secret_key", {
      expiresIn: "1d",
    });

    res.json({
      success: true,
      token,
      user: { 
        _id: user._id,
        id: user._id,
        fullname: user.fullname, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        status: user.status
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== FORGOT PASSWORD =====
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true, message: "If that email exists, we sent a reset link." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    await sendPasswordResetEmail(email, resetToken, user.fullname);
    res.json({ success: true, message: "Password reset link sent to your email!" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Error processing request." });
  }
});

// ===== VERIFY RESET TOKEN =====
router.get("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }
    res.json({ success: true, message: "Token is valid", email: user.email });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== RESET PASSWORD =====
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== GET ALL USERS =====
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error fetching users" });
  }
});

// ===== GENERATE PROMO CODE =====
router.post("/:id/generate-promo", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if user already has an active promo code (claimed within last 7 days)
    if (user.promoCode?.lastClaimed) {
      const daysSinceClaimed = (Date.now() - new Date(user.promoCode.lastClaimed)) / (1000 * 60 * 60 * 24);
      
      if (daysSinceClaimed < 7) {
        return res.status(400).json({ 
          success: false, 
          message: "You already have an active promo code! Please wait 7 days before claiming a new one.",
          existingCode: user.promoCode.code
        });
      }
    }

    // Generate unique promo code (e.g., "CAFE-XXXX")
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = 'CAFE-';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    const newPromoCode = generateCode();

    // Update user with new promo code
    user.promoCode = {
      code: newPromoCode,
      lastClaimed: new Date(),
      timesUsed: 0
    };

    await user.save();

    console.log("✅ Promo code generated for user:", user.fullname, "Code:", newPromoCode);
    
    res.json({ 
      success: true, 
      message: "Promo code generated successfully!",
      promoCode: newPromoCode
    });
  } catch (error) {
    console.error("Generate Promo Error:", error);
    res.status(500).json({ success: false, message: "Error generating promo code" });
  }
});

// ===== VALIDATE PROMO CODE =====
router.post("/validate-promo", async (req, res) => {
  try {
    const { userId, promoCode } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if promo code matches
    if (user.promoCode?.code !== promoCode) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid promo code" 
      });
    }

    // Check if promo code is still valid (within 7 days)
    const daysSinceClaimed = (Date.now() - new Date(user.promoCode.lastClaimed)) / (1000 * 60 * 60 * 24);
    
    if (daysSinceClaimed >= 7) {
      return res.status(400).json({ 
        success: false, 
        message: "This promo code has expired" 
      });
    }

    res.json({ 
      success: true, 
      message: "Promo code is valid!",
      discount: 0.5 // 50% discount
    });
  } catch (error) {
    console.error("Validate Promo Error:", error);
    res.status(500).json({ success: false, message: "Error validating promo code" });
  }
});

// ✅ UPDATE USER PROFILE/SHIPPING DETAILS (OUTSIDE OF OTHER FUNCTIONS!)
router.put("/:id/profile", async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, phone, address } = req.body;

    console.log("📝 Updating profile for user:", id, { fullname, phone, address });

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { fullname, phone, address },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log("✅ Profile updated:", updatedUser.fullname);
    res.json({ success: true, message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("❌ Update Profile Error:", error);
    res.status(500).json({ success: false, message: "Error updating profile" });
  }
});

// ⭐⭐⭐ IMPORTANT: SPECIFIC ROUTES MUST BE BEFORE GENERIC /:id ROUTES ⭐⭐⭐

// ===== BLOCK USER =====
router.put("/:id/block", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ success: false, message: "Cannot block admin accounts" });
    }

    user.status = "blocked";
    await user.save();

    console.log("🚫 User blocked:", user.fullname);
    res.json({ success: true, message: "User blocked successfully", user });
  } catch (error) {
    console.error("Block User Error:", error);
    res.status(500).json({ success: false, message: "Error blocking user" });
  }
});

// ===== UNBLOCK USER =====
router.put("/:id/unblock", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.status = "active";
    await user.save();

    console.log("✅ User unblocked:", user.fullname);
    res.json({ success: true, message: "User unblocked successfully", user });
  } catch (error) {
    console.error("Unblock User Error:", error);
    res.status(500).json({ success: false, message: "Error unblocking user" });
  }
});

// ===== GET SINGLE USER =====
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error fetching user" });
  }
});

// ===== UPDATE USER =====
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, username, email, role, phone, address, birthday, status } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { fullname, username, email, role, phone, address, birthday, status },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ success: false, message: "Error updating user" });
  }
});

// ===== DELETE USER =====
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ success: false, message: "Cannot delete admin accounts" });
    }

    await User.findByIdAndDelete(id);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
});

module.exports = router;