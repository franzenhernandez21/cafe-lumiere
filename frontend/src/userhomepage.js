import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./userhomepage.css";

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

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="pagination-container">
      <button
        className="pagination-btn prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Previous
      </button>
      
      <div className="pagination-info">
        <span className="page-number">{currentPage}</span>
        <span className="page-separator">/</span>
        <span className="total-pages">{totalPages}</span>
      </div>
      
      <button
        className="pagination-btn next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
};

function UserHomePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [topSellingPage, setTopSellingPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      fetchCartCount(storedUser._id || storedUser.id);
    }
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchTopSellingProducts();
  }, []);

  const fetchProducts = () => {
    axios
      .get("http://localhost:5000/api/products")
      .then((res) => {
        const productData = res.data.products || res.data || [];
        setProducts(productData);
        setAllProducts(productData);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setProducts([]);
        setAllProducts([]);
      });
  };

  const fetchTopSellingProducts = async () => {
    try {
      const ordersRes = await axios.get("http://localhost:5000/api/orders");
      const orders = ordersRes.data.orders || [];

      // Calculate product sales
      const productSales = {};
      orders.forEach(order => {
        order.items?.forEach(item => {
          const productId = item.product?._id || item.product;
          if (productId) {
            if (productSales[productId]) {
              productSales[productId].quantity += item.quantity;
            } else {
              productSales[productId] = {
                productId,
                name: item.name,
                quantity: item.quantity
              };
            }
          }
        });
      });

      // Sort by quantity and get top 10
      const topProducts = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);

      // Fetch full product details
      const productsRes = await axios.get("http://localhost:5000/api/products");
      const allProds = productsRes.data.products || productsRes.data || [];

      const topSellingWithDetails = topProducts
        .map(tp => {
          const product = allProds.find(p => p._id === tp.productId);
          return product ? { ...product, soldQuantity: tp.quantity } : null;
        })
        .filter(Boolean);

      setTopSellingProducts(topSellingWithDetails);
    } catch (err) {
      console.error("Error fetching top selling products:", err);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchTerm = searchParams.get("search");
    if (searchTerm) setSearchQuery(searchTerm);
  }, [location.search]);

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

  const fetchCartCount = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/cart/${userId}`);
      const cart = res.data.cart;
      if (cart && cart.items) setCartCount(cart.items.length);
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  const addToCart = async (product) => {
    if (!user) {
      showToast("Please login to add items to cart", "warning");
      navigate("/login");
      return;
    }
    try {
      const userId = user._id;
      await axios.post("http://localhost:5000/api/cart", {
        userId, productId: product._id, quantity: 1,
      });
      showToast(`${product.name} added to cart!`, "success");
      fetchCartCount(userId);
    } catch (err) {
      console.error("Error adding to cart:", err.response?.data || err);
      showToast(`Failed to add to cart: ${err.response?.data?.message || err.message}`, "error");
    }
  };

  const handleProductClick = (product) => navigate(`/product/${product._id}`);

  const staticCategories = [
    { id: "all", name: "All Products", image: "/image/catall.jpg", path: null },
    { id: "coffee", name: "Coffee", image: "/image/catcoffee.jpg", path: "/coffee" },
    { id: "cupcakes", name: "Cupcakes", image: "/image/catcupcake.jpg", path: "/cupcake" },
    { id: "pie", name: "Pies", image: "/image/catpie.jpg", path: "/pie" },
    { id: "cakes", name: "Cakes", image: "/image/catcake.jpg", path: "/cakes" },
    { id: "gifting", name: "Gift Sets", image: "/image/catgift.jpg", path: "/gifting" }
  ];

  const filteredProducts = activeCategory === "all" 
    ? (Array.isArray(products) ? products : [])
    : (Array.isArray(products) ? products : []).filter(product => {
        if (!product.category) return false;
        const productCategory = typeof product.category === 'object' 
          ? product.category.name?.toLowerCase().trim()
          : product.category?.toLowerCase().trim();
        if (!productCategory) return false;
        const selectedCategory = activeCategory.toLowerCase();
        if (productCategory === selectedCategory) return true;
        if (selectedCategory === 'cakes' && (productCategory === 'cake' || productCategory === 'cakes')) return true;
        if (selectedCategory === 'cupcakes' && (productCategory === 'cupcake' || productCategory === 'cupcakes')) return true;
        if (selectedCategory === 'pie' && (productCategory === 'pie' || productCategory === 'pies')) return true;
        if (selectedCategory === 'coffee' && productCategory === 'coffee') return true;
        if (selectedCategory === 'gifting' && (productCategory === 'gift' || productCategory === 'gifting' || productCategory === 'gift sets')) return true;
        return false;
      });

  const searchFilteredProducts = searchQuery.trim()
    ? allProducts.filter(product => {
        const categoryName = typeof product.category === 'object' ? product.category.name : product.category;
        return (
          product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (categoryName && categoryName.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      })
    : filteredProducts;

  // Pagination calculations
  const totalPages = Math.ceil(searchFilteredProducts.length / ITEMS_PER_PAGE);
  const topSellingTotalPages = Math.ceil(topSellingProducts.length / ITEMS_PER_PAGE);
  
  const paginatedProducts = searchFilteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const paginatedTopSelling = topSellingProducts.slice(
    (topSellingPage - 1) * ITEMS_PER_PAGE,
    topSellingPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

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
      setActiveCategory("all");
    }
  };

  const handleNavClick = (path) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  const handleSubscribe = () => {
    showToast("Subscribed successfully! 🎉", "success");
  };

  return (
    <div className="homepage">
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
          <a onClick={() => handleNavClick("/profile")}>Profile</a>
          <a onClick={() => handleNavClick("/contactus")}>Contact Us</a>
          <a onClick={() => handleNavClick("/cart")}>Cart {cartCount > 0 && `(${cartCount})`}</a>
        </nav>
      </div>

      {/* Header */}
      <header className="header">
        <button className="hamburger-btn" onClick={() => setIsMenuOpen(true)}>
          <span></span><span></span><span></span>
        </button>

        <div className="header-logo" onClick={() => navigate("/userhomepage")}>
          <img src="/image/lumierelogo.png" alt="Café Lumière Logo" className="logo-image" />
          <span className="logo-text">Café Lumière</span>
        </div>

        <nav className="navbar">
          <a onClick={() => navigate("/userhomepage")}>Home</a>
          <a onClick={() => navigate("/aboutus2")}>About Us</a>
          <a onClick={() => handleNavClick("/contactus")}>Contact Us</a>
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

      {/* Hero Section */}
      <section className="hero" style={{ backgroundImage: "url('/image/homepage.jpg')" }}>
        <div className="hero-content">
          <h1 className="hero-title">Fresh Coffee & Pastries, Every Day</h1>
          <p className="hero-subtitle">Handcrafted with love, served with passion</p>
        </div>
      </section>

      {/* Category Section */}
      <section className="category-section">
        <h2 className="category-section-title">Shop by Category</h2>
        <div className="category-container">
          {staticCategories.map((cat) => (
            <div key={cat.id} className="category-item"
              onClick={() => { if (cat.path) navigate(cat.path); else { setActiveCategory(cat.id); setSearchQuery(""); } }}>
              <div className={`category-circle ${activeCategory === cat.id ? 'active' : ''}`}>
                <img src={cat.image} alt={cat.name} className="category-image" />
                <div className="category-overlay"></div>
              </div>
              <p className={`category-name ${activeCategory === cat.id ? 'active' : ''}`}>{cat.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Selling Products Section */}
      {topSellingProducts.length > 0 && !searchQuery.trim() && (
        <section className="menu-section top-selling-section">
          <div className="section-header-with-badge">
            <h2 className="section-title">
              <span className="trophy-icon"></span>
              Top Selling Products
            </h2>
            <div className="bestseller-badge">Customer Favorites</div>
          </div>
          <div className="menu-grid">
            {paginatedTopSelling.map((item, index) => (
              <div key={item._id} className="menu-card bestseller-card" onClick={() => handleProductClick(item)}>
                <div className="bestseller-rank">#{(topSellingPage - 1) * ITEMS_PER_PAGE + index + 1}</div>
                <div className="card-image-wrapper">
                  <img src={item.image ? (item.image.startsWith("http") ? item.image : `http://localhost:5000/${item.image}`) : "/image/placeholder.png"} alt={item.name || "Product"} />
                  <div className="card-overlay"><span className="view-details">View Details</span></div>
                  <div className="sold-badge">{item.soldQuantity} sold</div>
                </div>
                <div className="card-content">
                  <h3 className="product-name">{item.name || "Unnamed Product"}</h3>
                  <p className="product-desc">{item.description || "No description available"}</p>
                  <div className="card-footer">
                    <span className="price">₱{item.price?.toFixed(2) || "0.00"}</span>
                    <div className="quick-actions">
                      <button className="quick-cart-btn" onClick={(e) => { e.stopPropagation(); addToCart(item); }}>+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {topSellingTotalPages > 1 && (
            <Pagination
              currentPage={topSellingPage}
              totalPages={topSellingTotalPages}
              onPageChange={setTopSellingPage}
            />
          )}
        </section>
      )}

      {/* All Products Section */}
      <section className="menu-section">
        <h2 className="section-title">
          {searchQuery.trim() ? `Search Results for "${searchQuery}"` : activeCategory === "all" ? "All Products" : staticCategories.find(c => c.id === activeCategory)?.name}
        </h2>
        <div className="menu-grid">
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((item) => (
              <div key={item._id} className="menu-card" onClick={() => handleProductClick(item)}>
                <div className="card-image-wrapper">
                  <img src={item.image ? (item.image.startsWith("http") ? item.image : `http://localhost:5000/${item.image}`) : "/image/placeholder.png"} alt={item.name || "Product"} />
                  <div className="card-overlay"><span className="view-details">View Details</span></div>
                </div>
                <div className="card-content">
                  <h3 className="product-name">{item.name || "Unnamed Product"}</h3>
                  <p className="product-desc">{item.description || "No description available"}</p>
                  <div className="card-footer">
                    <span className="price">₱{item.price?.toFixed(2) || "0.00"}</span>
                    <div className="quick-actions">
                      <button className="quick-cart-btn" onClick={(e) => { e.stopPropagation(); addToCart(item); }}>+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-products">{searchQuery.trim() ? `No products found for "${searchQuery}" 😢` : "No products available in this category 😢"}</p>
          )}
        </div>
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </section>

      

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
              <p className="footer-description">Experience the perfect blend of ambiance, quality, and community at our specialty café.</p>
            </div>
            <div className="footer-column">
              <h4 className="footer-heading">Contact Us</h4>
              <div className="footer-contact">
                <div className="contact-item"><span className="contact-icon">📞</span><a href="tel:+639123456789">+63 912 345 6789</a></div>
                <div className="contact-item"><span className="contact-icon">📧</span><a href="mailto:info@cafelumiere.com">info@cafelumiere.com</a></div>
                <div className="contact-item"><span className="contact-icon">📍</span><p>123 Coffee Street, Brgy. San Vicente<br/>Malolos City, Bulacan 3000</p></div>
              </div>
            </div>
            <div className="footer-column">
              <h4 className="footer-heading">Follow Us</h4>
              <div className="social-links">
                <a href="https://facebook.com/cafelumiere" target="_blank" rel="noopener noreferrer" className="social-link facebook">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  <span>Facebook</span>
                </a>
                <a href="https://instagram.com/cafelumiere" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  <span>Instagram</span>
                </a>
              </div>
            </div>
            <div className="footer-column">
              <h4 className="footer-heading">Opening Hours</h4>
              <div className="hours-list">
                <div className="hours-item"><span>Monday - Friday</span><span>7:00 AM - 10:00 PM</span></div>
                <div className="hours-item"><span>Saturday - Sunday</span><span>8:00 AM - 11:00 PM</span></div>
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

export default UserHomePage;