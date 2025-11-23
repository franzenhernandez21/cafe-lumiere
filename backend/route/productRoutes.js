// route/productRoutes.js - FIXED VERSION
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

// ✅ READ ALL - This must come FIRST!
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    res.json({ success: true, products });
  } catch (err) {
    console.error("❌ Fetch error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ GET PRODUCTS BY CATEGORY NAME AND OPTIONAL SUBCATEGORY
router.get("/category/:categoryName", async (req, res) => {
  try {
    const { categoryName } = req.params;
    const { subcategory } = req.query; // ?subcategory=hot

    // Find category by name
    const Category = require("../models/Category");
    const category = await Category.findOne({ 
      name: new RegExp(`^${categoryName}$`, "i") 
    });

    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: "Category not found" 
      });
    }

    // Find products by category
    let query = { category: category._id };

    // If subcategory is provided, filter by it
    if (subcategory) {
      query.subcategory = subcategory.toLowerCase();
    }

    const products = await Product.find(query).populate("category");

    res.json({ 
      success: true, 
      category: category.name,
      products,
      filteredBySubcategory: subcategory || null
    });
  } catch (err) {
    console.error("❌ Error fetching by category:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ GET SINGLE PRODUCT BY ID - This comes AFTER the "/" route
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    
    // ✅ FIXED: Ensure description is included in response
    console.log("📦 Product fetched:", {
      id: product._id,
      name: product.name,
      description: product.description,
      hasDescription: !!product.description
    });
    
    res.json({ success: true, product });
  } catch (err) {
    console.error("❌ Error fetching product:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category, stock, subcategory } = req.body;
    
    console.log("📥 Received product data:", { 
      name, 
      description, 
      price, 
      category, 
      stock, 
      subcategory,
      hasDescription: !!description,
      descriptionLength: description?.length
    });
    
    const image = req.file ? req.file.path : "";
    
    // ✅ FIXED: Explicitly include description
    const newProduct = new Product({ 
      name, 
      description: description || "", // Ensure it's at least empty string
      price, 
      category,
      subcategory: subcategory || null,
      stock, 
      image 
    });
    
    await newProduct.save();
    
    console.log("✅ Product saved with description:", {
      id: newProduct._id,
      hasDescription: !!newProduct.description,
      descriptionPreview: newProduct.description?.substring(0, 50)
    });
    
    res.json({ success: true, product: newProduct });
  } catch (err) {
    console.error("❌ Error saving product:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category, stock, subcategory } = req.body;
    
    console.log("📝 Updating product with data:", { 
      name, 
      description, 
      hasDescription: !!description,
      descriptionLength: description?.length
    });
    
    // ✅ FIXED: Explicitly include description in update
    const updateData = { 
      name, 
      description: description !== undefined ? description : "", // Preserve description
      price, 
      category, 
      stock 
    };
    
    // ✅ Handle subcategory update
    if (subcategory !== undefined) {
      updateData.subcategory = subcategory || null;
    }
    
    if (req.file) updateData.image = req.file.path;
    
    const updated = await Product.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    ).populate("category");
    
    console.log("✅ Product updated with description:", {
      id: updated._id,
      hasDescription: !!updated.description,
      descriptionPreview: updated.description?.substring(0, 50)
    });
    
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