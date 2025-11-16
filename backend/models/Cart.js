const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, default: "active" },
  items: [
    {
      product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
      subtotal: Number
    }
  ],
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Cart", cartSchema);