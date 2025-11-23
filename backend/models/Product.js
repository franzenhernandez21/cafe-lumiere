// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" }, // ✅ FIXED: Added default value
  price: { type: Number, required: true },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Category", 
    required: true 
  },
  subcategory: { 
    type: String, 
    default: null 
  },
  stock: { type: Number, default: 0 },
  image: String,
  status: {
    type: String,
    enum: ["available", "unavailable"],
    default: "available",
  },
  date_added: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);