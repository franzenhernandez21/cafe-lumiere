const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: false // ✅ Make optional
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
  total: { type: Number, default: 0 }, // ✅ Add default value
  shippingAddress: {
    fullname: { type: String, required: false }, // ✅ Make optional
    phone: { type: String, required: false }, // ✅ Make optional
    address: { type: String, required: false } // ✅ Make optional
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

// ✅ Check if model exists before creating it
module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);