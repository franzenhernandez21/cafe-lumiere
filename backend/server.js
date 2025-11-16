const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const userRoutes = require("./route/userRoutes");
const productRoutes = require("./route/productRoutes");
const orderRoutes = require("./route/orderRoutes");
const categoryRoutes = require("./route/categoryRoutes");
const cartRoutes = require("./route/cartRoutes"); // ✅ Added

const app = express();

app.use(express.json());
app.use(cors());

// ===== MongoDB Connection =====
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    createDefaultAdmin();
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===== Create Default Admin =====
async function createDefaultAdmin() {
  try {
    const adminEmail = "admin@cafelumiere.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const newAdmin = new User({
        fullname: "Admin Account",
        email: adminEmail,
        username: "admin",
        password: hashedPassword,
        role: "admin",
      });

      await newAdmin.save();
      console.log("✅ Default admin account created!");
    } else {
      console.log("⚙️ Admin account already exists");
    }
  } catch (error) {
    console.error("❌ Error creating default admin:", error);
  }
}

app.use("/uploads", express.static("uploads"));

// ===== ROUTES =====
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes); // ✅ Added Cart Routes

app.get("/", (req, res) => {
  res.send("☕ Café Lumière Backend is running");
});

// ===== Start server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));