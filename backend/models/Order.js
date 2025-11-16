const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      quantity: Number,
      price_at_purchase: Number,
    },
  ],
  total: Number,
  payment_method: { type: String, default: "Cash on Delivery" },
  status: {
    type: String,
    enum: ["Pending", "Paid", "Completed", "Cancelled"],
    default: "Pending",
  },
  order_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
