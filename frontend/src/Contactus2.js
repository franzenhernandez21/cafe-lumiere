import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Contactus2.css';

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
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  return (
    <div className="page-wrapper">
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
        ))}
      </div>

      {/* ===== HEADER SECTION (WELCOME PAGE STYLE) ===== */}
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
          {/* Logo Section */}
          <div className="header-logo">
            <img src="/image/lumierelogo.png" alt="Café Lumière Logo" className="logo-image" />
            <span className="logo-text">Café Lumière</span>
          </div>

          {/* Navigation */}
          <nav className="nav-links">
            <li onClick={() => navigate("/")}>Home</li>
            <li onClick={() => navigate("/aboutus")}>About Us</li>
            <li onClick={() => navigate("/Contactus2")}>Contact Us</li>
          </nav>
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
                      href="https://facebook.com/cafelumiere" 
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
                  href="https://www.facebook.com/kaito.203846" 
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