const express = require("express");
const Product = require("../models/Product");
const multer = require("multer");
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// CREATE
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    
    console.log("📥 Received data:", { name, price, category, stock });
    
    const image = req.file ? req.file.path : "";
    const newProduct = new Product({ 
      name, 
      description, 
      price, 
      category, // ✅ Now expects ObjectId
      stock, 
      image 
    });
    
    await newProduct.save();
    res.json({ success: true, product: newProduct });
  } catch (err) {
    console.error("❌ Error saving product:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// READ (with populated category)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("category"); // ✅ Populate category details
    res.json({ success: true, products });
  } catch (err) {
    console.error("❌ Fetch error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const updateData = { name, description, price, category, stock };
    if (req.file) updateData.image = req.file.path;
    
    const updated = await Product.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    ).populate("category");
    
    res.json({ success: true, product: updated });
  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;