const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: false 
  },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      quantity: Number,
      price_at_purchase: Number,
    },
  ],
  subtotal: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  shippingAddress: {
    fullname: { type: String, required: false }, 
    phone: { type: String, required: false }, 
    address: { type: String, required: false } 
  },
  payment_method: { type: String, default: "Cash on Delivery" },
  bankTransferDetails: {
    accountName: String,
    accountNumber: String
  },
  promoCodeUsed: { type: String },
  status: {
    type: String,
    enum: ["Pending", "Paid", "Completed", "Cancelled"],
    default: "Pending",
  },
  order_date: { type: Date, default: Date.now },
});


module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);