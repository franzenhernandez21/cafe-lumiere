// Cart.jsx - COMPLETE WITH PROMO CODE & PAYMENT OPTIONS
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Cart.css";

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [toasts, setToasts] = useState([]);
  
  // Header & Search states
  const [products, setProducts] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ NEW: User Details States
  const [shippingDetails, setShippingDetails] = useState({
    fullname: '',
    phone: '',
    address: ''
  });
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  
  // ✅ NEW: Promo Code States
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  
  // ✅ NEW: Payment Method States
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [bankDetails, setBankDetails] = useState({
    accountName: '',
    accountNumber: ''
  });

  // Toast notification function
  const showToast = (message, type = "info") => {
    const id = Date.now();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(storedUser);
    fetchCart(storedUser._id || storedUser.id);
    fetchUserDetails(storedUser._id || storedUser.id);
    
    // Fetch products for search
    axios
      .get("http://localhost:5000/api/products")
      .then((res) => {
        const productArray = res.data.products || res.data || [];
        setProducts(productArray);
      })
      .catch((err) => console.error("Fetch products error:", err));
  }, [navigate]);

  const fetchCart = async (userId) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/cart/${userId}`);
      setCart(res.data.cart);
    } catch (err) {
      console.error("Error fetching cart:", err);
      showToast("Failed to load cart", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Fetch User Details
  const fetchUserDetails = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${userId}`);
      if (res.data.success) {
        setShippingDetails({
          fullname: res.data.user.fullname || '',
          phone: res.data.user.phone || '',
          address: res.data.user.address || ''
        });
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
    }
  };

  // ✅ NEW: Save User Details
  const handleSaveDetails = async () => {
    try {
      const userId = user._id || user.id;
      const res = await axios.put(`http://localhost:5000/api/users/${userId}/profile`, shippingDetails);
      
      if (res.data.success) {
        showToast("Details saved successfully", "success");
        setIsEditingDetails(false);
        
        // Update localStorage
        const updatedUser = { ...user, ...shippingDetails };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("Error saving details:", err);
      showToast("Failed to save details", "error");
    }
  };

  // ✅ NEW: Apply Promo Code
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }
    
    try {
      const userId = user._id || user.id;
      const res = await axios.post('http://localhost:5000/api/users/validate-promo', {
        userId,
        promoCode: promoCode.trim()
      });
      
      if (res.data.success) {
        const total = calculateTotal() + 50; // subtotal + shipping
        const discount = total * res.data.discount; // 50% discount
        
        setPromoApplied(true);
        setPromoDiscount(discount);
        setPromoError('');
        showToast("Promo code applied! 50% OFF", "success");
      } else {
        setPromoError(res.data.message);
        setPromoApplied(false);
        setPromoDiscount(0);
      }
    } catch (err) {
      setPromoError(err.response?.data?.message || 'Invalid promo code');
      setPromoApplied(false);
      setPromoDiscount(0);
    }
  };

  // ✅ NEW: Remove Promo Code
  const handleRemovePromo = () => {
    setPromoCode('');
    setPromoApplied(false);
    setPromoDiscount(0);
    setPromoError('');
    showToast("Promo code removed", "info");
  };

  // Search functionality
  const searchSuggestions = searchQuery.trim()
    ? products.filter(product =>
        product.name?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSuggestionClick = (product) => {
    setSearchQuery("");
    setShowSuggestions(false);
    navigate(`/product/${product._id}`);
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    if (searchQuery.trim()) setShowSuggestions(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    setTimeout(() => setShowSuggestions(false), 300);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCart = {
      ...cart,
      items: cart.items.map(item => {
        if (item.product_id._id === productId) {
          return {
            ...item,
            quantity: newQuantity,
            subtotal: item.product_id.price * newQuantity
          };
        }
        return item;
      })
    };
    setCart(updatedCart);

    try {
      const userId = user._id || user.id;
      await axios.put(`http://localhost:5000/api/cart/${userId}/item/${productId}`, {
        quantity: newQuantity,
      });
      showToast("Quantity updated", "success");
    } catch (err) {
      console.error("Error updating quantity:", err);
      showToast("Failed to update quantity", "error");
      fetchCart(user._id || user.id);
    }
  };

  const removeItem = async (productId) => {
    const itemToRemove = cart.items.find(item => item.product_id._id === productId);
    const itemName = itemToRemove?.product_id?.name || "Item";

    const updatedCart = {
      ...cart,
      items: cart.items.filter(item => item.product_id._id !== productId)
    };
    setCart(updatedCart);
    showToast(`${itemName} removed from cart`, "info");

    try {
      const userId = user._id || user.id;
      await axios.delete(`http://localhost:5000/api/cart/${userId}/item/${productId}`);
    } catch (err) {
      console.error("Error removing item:", err);
      showToast("Failed to remove item", "error");
      fetchCart(user._id || user.id);
    }
  };

  // ✅ UPDATED: Handle Checkout with Promo & Payment
  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      showToast("Your cart is empty!", "warning");
      return;
    }

    // Validate shipping details
    if (!shippingDetails.fullname || !shippingDetails.phone || !shippingDetails.address) {
      showToast("Please complete your shipping details", "warning");
      setIsEditingDetails(true);
      return;
    }

    // Validate bank details if bank transfer selected
    if (paymentMethod === "Bank Transfer") {
      if (!bankDetails.accountName || !bankDetails.accountNumber) {
        showToast("Please provide bank transfer details", "warning");
        return;
      }
    }

    try {
      const userId = user._id || user.id;
      const res = await axios.post("http://localhost:5000/api/orders", {
        userId: userId,
        payment_method: paymentMethod,
        shippingAddress: shippingDetails,
        ...(paymentMethod === "Bank Transfer" && { bankTransferDetails: bankDetails }),
        ...(promoApplied && { promoCode: promoCode })
      });

      if (res.data.success) {
        showToast("Order placed successfully!", "success");
        setTimeout(() => {
          navigate("/profile");
        }, 1000);
      }
    } catch (err) {
      console.error("Error placing order:", err);
      showToast(err.response?.data?.message || "Failed to place order", "error");
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calculateFinalTotal = () => {
    const subtotal = calculateTotal();
    const shipping = 50;
    const total = subtotal + shipping - promoDiscount;
    return Math.max(0, total); // Ensure never negative
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="loading-container">
          <div className="loading-spinner-icon"></div>
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;
  const cartItemCount = cart?.items?.length || 0;

  return (
    <div className="cart-page">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div className="toast-icon">
              {toast.type === "success" && "✓"}
              {toast.type === "error" && "✕"}
              {toast.type === "warning" && "⚠"}
              {toast.type === "info" && "ℹ"}
            </div>
            <div className="toast-message">{toast.message}</div>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="header">
        <div className="header-logo" onClick={() => navigate("/userhomepage")}>
          <img src="/image/lumierelogo.png" alt="Café Lumière Logo" className="logo-image" />
          <span className="logo-text">Café Lumière</span>
        </div>

        <nav className="navbar">
          <a onClick={() => navigate("/userhomepage")}>Home</a>
          <a onClick={() => navigate("/aboutus")}>About Us</a>
          <a onClick={() => navigate("/blogs")}>Blogs</a>
          <a onClick={() => navigate("/contact")}>Contact Us</a>
        </nav>

        <div className="header-right">
          <form onSubmit={handleSearch} className={`search-bar ${isSearchFocused ? 'focused' : ''}`}>
            <input 
              type="text" 
              placeholder="Search for coffee, pastries..." 
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
            <button type="submit" className="search-button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="search-suggestions">
                {searchSuggestions.map((product) => (
                  <div
                    key={product._id}
                    className="search-suggestion-item"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSuggestionClick(product);
                    }}
                  >
                    <img
                      src={
                        product.image
                          ? product.image.startsWith("http")
                            ? product.image
                            : `http://localhost:5000/${product.image}`
                          : "/image/placeholder.png"
                      }
                      alt={product.name}
                      className="suggestion-image"
                    />
                    <div className="suggestion-details">
                      <span className="suggestion-name">{product.name}</span>
                      <span className="suggestion-price">₱{product.price?.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>

          <button className="icon-button" onClick={() => navigate("/profile")} title="Profile">
            <img src="/image/profileto.png" alt="Profile" />
          </button>

          <button className="icon-button cart-icon" onClick={() => navigate("/cart")} title="Cart">
            <img src="/image/cartto.png" alt="Cart" />
            {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
          </button>
        </div>
      </header>

      {isEmpty ? (
        <div className="empty-cart">
          <div className="empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some delicious items to get started!</p>
          <button className="continue-shopping-btn" onClick={() => navigate("/userhomepage")}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="cart-container">
          <div className="cart-items">
            <h1 className="cart-title">Shopping Cart</h1>
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

                  <button className="remove-btn" onClick={() => removeItem(item.product_id._id)}>
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ UPDATED: Cart Summary with User Details & Promo */}
          <div className="cart-summary">
            <h2>Order Summary</h2>

            {/* ✅ NEW: Shipping Details Section */}
            <div className="shipping-details-section">
              <div className="section-header">
                <h3>Shipping Details</h3>
                <button 
                  className="edit-btn-small"
                  onClick={() => setIsEditingDetails(!isEditingDetails)}
                >
                  {isEditingDetails ? 'Cancel' : 'Edit'}
                </button>
              </div>
              
              {isEditingDetails ? (
                <div className="details-form">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={shippingDetails.fullname}
                    onChange={(e) => setShippingDetails({...shippingDetails, fullname: e.target.value})}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={shippingDetails.phone}
                    onChange={(e) => setShippingDetails({...shippingDetails, phone: e.target.value})}
                  />
                  <textarea
                    placeholder="Complete Address"
                    value={shippingDetails.address}
                    onChange={(e) => setShippingDetails({...shippingDetails, address: e.target.value})}
                    rows="3"
                  />
                  <button className="save-details-btn" onClick={handleSaveDetails}>
                    Save Details
                  </button>
                </div>
              ) : (
                <div className="details-display">
                  <p><strong>Name:</strong> {shippingDetails.fullname || 'Not provided'}</p>
                  <p><strong>Phone:</strong> {shippingDetails.phone || 'Not provided'}</p>
                  <p><strong>Address:</strong> {shippingDetails.address || 'Not provided'}</p>
                </div>
              )}
            </div>

            {/* ✅ NEW: Promo Code Section */}
            <div className="promo-section">
              <h3>Promo Code</h3>
              {!promoApplied ? (
                <div className="promo-input-group">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value.toUpperCase());
                      setPromoError('');
                    }}
                  />
                  <button className="apply-promo-btn" onClick={handleApplyPromo}>
                    Apply
                  </button>
                </div>
              ) : (
                <div className="promo-applied">
                  <div className="promo-success">
                    <span className="promo-icon">✓</span>
                    <span>Code "{promoCode}" applied!</span>
                  </div>
                  <button className="remove-promo-btn" onClick={handleRemovePromo}>
                    Remove
                  </button>
                </div>
              )}
              {promoError && <p className="promo-error">{promoError}</p>}
            </div>

            {/* ✅ NEW: Payment Method Section */}
            <div className="payment-method-section">
              <h3>Payment Method</h3>
              <div className="payment-options">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="Cash on Delivery"
                    checked={paymentMethod === "Cash on Delivery"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Cash on Delivery</span>
                </label>
                
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="Bank Transfer"
                    checked={paymentMethod === "Bank Transfer"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Bank Transfer</span>
                </label>
              </div>

              {paymentMethod === "Bank Transfer" && (
                <div className="bank-details-form">
                  <input
                    type="text"
                    placeholder="Account Name"
                    value={bankDetails.accountName}
                    onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                  />
                </div>
              )}
            </div>

            {/* Price Summary */}
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₱{calculateTotal().toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping:</span>
              <span>₱50.00</span>
            </div>

            {promoApplied && (
              <div className="summary-row discount-row">
                <span>Discount (50% OFF):</span>
                <span className="discount-amount">-₱{promoDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="summary-row total">
              <span>Total:</span>
              <span>₱{calculateFinalTotal().toFixed(2)}</span>
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

      {/* Footer */}
      <footer className="footer-section">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-column">
              <div className="footer-logo-section">
                <img src="/image/lumierelogo.png" alt="Café Lumière Logo" className="footer-logo-image" />
                <h3 className="footer-logo">Café Lumière</h3>
              </div>
              <p className="footer-tagline">Living the Coffee Life, One Cup at a Time</p>
              <p className="footer-description">
                Experience the perfect blend of ambiance, quality, and community at our specialty café.
              </p>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Contact Us</h4>
              <div className="footer-contact">
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <a href="tel:+639123456789">+63 912 345 6789</a>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <a href="mailto:info@cafelumiere.com">info@cafelumiere.com</a>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📍</span>
                  <p>123 Coffee Street, Brgy. San Vicente<br/>Malolos City, Bulacan 3000</p>
                </div>
              </div>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Follow Us</h4>
              <div className="social-links">
                <a href="https://facebook.com/cafelumiere" target="_blank" rel="noopener noreferrer" className="social-link facebook">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </a>
                <a href="https://instagram.com/cafelumiere" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                </a>
              </div>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Opening Hours</h4>
              <div className="hours-list">
                <div className="hours-item">
                  <span>Monday - Friday</span>
                  <span>7:00 AM - 10:00 PM</span>
                </div>
                <div className="hours-item">
                  <span>Saturday - Sunday</span>
                  <span>8:00 AM - 11:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2024 Café Lumière. All rights reserved.</p>
            <p className="footer-note">Living the Coffee Life ☕</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Cart;