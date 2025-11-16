const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // ✅ Built-in, no install needed!
const { sendPasswordResetEmail } = require("../utils/emailService"); // ✅ Import

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
    if (!user) return res.status(400).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, "your_secret_key", {
      expiresIn: "1d",
    });

    // ✅ FIX: Always use consistent field name
    res.json({
      success: true,
      token,
      user: { 
        _id: user._id,           // ✅ Primary field
        id: user._id,            // ✅ Add alias for compatibility
        fullname: user.fullname, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      },
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== FORGOT PASSWORD ===== ✅ ADD THIS
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists (security)
      return res.json({ 
        success: true, 
        message: "If that email exists, we sent a reset link." 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Hash token before saving
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save token to user (expires in 1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    await sendPasswordResetEmail(email, resetToken, user.fullname);

    res.json({ 
      success: true, 
      message: "Password reset link sent to your email!" 
    });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error processing request. Please try again." 
    });
  }
});

// ===== VERIFY RESET TOKEN ===== ✅ ADD THIS
router.get("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // Hash the token from URL
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // Not expired
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired reset token" 
      });
    }

    res.json({ 
      success: true, 
      message: "Token is valid",
      email: user.email 
    });
  } catch (error) {
    console.error("❌ Verify token error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ===== RESET PASSWORD ===== ✅ ADD THIS
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters" 
      });
    }

    // Hash the token from URL
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired reset token" 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log("✅ Password reset successful for:", user.email);

    res.json({ 
      success: true, 
      message: "Password reset successful! You can now login." 
    });
  } catch (error) {
    console.error("❌ Reset password error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ===== Get a single user by ID =====
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    console.error("Get User Error:", error);
    res.status(500).json({ success: false, message: "Server error fetching user" });
  }
});

// ===== ADMIN: Get All Users =====
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json({ success: true, users });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    res.status(500).json({ success: false, message: "Server error fetching users" });
  }
});

// ===== ADMIN: Delete a User =====
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
});

// ===== ADMIN: Update a User =====
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, username, email, role, phone, address, birthday } = req.body;

const updatedUser = await User.findByIdAndUpdate(
  id,
  { fullname, username, email, role, phone, address, birthday },
  { new: true }
);


    if (!updatedUser)
      return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ success: false, message: "Error updating user" });
  }
});

module.exports = router;
