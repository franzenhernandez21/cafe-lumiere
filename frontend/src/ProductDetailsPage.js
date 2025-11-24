import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProductDetailsPage.css";

function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [toasts, setToasts] = useState([]);

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
    if (storedUser) {
      setUser(storedUser);
      fetchCartCount(storedUser._id || storedUser.id);
    }
  }, []);

  useEffect(() => {
    fetchProduct();
    fetchAllProducts();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/products/${id}`);
      
      // ✅ FIXED: Better data extraction
      const productData = res.data.product || res.data;
      
      console.log("=== PRODUCT DATA DEBUG ===");
      console.log("Full Response:", res.data);
      console.log("Product Object:", productData);
      console.log("Description:", productData.description);
      console.log("Description Type:", typeof productData.description);
      console.log("Description Length:", productData.description?.length);
      console.log("Is Empty String:", productData.description === "");
      console.log("========================");
      
      setProduct(productData);
    } catch (err) {
      console.error("❌ Error fetching product:", err);
      showToast("Product not found!", "error");
      navigate("/userhomepage");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      const productsData = res.data.products || res.data;
      setAllProducts(productsData);
    } catch (err) {
      console.error("Error fetching products for search:", err);
    }
  };

  const fetchCartCount = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/cart/${userId}`);
      const cart = res.data.cart;
      if (cart && cart.items) {
        setCartCount(cart.items.length);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  const addToCart = async () => {
    if (!user) {
      showToast("Please login to add items to cart", "warning");
      navigate("/login");
      return;
    }

    try {
      const userId = user._id;
      
      const response = await axios.post("http://localhost:5000/api/cart", {
        userId: userId,
        productId: product._id,
        quantity: quantity,
      });
      
      showToast(`${product.name} added to cart!`, "success");
      fetchCartCount(userId);
    } catch (err) {
      console.error("Error adding to cart:", err.response?.data || err);
      showToast(`Failed to add to cart: ${err.response?.data?.message || err.message}`, "error");
    }
  };

  const handleOrder = async () => {
    if (!user) {
      showToast("Please login to place an order", "warning");
      navigate("/login");
      return;
    }

    await addToCart();
    navigate("/cart");
  };

  const searchSuggestions = searchQuery.trim()
    ? allProducts.filter(p => 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.trim().length > 0);
  };

  const handleSuggestionClick = (selectedProduct) => {
    setSearchQuery("");
    setShowSuggestions(false);
    
    if (selectedProduct._id === id) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(`/product/${selectedProduct._id}`);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && searchSuggestions.length > 0) {
      handleSuggestionClick(searchSuggestions[0]);
    }
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    if (searchQuery.trim()) {
      setShowSuggestions(true);
    }
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // ✅ FIXED: Calculate description values BEFORE early returns
  // This ensures they're always available when rendering
  const categoryName = product && typeof product.category === 'object' 
    ? product.category?.name 
    : product?.category;

  const hasDescription = product?.description && 
                         typeof product.description === 'string' && 
                         product.description.trim().length > 0;
  
  const productDescription = hasDescription 
    ? product.description.trim() 
    : "No description available for this product.";

  // Debug logging (only when product exists)
  if (product) {
    console.log("Rendering description:", {
      hasDescription,
      descriptionLength: product.description?.length,
      willDisplay: productDescription,
      actualText: product.description
    });
  }

  if (loading) {
    return (
      <div className="product-details-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-page">
        <div className="not-found">
          <h2>Product not found</h2>
          <button onClick={() => navigate("/userhomepage")}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-details-page">
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
          <a onClick={() => navigate("/contactus")}>Contact Us</a>
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
                {searchSuggestions.map((suggestedProduct) => (
                  <div 
                    key={suggestedProduct._id}
                    className="search-suggestion-item"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSuggestionClick(suggestedProduct);
                    }}
                  >
                    <img 
                      src={
                        suggestedProduct.image
                          ? suggestedProduct.image.startsWith("http")
                            ? suggestedProduct.image
                            : `http://localhost:5000/${suggestedProduct.image}`
                          : "/image/placeholder.png"
                      }
                      alt={suggestedProduct.name}
                      className="suggestion-image"
                    />
                    <div className="suggestion-details">
                      <span className="suggestion-name">{suggestedProduct.name}</span>
                      <span className="suggestion-price">₱{suggestedProduct.price?.toFixed(2)}</span>
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
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* ===== PRODUCT DETAILS ===== */}
      <section className="product-details-container">
        <div className="product-content">
          {/* Left - Product Image */}
          <div className="product-image-section">
            <div className="main-image">
              <img
                src={
                  product.image
                    ? product.image.startsWith("http")
                      ? product.image
                      : `http://localhost:5000/${product.image}`
                    : "/image/placeholder.png"
                }
                alt={product.name}
                onError={(e) => {
                  e.target.src = "/image/placeholder.png";
                }}
              />
            </div>
          </div>

          {/* Right - Product Info */}
          <div className="product-info-section">
            <div className="product-header">
              <h1 className="product-title">{product.name}</h1>
              {categoryName && (
                <span className="category-badge-details">{categoryName}</span>
              )}
            </div>

            {/* Benefits Icons */}
            <div className="product-benefits">
              <div className="benefit-item">
                <div className="benefit-icon"></div>
                <div className="benefit-text">
                  <span className="benefit-title">Free shipping on</span>
                  <span className="benefit-subtitle">orders over ₱5000</span>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon"></div>
                <div className="benefit-text">
                  <span className="benefit-title">Easy returns</span>
                  <span className="benefit-subtitle">within 7 days</span>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon"></div>
                <div className="benefit-text">
                  <span className="benefit-title">Quality</span>
                  <span className="benefit-subtitle">Guaranteed</span>
                </div>
              </div>
            </div>

            <div className="product-price-section">
              <span className="price-label">Price:</span>
              <span className="product-price">₱{product.price?.toFixed(2)}</span>
            </div>

            <div className="product-stock">
              <span className="stock-label">Availability:</span>
              <span className={`stock-value ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="quantity-section">
              <span className="quantity-label">Quantity:</span>
              <div className="quantity-controls">
                <button 
                  className="qty-btn" 
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="quantity-display">{quantity}</span>
                <button 
                  className="qty-btn" 
                  onClick={increaseQuantity}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            

            {/* Action Buttons */}
            <div className="action-buttons">
              <button 
                className="add-to-cart-btn" 
                onClick={addToCart}
                disabled={product.stock === 0}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Add to Cart
              </button>
              <button 
                className="order-now-btn" 
                onClick={handleOrder}
                disabled={product.stock === 0}
              >
                Order Now
              </button>
            </div>
          </div>
        </div>
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
                <a href="https://www.facebook.com/kaito.203846" target="_blank" rel="noopener noreferrer" className="social-link facebook">
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

export default ProductDetailsPage;