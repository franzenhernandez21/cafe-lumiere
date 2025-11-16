import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./profile.css";

function Profile() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState(null);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Header states
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  if (!storedUser) {
    navigate("/login");
    return;
  }

  // ✅ FIX: Use _id consistently
  const userId = storedUser._id;
  console.log("👤 User ID:", userId); // Debug log
  
  fetchUser(userId);
  fetchOrders(userId);
  fetchCart(userId);
}, [navigate]);

  const fetchUser = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${userId}`);
      if (res.data.success) {
        setUserData({
          fullname: res.data.user.fullname,
          email: res.data.user.email,
          username: res.data.user.username,
          avatar: "/image/pfpicon.png",
          phone: res.data.user.phone || "",
          address: res.data.user.address || "",
          birthday: res.data.user.birthday || "",
          memberSince: new Date(res.data.user.createdAt || Date.now()).getFullYear(),
        });
      }
    } catch (error) {
      console.error("Fetch user error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/user/${userId}`);
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error("Fetch orders error:", error);
    }
  };

  const fetchCart = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/cart/${userId}`);
      setCart(res.data.cart);
    } catch (error) {
      console.error("Fetch cart error:", error);
    }
  };

  const handleInputChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser.id || storedUser._id;

      const res = await axios.put(`http://localhost:5000/api/users/${userId}`, {
        fullname: userData.fullname,
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        birthday: userData.birthday,
      });

      if (res.data.success) {
        alert("Profile updated successfully!");
        setIsEditing(false);
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser.id || storedUser._id;
      await axios.put(`http://localhost:5000/api/cart/${userId}/item/${productId}`, {
        quantity: newQuantity,
      });
      fetchCart(userId);
    } catch (error) {
      console.error("Update quantity error:", error);
    }
  };

  const removeFromCart = async (productId) => {
    if (window.confirm("Remove this item from cart?")) {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const userId = storedUser.id || storedUser._id;
        await axios.delete(`http://localhost:5000/api/cart/${userId}/item/${productId}`);
        fetchCart(userId);
      } catch (error) {
        console.error("Remove item error:", error);
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#ffa500",
      paid: "#4caf50",
      completed: "#2196f3",
      cancelled: "#f44336",
    };
    return colors[status?.toLowerCase()] || "#666";
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-page">
        <p style={{ textAlign: "center", marginTop: "50px" }}>User not found.</p>
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const cartTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="profile-page">
      {/* ===== HEADER ===== */}
      <header className="header">
        <nav className="navbar">
          <a onClick={() => navigate("/userhomepage")}>Home</a>
          <a onClick={() => navigate("/blogs")}>Blogs</a>
          <a onClick={() => navigate("/aboutus")}>About Us</a>
        </nav>

        <div className="header-right">
          <form onSubmit={handleSearch} className={`search-bar ${isSearchFocused ? 'focused' : ''}`}>
            <input 
              type="text" 
              placeholder="Search for coffee, pastries..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            <button type="submit" className="search-button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </form>

          <button
            className="icon-button"
            onClick={() => navigate("/profile")}
            title="Profile"
          >
            <img src="/image/pfpicon.png" alt="Profile" />
          </button>

          <button
            className="icon-button cart-icon"
            onClick={() => navigate("/cart")}
            title="Cart"
          >
            <img src="/image/carticon.png" alt="Cart" />
            {cartItems.length > 0 && <span className="cart-badge">{cartItems.length}</span>}
          </button>
        </div>
      </header>

      {/* Hamburger Menu Button */}
      <button 
        className="drawer-toggle"
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Overlay */}
      {isDrawerOpen && (
        <div 
          className="drawer-overlay"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      <div className="profile-container-new">
        {/* LEFT SIDEBAR */}
        <aside className={`profile-sidebar-new ${isDrawerOpen ? 'drawer-open' : ''}`}>
          <button 
            className="drawer-close"
            onClick={() => setIsDrawerOpen(false)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="profile-card">
            <div className="avatar-wrapper">
              <img src={userData.avatar} alt="Profile" className="profile-avatar-new" />
              <div className="avatar-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 15l-3-3h6l-3 3z" />
                </svg>
              </div>
            </div>
            <h2 className="profile-name">{userData.fullname}</h2>
            <p className="profile-email">{userData.email}</p>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeSection === "profile" ? "active" : ""}`}
              onClick={() => {
                setActiveSection("profile");
                setIsDrawerOpen(false);
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Account Details</span>
            </button>

            <button
              className={`nav-item ${activeSection === "orders" ? "active" : ""}`}
              onClick={() => {
                setActiveSection("orders");
                setIsDrawerOpen(false);
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              </svg>
              <span>Orders</span>
            </button>

            <button
              className={`nav-item ${activeSection === "cart" ? "active" : ""}`}
              onClick={() => {
                setActiveSection("cart");
                setIsDrawerOpen(false);
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span>Cart</span>
            </button>

            <button
              className={`nav-item ${activeSection === "billing" ? "active" : ""}`}
              onClick={() => {
                setActiveSection("billing");
                setIsDrawerOpen(false);
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Billing Address</span>
            </button>

            <button className="nav-item logout-item" onClick={() => {
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              navigate("/login");
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Log Out</span>
            </button>
          </nav>
        </aside>

        {/* RIGHT CONTENT */}
        <main className="profile-main-new">
          {/* ACCOUNT DETAILS */}
          {activeSection === "profile" && (
            <div className="content-section">
              <div className="section-header">
                <h1>Account Details</h1>
                {!isEditing && (
                  <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="details-grid">
                <div className="detail-group half-width">
                  <label>Full Name</label>
                  {!isEditing ? (
                    <div className="detail-value">{userData.fullname}</div>
                  ) : (
                    <input
                      type="text"
                      name="fullname"
                      value={userData.fullname}
                      onChange={handleInputChange}
                      className="detail-input"
                    />
                  )}
                </div>

                <div className="detail-group half-width">
                  <label>Username</label>
                  {!isEditing ? (
                    <div className="detail-value">{userData.username || '—'}</div>
                  ) : (
                    <input
                      type="text"
                      name="username"
                      value={userData.username}
                      onChange={handleInputChange}
                      className="detail-input"
                    />
                  )}
                </div>

                <div className="detail-group half-width">
                  <label>Email Address</label>
                  {!isEditing ? (
                    <div className="detail-value">{userData.email}</div>
                  ) : (
                    <input
                      type="email"
                      name="email"
                      value={userData.email}
                      onChange={handleInputChange}
                      className="detail-input"
                    />
                  )}
                </div>

                <div className="detail-group half-width">
                  <label>Phone Number</label>
                  {!isEditing ? (
                    <div className="detail-value">{userData.phone || '—'}</div>
                  ) : (
                    <input
                      type="text"
                      name="phone"
                      value={userData.phone}
                      onChange={handleInputChange}
                      className="detail-input"
                      placeholder="Enter phone number"
                    />
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="action-buttons">
                  <button className="save-changes-btn" onClick={handleSave}>
                    Save Changes
                  </button>
                  <button className="cancel-btn-new" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ORDERS SECTION */}
          {activeSection === "orders" && (
            <div className="content-section">
              <div className="section-header">
                <h1>Order History</h1>
              </div>

              {orders.length === 0 ? (
                <div className="empty-state">
                  <span style={{fontSize: "48px"}}>📦</span>
                  <p>No orders yet</p>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order, index) => (
                    <div key={order._id} className="order-card" style={{animationDelay: `${0.1 * index}s`}}>
                      <div className="order-header">
                        <div>
                          <h3>Order #{order._id.slice(-6)}</h3>
                          <p className="order-date">{new Date(order.order_date).toLocaleDateString()}</p>
                        </div>
                        <span 
                          className="status-badge"
                          style={{backgroundColor: getStatusColor(order.status)}}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="order-body">
                        <p className="order-items">
                          {order.items.map(item => `${item.name} x${item.quantity}`).join(", ")}
                        </p>
                        <p className="order-total">Total: <strong>₱{order.total?.toFixed(2)}</strong></p>
                      </div>
                      <div className="order-footer">
                        <button className="order-action-btn">View Details</button>
                        <button className="order-action-btn secondary">Reorder</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CART SECTION */}
          {activeSection === "cart" && (
            <div className="content-section">
              <div className="section-header">
                <h1>Shopping Cart</h1>
              </div>

              {cartItems.length === 0 ? (
                <div className="empty-state">
                  <span style={{fontSize: "48px"}}>🛒</span>
                  <p>Your cart is empty</p>
                  <button 
                    className="continue-shopping-btn"
                    onClick={() => navigate("/userhomepage")}
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <>
                  <div className="cart-list">
                    {cartItems.map((item, index) => (
                      <div key={item.product_id._id} className="cart-item" style={{animationDelay: `${0.1 * index}s`}}>
                        <div className="cart-item-image">
                          <img 
                            src={
                              item.product_id.image?.startsWith("http")
                                ? item.product_id.image
                                : `http://localhost:5000/${item.product_id.image}`
                            }
                            alt={item.product_id.name}
                            onError={(e) => e.target.src = "/image/placeholder.png"}
                          />
                        </div>
                        <div className="cart-item-details">
                          <h3>{item.product_id.name}</h3>
                          <p className="cart-item-price">₱{item.product_id.price?.toFixed(2)}</p>
                        </div>
                        <div className="cart-item-quantity">
                          <button 
                            className="qty-btn"
                            onClick={() => updateQuantity(item.product_id._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button 
                            className="qty-btn"
                            onClick={() => updateQuantity(item.product_id._id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button 
                          className="cart-remove-btn"
                          onClick={() => removeFromCart(item.product_id._id)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    
                    <div className="cart-summary">
                      <div className="cart-total">
                        <span>Subtotal:</span>
                        <span>₱{cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="cart-total">
                        <span>Shipping:</span>
                        <span>₱50.00</span>
                      </div>
                      <div className="cart-total grand-total">
                        <span>Total:</span>
                        <span>₱{(cartTotal + 50).toFixed(2)}</span>
                      </div>
                      <button 
                        className="checkout-btn"
                        onClick={() => navigate("/cart")}
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* BILLING ADDRESS */}
          {activeSection === "billing" && (
            <div className="content-section">
              <div className="section-header">
                <h1>Billing Address</h1>
                {!isEditing && (
                  <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit Address
                  </button>
                )}
              </div>

              <div className="details-grid">
                <div className="detail-group full-width">
                  <label>Full Address</label>
                  {!isEditing ? (
                    <div className="detail-value">{userData.address || 'No address provided'}</div>
                  ) : (
                    <textarea
                      name="address"
                      value={userData.address}
                      onChange={handleInputChange}
                      className="detail-input"
                      placeholder="Enter your full address"
                      rows="3"
                    />
                  )}
                </div>

                <div className="detail-group half-width">
                  <label>Birthday</label>
                  {!isEditing ? (
                    <div className="detail-value">{userData.birthday || '—'}</div>
                  ) : (
                    <input
                      type="date"
                      name="birthday"
                      value={userData.birthday}
                      onChange={handleInputChange}
                      className="detail-input"
                    />
                  )}
                </div>

                <div className="detail-group half-width">
                  <label>Member Since</label>
                  <div className="detail-value">{userData.memberSince}</div>
                </div>
              </div>

              {isEditing && (
                <div className="action-buttons">
                  <button className="save-changes-btn" onClick={handleSave}>
                    Save Changes
                  </button>
                  <button className="cancel-btn-new" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ===== FOOTER SECTION ===== */}
      <footer className="footer-section">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-column">
              <h3 className="footer-logo">Café Lumière</h3>
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
                <a 
                  href="https://facebook.com/cafelumiere" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link facebook"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </a>
                <a 
                  href="https://instagram.com/cafelumiere" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link instagram"
                >
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

export default Profile;