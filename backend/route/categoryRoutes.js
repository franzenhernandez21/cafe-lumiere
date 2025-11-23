// route/categoryRoutes.js - UPDATED
const express = require("express");
const Category = require("../models/Category");
const router = express.Router();

// GET ALL CATEGORIES
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ NEW: GET SINGLE CATEGORY BY ID
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE CATEGORY
router.post("/", async (req, res) => {
  try {
    const { name, description, subcategories } = req.body;
    const newCategory = new Category({ name, description, subcategories });
    await newCategory.save();
    res.json({ success: true, category: newCategory });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE CATEGORY
router.put("/:id", async (req, res) => {
  try {
    const { name, description, subcategories } = req.body;
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, subcategories },
      { new: true }
    );
    res.json({ success: true, category: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE CATEGORY
router.delete("/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;