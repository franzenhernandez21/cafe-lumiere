import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Welcomepage.css";

const Welcomepage = () => {
  const navigate = useNavigate();
  const [activeProduct, setActiveProduct] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const products = [
    {
      name: "Coffee",
      image: "/image/coffeeopen.jpg",
      description: "Premium roasted coffee beans from around the world. Experience rich flavors and aromatic blends that awaken your senses every morning."
    },
    {
      name: "Cakes",
      image: "/image/cakeopen.jpg",
      description: "Decadent handcrafted cakes made with love. From classic flavors to innovative creations, each slice is a celebration."
    },
    {
      name: "Pies",
      image: "/image/pieopen.jpg",
      description: "Buttery, flaky pies filled with seasonal fruits and cream. Traditional recipes passed down through generations."
    },
    {
      name: "Cupcakes",
      image: "/image/cupcakeopen.jpg",
      description: "Adorable mini delights topped with silky frosting. Perfect for any occasion, big or small."
    },
    {
      name: "Gifting",
      image: "/image/giftingopen.jpg",
      description: "Beautifully packaged gift sets for your loved ones. Share the joy of artisan coffee and pastries."
    }
  ];

  const handleDiscover = () => navigate("/login");
  const handleGuestMode = () => navigate("/userhomepage");

  return (
    <div>
      {/* ===== HERO SECTION ===== */}
      <div
        className="bakery-container"
        style={{
          backgroundImage: "url('/image/wepage.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <header className="bakery-header">
          <div className="logo"></div>
          <ul className="nav-links">
            <li onClick={() => navigate("/aboutus")}>About Us</li>
            <li onClick={() => navigate("/blogs")}>Blogs</li>
            <li onClick={() => navigate("/contactus")}>Contact Us</li>
          </ul>
        </header>
        <main className="bakery-main">
          <div className="text-section">
            <h1>
              Welcome to Café Lumière
              <span className="highlight-lightbrown">Coffee & Dessert!</span>
            </h1>
            <p className="tagline">Living the Coffee Life, One Cup at a Time</p>
            <div className="buttons-container">
              <button className="btn order-btn" onClick={handleDiscover}>Discover Me</button>
              <button className="btn guest-btn" onClick={handleGuestMode}>Guest Mode</button>
            </div>
          </div>
        </main>
      </div>

      {/* ===== FRESH PRODUCTS INTERACTIVE ===== */}
      <section 
        className="fresh-products-section"
        style={{
          opacity: scrollY > 200 ? 1 : 0,
          transform: scrollY > 200 ? 'translateY(0)' : 'translateY(50px)',
          transition: 'all 0.8s ease-out'
        }}
      >
        <h2>Our Fresh Products</h2>
        <p className="section-subtitle">Discover the artistry in every creation</p>
        
        <div className="products-container">
          <div className="products-circles">
            {products.map((product, index) => (
              <div
                key={index}
                className={`product-circle ${activeProduct === index ? 'active' : ''}`}
                onClick={() => setActiveProduct(index)}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="circle-image-wrapper">
                  <img src={product.image} alt={product.name} />
                  <div className="circle-overlay">
                    <span>{product.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="product-details">
            <div className="detail-card">
              <h3>{products[activeProduct].name}</h3>
              <div className="detail-image">
                <img src={products[activeProduct].image} alt={products[activeProduct].name} />
              </div>
              <p>{products[activeProduct].description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SERVING SECTION ===== */}
      <section 
        className="serving-section"
        style={{
          opacity: scrollY > 600 ? 1 : 0,
          transition: 'opacity 0.8s ease-out'
        }}
      >
        <img src="/image/cafelumietre.gif" alt="Serving Happiness" className="serving-video" />
        <div className="serving-overlay">
          <h2>Serving Happiness in Every Bite</h2>
          <p>At Café Lumière, every cup of coffee and pastry is crafted with care, served fresh, and presented beautifully. We believe in creating moments of delight for every guest.</p>
          <p>Join us and savor the warm ambiance, delicious flavors, and impeccable service that make our café a true haven for coffee lovers.</p>
        </div>
      </section>

      {/* ===== FOOTER SECTION ===== */}
      <footer className="footer-section">
        <div className="footer-container">
          <div className="footer-content">
            {/* About Section */}
            <div className="footer-column">
              <h3 className="footer-logo">Café Lumière</h3>
              <p className="footer-tagline">Living the Coffee Life, One Cup at a Time</p>
              <p className="footer-description">
                Experience the perfect blend of ambiance, quality, and community at our specialty café.
              </p>
            </div>

            {/* Contact Section */}
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

            {/* Social Media Section */}
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

            {/* Hours Section */}
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
};

export default Welcomepage;