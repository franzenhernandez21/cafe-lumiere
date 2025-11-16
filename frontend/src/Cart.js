import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Cart.css";

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(storedUser);
    fetchCart(storedUser._id || storedUser.id);
  }, [navigate]);

  const fetchCart = async (userId) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/cart/${userId}`);
      setCart(res.data.cart);
    } catch (err) {
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const userId = user._id || user.id;
      await axios.put(`http://localhost:5000/api/cart/${userId}/item/${productId}`, {
        quantity: newQuantity,
      });
      fetchCart(userId);
    } catch (err) {
      console.error("Error updating quantity:", err);
      alert("Failed to update quantity");
    }
  };

  const removeItem = async (productId) => {
    if (window.confirm("Remove this item from cart?")) {
      try {
        const userId = user._id || user.id;
        await axios.delete(`http://localhost:5000/api/cart/${userId}/item/${productId}`);
        fetchCart(userId);
      } catch (err) {
        console.error("Error removing item:", err);
        alert("Failed to remove item");
      }
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    try {
      const userId = user._id || user.id;
      const res = await axios.post("http://localhost:5000/api/orders", {
        userId: userId,
        payment_method: "Cash on Delivery",
      });

      if (res.data.success) {
        alert("Order placed successfully!");
        navigate("/profile"); 
      }
    } catch (err) {
      console.error("Error placing order:", err);
      alert(err.response?.data?.message || "Failed to place order");
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="loading-spinner">Loading cart...</div>
      </div>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <div className="cart-page">
      {/* Header */}
      <header className="cart-header">
        <button className="back-btn" onClick={() => navigate("/userhomepage")}>
          ← Back to Shop
        </button>
        <h1>Shopping Cart</h1>
      </header>

      {isEmpty ? (
        <div className="empty-cart">
          <div className="empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some delicious items to get started!</p>
          <button className="continue-shopping-btn" onClick={() => navigate("/uderhomepage")}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="cart-container">
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item.product_id._id} className="cart-item">
                <div className="item-image">
                  <img
                    src={
                      item.product_id.image?.startsWith("http")
                        ? item.product_id.image
                        : `http://localhost:5000/${item.product_id.image}`
                    }
                    alt={item.product_id.name}
                    onError={(e) => {
                      e.target.src = "/image/placeholder.png";
                    }}
                  />
                </div>

                <div className="item-details">
                  <h3>{item.product_id.name}</h3>
                  <p className="item-desc">{item.product_id.description}</p>
                  <p className="item-price">₱{item.product_id.price?.toFixed(2)}</p>
                </div>

                <div className="item-controls">
                  <div className="quantity-controls">
                    <button
                      onClick={() => updateQuantity(item.product_id._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id._id, item.quantity + 1)}
                      disabled={item.quantity >= item.product_id.stock}
                    >
                      +
                    </button>
                  </div>

                  <div className="item-subtotal">
                    <span>Subtotal:</span>
                    <span className="subtotal-amount">₱{item.subtotal?.toFixed(2)}</span>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => removeItem(item.product_id._id)}
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₱{calculateTotal().toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping:</span>
              <span>₱50.00</span>
            </div>

            <div className="summary-row total">
              <span>Total:</span>
              <span>₱{(calculateTotal() + 50).toFixed(2)}</span>
            </div>

            <button className="checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout
            </button>

            <button className="continue-shopping" onClick={() => navigate("/userhomepage")}>
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;