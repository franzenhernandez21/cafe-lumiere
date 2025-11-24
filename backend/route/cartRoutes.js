const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const router = express.Router();


router.post("/", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

   
    if (!userId || !productId || !quantity) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields",
        received: { userId, productId, quantity }
      });
    }

    console.log("🛒 Cart request:", { userId, productId, quantity }); 

    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

  
    const subtotal = product.price * quantity;

   
    let cart = await Cart.findOne({ user_id: userId, status: "active" });

    if (!cart) {
      
      cart = new Cart({
        user_id: userId,
        items: [{ product_id: productId, quantity, subtotal }],
      });
      console.log(" Created new cart"); 
    } else {
      
      const itemIndex = cart.items.findIndex(
        (item) => item.product_id.toString() === productId
      );

      if (itemIndex > -1) {
        
        cart.items[itemIndex].quantity += quantity;
        cart.items[itemIndex].subtotal = cart.items[itemIndex].quantity * product.price;
        console.log(" Updated existing item"); 
      } else {
        
        cart.items.push({ product_id: productId, quantity, subtotal });
        console.log(" Added new item"); 
      }
    }

    await cart.save();
    
   
    await cart.populate("items.product_id");
    
    console.log(" Cart saved successfully"); 
    res.json({ success: true, message: "Product added to cart", cart });
  } catch (err) {
    console.error(" Cart error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET USER CART
router.get("/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ 
      user_id: req.params.userId, 
      status: "active" 
    }).populate("items.product_id");
    
    if (!cart) {
      return res.json({ success: true, cart: { items: [] } });
    }
    
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE CART ITEM QUANTITY
router.put("/:userId/item/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user_id: userId, status: "active" });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product_id.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Item not found in cart" });
    }

    // Get product price
    const product = await Product.findById(productId);
    
    // Update quantity and subtotal
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].subtotal = product.price * quantity;

    await cart.save();
    await cart.populate("items.product_id");

    res.json({ success: true, message: "Cart updated", cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// REMOVE ITEM FROM CART
router.delete("/:userId/item/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const cart = await Cart.findOne({ user_id: userId, status: "active" });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    // Filter out the item
    cart.items = cart.items.filter(
      (item) => item.product_id.toString() !== productId
    );

    await cart.save();
    await cart.populate("items.product_id");

    res.json({ success: true, message: "Item removed from cart", cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CLEAR CART (useful after checkout)
router.delete("/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ 
      user_id: req.params.userId, 
      status: "active" 
    });
    
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    
    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;