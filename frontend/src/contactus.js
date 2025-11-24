import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './contactus.css';

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">
        {type === 'success' && '✓'}
        {type === 'error' && '✕'}
        {type === 'warning' && '⚠'}
        {type === 'info' && 'ℹ'}
      </div>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
};

export default function CafeLumiereContact() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Toast states
  const [toasts, setToasts] = useState([]);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [focusedField, setFocusedField] = useState(null);
  
  // Promo code states
  const [showSecret, setShowSecret] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  
  // Header states from UserHomePage
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [allProducts, setAllProducts] = useState([]);

  // Toast helper function
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Get logged in user
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      fetchCartCount(storedUser._id || storedUser.id);
    }
    
    // Fetch products for search
    fetchProducts();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMenuOpen && !e.target.closest('.mobile-drawer') && !e.target.closest('.hamburger-btn')) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  const fetchProducts = () => {
    axios
      .get("http://localhost:5000/api/products")
      .then((res) => {
        const productData = res.data.products || res.data || [];
        setAllProducts(productData);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        showToast("Failed to load products", "error");
        setAllProducts([]);
      });
  };

  const fetchCartCount = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/cart/${userId}`);
      const cart = res.data.cart;
      if (cart && cart.items) setCartCount(cart.items.length);
    } catch (err) {
      console.error("Error fetching cart:", err);
      showToast("Failed to load cart", "error");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast(`Thank you ${formData.name}! We'll be in touch soon ☕`, "success");
    setFormData({ name: '', email: '', message: '' });
  };

  // Promo code functionality
  const handleSecretClick = async () => {
    setClickCount(prev => prev + 1);
    
    if (clickCount >= 2) {
      if (!user) {
        showToast('Please login to claim your promo code!', "warning");
        navigate('/login');
        return;
      }
      
      setLoading(true);
      setError('');
      
      try {
        const userId = user._id || user.id;
        const res = await axios.post(`http://localhost:5000/api/users/${userId}/generate-promo`);
        
        if (res.data.success) {
          setPromoCode(res.data.promoCode);
          setShowSecret(true);
          showToast('Promo code generated successfully! 🎉', "success");
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Error generating promo code';
        setError(errorMessage);
        showToast(errorMessage, "error");
      } finally {
        setLoading(false);
        setClickCount(0);
      }
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    showToast('Promo code copied to clipboard!', "success");
    setTimeout(() => setCopied(false), 2000);
  };

  // Search functionality
  const searchSuggestions = searchQuery.trim()
    ? allProducts.filter(product => product.name?.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
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
      setShowSuggestions(false);
      navigate(`/userhomepage?search=${searchQuery}`);
    }
  };

  const handleNavClick = (path) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="page-wrapper">
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
        ))}
      </div>

      {/* Mobile Drawer Overlay */}
      <div className={`drawer-overlay ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} />

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${isMenuOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-logo">
            <img src="/image/lumierelogo.png" alt="Logo" />
            <span>Café Lumière</span>
          </div>
          <button className="drawer-close" onClick={() => setIsMenuOpen(false)}>×</button>
        </div>
        <nav className="drawer-nav">
          <a onClick={() => handleNavClick("/userhomepage")}>Home</a>
          <a onClick={() => handleNavClick("/aboutus")}>About Us</a>
          <a onClick={() => handleNavClick("/contactus")}>Contact Us</a>
          <a onClick={() => handleNavClick("/profile")}>Profile</a>
          <a onClick={() => handleNavClick("/cart")}>Cart {cartCount > 0 && `(${cartCount})`}</a>
        </nav>
      </div>

      {/* ===== HEADER SECTION ===== */}
      <div
        className="bakery-container"
        style={{
          backgroundImage: "url('/image/abouutus.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          position: "relative",
        }}
      >
        <header className={`bakery-header ${isScrolled ? 'scrolled' : ''}`}>
          <button className="hamburger-btn" onClick={() => setIsMenuOpen(true)}>
            <span></span><span></span><span></span>
          </button>

          <div className="header-logo" onClick={() => navigate("/userhomepage")}>
            <img src="/image/lumierelogo.png" alt="Café Lumière Logo" className="logo-image" />
            <span className="logo-text">Café Lumière</span>
          </div>

          <nav className="navbar">
            <a onClick={() => navigate("/userhomepage")}>Home</a>
            <a onClick={() => navigate("/aboutus")}>About Us</a>
            <a onClick={() => navigate("/contactus")}>Contact Us</a>
          </nav>

          <div className="header-right">
            <form onSubmit={handleSearch} className={`search-bar ${isSearchFocused ? 'focused' : ''}`}>
              <input type="text" placeholder="Search..." value={searchQuery}
                onChange={handleSearchInputChange} onFocus={handleSearchFocus} onBlur={handleSearchBlur} />
              <button type="submit" className="search-button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="search-suggestions">
                  {searchSuggestions.map((product, index) => (
                    <div key={index} className="search-suggestion-item"
                      onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(product); }}>
                      <img src={product.image ? (product.image.startsWith("http") ? product.image : `http://localhost:5000/${product.image}`) : "/image/placeholder.png"}
                        alt={product.name} className="suggestion-image" />
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
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </header>

        <main className="bakery-main">
          <div className="text-section">
            <h1>Get in <span className="highlight-lightbrown">Touch</span> with Us</h1>
          </div>
        </main>
      </div>

      {/* ===== CONTACT SECTION ===== */}
      <div className="contact-wrapper">
        <div className="contact-container">
          <div className="card">
            {/* Left Panel */}
            <div 
              className="left-panel"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="left-overlay">
                <div 
                  className="coffee-icon" 
                  onClick={handleSecretClick}
                  title="Click me 3 times for a surprise!"
                >
                  ☕
                </div>
                
                <h2 className="left-title">Contact Us</h2>
                
                <div className="contact-info">
                  <div className="info-item">
                    <span className="icon">📍</span>
                    <div className="info-text">
                      <p>123 Coffee Street, Brgy. San Vicente</p>
                      <p>Malolos City, Bulacan 3000</p>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <span className="icon">✉️</span>
                    <div className="info-text">
                      <p>info@cafelumiere.com</p>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <span className="icon">📞</span>
                    <div className="info-text">
                      <p>+63 912 345 6789</p>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <span className="icon">☎️</span>
                    <div className="info-text">
                      <p>+63 912 345 6790</p>
                    </div>
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="social-media-section">
                  <h3 className="social-heading">Follow Us</h3>
                  <div className="social-links-contact">
                    <a 
                      href="https://www.facebook.com/kaito.203846" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-link-contact facebook"
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
                      className="social-link-contact instagram"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      <span>Instagram</span>
                    </a>
                  </div>
                </div>
                
                <div className="decorative-line"></div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="right-panel">
              <h1 className="title">Get in Touch</h1>
              <p className="subtitle">Feel free to drop us a line below!</p>
              
              <form onSubmit={handleSubmit} className="form">
                <div className="input-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    className={`input ${focusedField === 'name' ? 'focused' : ''}`}
                    required
                  />
                </div>
                
                <div className="input-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className={`input ${focusedField === 'email' ? 'focused' : ''}`}
                    required
                  />
                </div>
                
                <div className="input-group">
                  <textarea
                    name="message"
                    placeholder="Typing your message here..."
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    className={`textarea ${focusedField === 'message' ? 'focused' : ''}`}
                    required
                  />
                </div>
                
                <button type="submit" className="button">
                  SEND
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ===== PROMO CODE MODAL ===== */}
      {showSecret && (
        <div className="modal" onClick={() => setShowSecret(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowSecret(false)}>
              ×
            </button>
            <h2 className="modal-title"> Your Exclusive Promo Code!</h2>
            
            <div className="promo-code-container">
              <div className="promo-code-box">
                <div className="promo-code-label">YOUR PROMO CODE</div>
                <div className="promo-code-value">{promoCode}</div>
                <button 
                  className="copy-button"
                  onClick={handleCopyCode}
                >
                  {copied ? (
                    <>
                      <span className="copy-icon">✓</span>
                      Copied!
                    </>
                  ) : (
                    <>
                      <span className="copy-icon"></span>
                      Copy Code
                    </>
                  )}
                </button>
              </div>
              
              <div className="promo-details">
                <div className="promo-benefit">
                  <span className="benefit-icon"></span>
                  <span className="benefit-text">Get 50% OFF on your next order!</span>
                </div>
                <div className="promo-expiry">
                  <span className="expiry-icon"></span>
                  <span className="expiry-text">Valid for 7 days</span>
                </div>
              </div>
            </div>
            
            <p className="secret-message">
              Use this code at checkout to enjoy your discount!
            </p>
            
            <div className="promo-instructions">
              <p> <strong>How to use:</strong></p>
              <ol>
                <li>Add items to your cart</li>
                <li>Go to checkout</li>
                <li>Enter this promo code</li>
                <li>Enjoy 50% OFF!</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* ===== FOOTER SECTION ===== */}
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