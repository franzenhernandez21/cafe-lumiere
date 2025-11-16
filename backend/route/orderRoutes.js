const express = require("express");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const router = express.Router();

// CREATE ORDER FROM CART
router.post("/", async (req, res) => {
  try {
    const { userId, payment_method } = req.body;

    // Get user's active cart
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

    // Check stock availability
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

    // Calculate total
    const total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);

    // Create order
    const newOrder = new Order({
      user: userId,
      items: cart.items.map((item) => ({
        product: item.product_id._id,
        name: item.product_id.name,
        quantity: item.quantity,
        price_at_purchase: item.product_id.price,
      })),
      total,
      payment_method: payment_method || "Cash on Delivery",
    });

    await newOrder.save();

    // Update product stock
    for (let item of cart.items) {
      await Product.findByIdAndUpdate(item.product_id._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart after successful order
    cart.items = [];
    cart.status = "completed";
    await cart.save();

    // Populate order details before sending
    await newOrder.populate("items.product");

    res.json({ 
      success: true, 
      message: "Order placed successfully", 
      order: newOrder 
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET ALL ORDERS (Admin)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "fullname email phone address")
      .populate("items.product")
      .sort({ order_date: -1 }); // Latest first

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET SINGLE ORDER BY ID
router.get("/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("user", "fullname email phone address")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET USER'S ORDERS
router.get("/user/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .populate("items.product")
      .sort({ order_date: -1 }); // Latest first

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE ORDER STATUS (Admin)
router.put("/:orderId/status", async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ["Pending", "Paid", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status. Must be: Pending, Paid, Completed, or Cancelled" 
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    ).populate("user", "fullname email").populate("items.product");

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
    res.status(500).json({ success: false, error: err.message });
  }
});

// CANCEL ORDER (User or Admin)
router.put("/:orderId/cancel", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    // Only allow cancellation if order is still Pending
    if (order.status !== "Pending") {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot cancel order with status: ${order.status}` 
      });
    }

    // Restore product stock
    for (let item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    order.status = "Cancelled";
    await order.save();

    await order.populate("user", "fullname email");
    await order.populate("items.product");

    res.json({ 
      success: true, 
      message: "Order cancelled successfully", 
      order 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE ORDER (Admin only - for cleanup)
router.delete("/:orderId", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.orderId);
    
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
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;