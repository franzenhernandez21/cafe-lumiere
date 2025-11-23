const express = require("express");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const router = express.Router();

console.log("📦 Order routes file loaded!");

// ✅ GET ALL ORDERS - FOR ADMIN DASHBOARD
router.get("/", async (req, res) => {
  console.log("🔍 Fetching all orders");
  try {
    const orders = await Order.find()
      .populate("items.product")
      .populate("user", "fullname email phone")
      .sort({ order_date: -1 });
    
    console.log("✅ Found orders:", orders.length);
    
    res.json({ 
      success: true, 
      orders: orders 
    });
  } catch (err) {
    console.error("❌ Fetch all orders error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// ✅ GET USER ORDERS
router.get("/user/:userId", async (req, res) => {
  console.log("🔍 Fetching orders for user:", req.params.userId);
  try {
    const { userId } = req.params;
    
    const orders = await Order.find({ user: userId })
      .populate("items.product")
      .populate("user", "fullname email")
      .sort({ order_date: -1 });
    
    console.log("✅ Found orders:", orders.length);
    
    res.json({ 
      success: true, 
      orders: orders 
    });
  } catch (err) {
    console.error("❌ Fetch user orders error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// ✅ UPDATE ORDER STATUS
router.put("/:orderId/status", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    )
      .populate("items.product")
      .populate("user", "fullname email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      message: "Order status updated",
      order
    });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ DELETE ORDER
router.delete("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      message: "Order deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ CREATE ORDER FROM CART
router.post("/", async (req, res) => {
  try {
    const { 
      userId, 
      payment_method, 
      shippingAddress,
      bankTransferDetails,
      promoCode 
    } = req.body;

    const cart = await Cart.findOne({ 
      user_id: userId, 
      status: "active" 
    }).populate("items.product_id");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Cart is empty" 
      });
    }

    for (let item of cart.items) {
      const product = await Product.findById(item.product_id._id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.product_id.name} not found`
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }
    }

    const subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    const shipping = 50;
    let discount = 0;
    let promoCodeUsed = null;

    if (promoCode) {
      const user = await User.findById(userId);
      if (user.promoCode?.code === promoCode) {
        const daysSinceClaimed = (Date.now() - new Date(user.promoCode.lastClaimed)) / (1000 * 60 * 60 * 24);
        
        if (daysSinceClaimed < 7) {
          discount = (subtotal + shipping) * 0.5;
          promoCodeUsed = promoCode;
          user.promoCode.timesUsed = (user.promoCode.timesUsed || 0) + 1;
          await user.save();
        }
      }
    }

    const total = subtotal + shipping - discount;

    if (!shippingAddress?.fullname || !shippingAddress?.phone || !shippingAddress?.address) {
      return res.status(400).json({
        success: false,
        message: "Please provide complete shipping address"
      });
    }

    if (payment_method === "Bank Transfer") {
      if (!bankTransferDetails?.accountName || !bankTransferDetails?.accountNumber) {
        return res.status(400).json({
          success: false,
          message: "Please provide bank transfer details"
        });
      }
    }

    const newOrder = new Order({
      user: userId,
      items: cart.items.map((item) => ({
        product: item.product_id._id,
        name: item.product_id.name,
        quantity: item.quantity,
        price_at_purchase: item.product_id.price,
      })),
      subtotal,
      shipping,
      discount,
      total,
      shippingAddress,
      payment_method,
      ...(payment_method === "Bank Transfer" && { bankTransferDetails }),
      ...(promoCodeUsed && { promoCodeUsed })
    });

    await newOrder.save();

    for (let item of cart.items) {
      await Product.findByIdAndUpdate(item.product_id._id, {
        $inc: { stock: -item.quantity }
      });
    }

    cart.items = [];
    cart.status = "completed";
    await cart.save();

    await newOrder.populate("items.product");
    await newOrder.populate("user", "fullname email");

    res.json({ 
      success: true, 
      message: "Order placed successfully", 
      order: newOrder,
      discountApplied: discount > 0
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;