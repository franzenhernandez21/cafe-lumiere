// pages/CupcakeCategoryPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CategoryPage.css";

function CupcakeCategoryPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allProducts, setAllProducts] = useState([]);

  const subcategories = ["Classic", "Packs"];

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      fetchCartCount(storedUser._id || storedUser.id);
    }
    fetchProducts();
    fetchAllProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/products/category/Cupcake");
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("Error fetching Cupcake products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      const productArray = res.data.products || res.data || [];
      setAllProducts(productArray);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchCartCount = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/cart/${userId}`);
      if (res.data.cart && res.data.cart.items) {
        setCartCount(res.data.cart.items.length);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  const addToCart = async (product) => {
    if (!user) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      const userId = user._id || user.id;
      await axios.post("http://localhost:5000/api/cart", {
        userId: userId,
        productId: product._id,
        quantity: 1,
      });
      alert(`${product.name} added to cart!`);
      fetchCartCount(userId);
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Failed to add to cart");
    }
  };

  // Search functionality
  const searchSuggestions = searchQuery.trim()
    ? allProducts.filter(product =>
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
      navigate(`/userhomepage?search=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  // Filter products by subcategory
  const filteredProducts = activeSubcategory
    ? products.filter(p => p.subcategory?.toLowerCase() === activeSubcategory.toLowerCase())
    : products;

  return (
    <div className="category-page">
      {/* ===== HEADER WITH LOGO ===== */}
      <header className="header">
        {/* Logo Section */}
        <div className="header-logo" onClick={() => navigate("/userhomepage")}>
          <img src="/image/lumierelogo.png" alt="Café Lumière Logo" className="logo-image" />
          <span className="logo-text">Café Lumière</span>
        </div>

        {/* Navigation */}
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
                {searchSuggestions.map((product, index) => (
                  <div 
                    key={index}
                    className="search-suggestion-item"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSuggestionClick(product);
                    }}
                    style={{ cursor: 'pointer' }}
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

          <button
            className="icon-button"
            onClick={() => navigate("/profile")}
            title="Profile"
          >
            <img src="/image/profileto.png" alt="Profile" />
          </button>

          <button
            className="icon-button cart-icon"
            onClick={() => navigate("/cart")}
            title="Cart"
          >
            <img src="/image/cartto.png" alt="Cart" />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* ===== SUBCATEGORY BUTTONS ===== */}
      <section className="subcategory-section">
        <h2>Choose Your Cupcake</h2>
        <div className="subcategory-buttons">
          <button
            className={`subcategory-btn ${activeSubcategory === null ? "active" : ""}`}
            onClick={() => setActiveSubcategory(null)}
          >
            All Cupcakes
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub}
              className={`subcategory-btn ${activeSubcategory === sub ? "active" : ""}`}
              onClick={() => setActiveSubcategory(sub)}
            >
              {sub}
            </button>
          ))}
        </div>
      </section>

      {/* ===== PRODUCTS SECTION ===== */}
      <section className="products-section">
        <h2 className="section-title">
          {activeSubcategory ? `${activeSubcategory} Cupcakes` : "All Cupcakes"}
        </h2>
        
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="no-products">
            <p>No products available in this category 😢</p>
          </div>
        ) : (
          <div className="menu-grid">
            {filteredProducts.map((item) => (
              <div 
                key={item._id} 
                className="menu-card"
                onClick={() => navigate(`/product/${item._id}`)}
              >
                <div className="card-image-wrapper">
                  <img
                    src={
                      item.image
                        ? item.image.startsWith("http")
                          ? item.image
                          : `http://localhost:5000/${item.image}`
                        : "/image/placeholder.png"
                    }
                    alt={item.name || "Product"}
                  />
                  <div className="card-overlay">
                    <span className="view-details">View Details</span>
                  </div>
                </div>
                <div className="card-content">
                  <h3 className="product-name">{item.name || "Unnamed Product"}</h3>
                  <p className="product-desc">{item.description || "No description available"}</p>
                  {item.subcategory && (
                    <span className="subcategory-tag">{item.subcategory}</span>
                  )}
                  <div className="card-footer">
                    <span className="price">₱{item.price?.toFixed(2) || "0.00"}</span>
                    <div className="quick-actions">
                      <button 
                        className="quick-cart-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item);
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== FOOTER WITH LOGO ===== */}
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

export default CupcakeCategoryPage;