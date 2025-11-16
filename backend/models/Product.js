const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Category", 
    required: true 
  }, // ✅ Reference to Category model
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