import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import './blogs.css';

const CafeBlog = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [likedPosts, setLikedPosts] = useState([]);
  const [bookmarked, setBookmarked] = useState([]);

  const posts = [
    {
      id: 1,
      title: "A Pretium Enim Dolor Donec Eu Venenatis Curabitur",
      author: "Adrian Eleuther",
      date: "August 22, 2025",
      category: "Travel",
      image: "/image/blog1.jpg",
      excerpt: "Discover the hidden gems of artisan coffee culture...",
      featured: true,
    },
    {
      id: 2,
      title: "Integer Maecenas Eget Viverra",
      author: "Eunice Park",
      date: "August 15, 2025",
      category: "Lifestyle",
      image: "/image/blog2.jpg",
      excerpt: "Morning rituals that transform your daily brew...",
    },
    {
      id: 3,
      title: "A Vivamus Penatibus Enim Sit Et Quam Vel Consequat",
      author: "Marcus Lee",
      date: "July 30, 2025",
      category: "Automotive",
      image: "/image/blog3.jpg",
      excerpt: "Coffee on the road: A traveler's guide...",
    },
    {
      id: 4,
      title: "Maecenas Trincidunt Eget Libero Massa Vitae",
      author: "Jasmine Yu",
      date: "July 20, 2025",
      category: "Adventure",
      image: "/image/blog4.jpg",
      excerpt: "Adventures in coffee tasting around the world...",
    },
  ];

  const toggleLike = (id) => {
    setLikedPosts(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleBookmark = (id) => {
    setBookmarked(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const navigate = useNavigate();

  return (
    <div>
      {/* ===== HEADER SECTION ===== */}
      <div
        className="bakery-container"
        style={{
          backgroundImage: "url('/image/abouutus.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          position: "relative",
        }}
      >
        <header className="bakery-header">
          <div className="logo"></div>
          <ul className="nav-links">
           <li onClick={() => navigate("/")}>Home</li>
            <li onClick={() => navigate("/aboutus")}>About Us</li>
            <li onClick={() => navigate("/blogs")}>Blogs</li>
            <li onClick={() => navigate("/contactus")}>Contact Us</li>
          </ul>
        </header>
        <main className="bakery-main" style={{ padding: "60px 80px" }}>
          <div className="text-section">
            <h1>Explore Our <span className="highlight-lightbrown">Blog Stories</span></h1>
          </div>
        </main>
      </div>

      {/* Main Blog Container */}
      <div className="blog-container">
        {/* Floating Coffee Beans Animation */}
        <div className="beans-container">
          {[...Array(6)].map((_, i) => (
            <svg 
              key={i}
              className="floating-bean"
              style={{
                animationDelay: `${i * 2}s`,
                left: `${Math.random() * 100}%`,
              }}
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
              <line x1="6" x2="6" y1="2" y2="4" />
              <line x1="10" x2="10" y1="2" y2="4" />
              <line x1="14" x2="14" y1="2" y2="4" />
            </svg>
          ))}
        </div>

      {/* Featured Post */}
      <section 
        className={`featured-post ${hoveredCard === 'featured' ? 'hovered' : ''}`}
        onMouseEnter={() => setHoveredCard('featured')}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div className="featured-content">
          <div className="featured-text">
            <span className="category-badge">{posts[0].category}</span>
            <h2 className="featured-title">{posts[0].title}</h2>
            <p className="featured-excerpt">{posts[0].excerpt}</p>
            <div className="meta">
              <span className="author">{posts[0].author}</span>
              <span className="date">• {posts[0].date}</span>
            </div>
            <div className="action-bar">
              <button className="read-more-btn">
                Read More
                <span className="arrow">→</span>
              </button>
              <div className="social-actions">
                <button 
                  className="icon-btn"
                  onClick={() => toggleLike(posts[0].id)}
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill={likedPosts.includes(posts[0].id) ? '#d4a574' : 'none'}
                    stroke="#d4a574"
                    strokeWidth="2"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </button>
                <button className="icon-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4a574" strokeWidth="2">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
                    <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className="featured-image-container">
            <div 
              className="featured-image"
              style={{ backgroundImage: `url(${posts[0].image})` }}
            />
            <div className="image-overlay" />
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="blog-grid">
        <div className="posts-column">
          {posts.slice(1).map((post) => (
            <article 
              key={post.id}
              className={`post-card ${hoveredCard === post.id ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredCard(post.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="post-image-wrapper">
                <img src={post.image} alt={post.title} className="post-image" />
                <div className={`hover-overlay ${hoveredCard === post.id ? 'visible' : ''}`} />
                <button 
                  className={`bookmark-btn ${hoveredCard === post.id ? 'visible' : ''}`}
                  onClick={() => toggleBookmark(post.id)}
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill={bookmarked.includes(post.id) ? '#fff' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                  </svg>
                </button>
              </div>
              <div className="post-content">
                <span className="category-tag">{post.category}</span>
                <h3 className="post-title">{post.title}</h3>
                <p className="post-excerpt">{post.excerpt}</p>
                <div className="post-meta">
                  <span className="post-author">{post.author}</span>
                  <span className="post-date">• {post.date}</span>
                </div>
                <div className="post-actions">
                  <button className="post-read-btn">
                    Continue Reading
                  </button>
                  <button 
                    className="like-btn"
                    onClick={() => toggleLike(post.id)}
                  >
                    <svg 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill={likedPosts.includes(post.id) ? '#d4a574' : 'none'}
                      stroke="#d4a574"
                      strokeWidth="2"
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Sidebar */}
        <aside className="sidebar">
          {/* Featured Sidebar */}
          <div className="sidebar-card">
            <div className="sidebar-image-wrapper">
              <img src="/image/blog5.jpg" alt="Featured" className="sidebar-image" />
              <div className="sidebar-overlay">
                <h4 className="sidebar-title">
                  Vici Consequat Justo Enim Adipiscing Luctus
                </h4>
                <button className="sidebar-btn">Explore</button>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="newsletter-card">
            <svg className="newsletter-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
              <line x1="6" x2="6" y1="2" y2="4" />
              <line x1="10" x2="10" y1="2" y2="4" />
              <line x1="14" x2="14" y1="2" y2="4" />
            </svg>
            <h4 className="newsletter-title">Daily Brew Newsletter</h4>
            <p className="newsletter-text">
              Get fresh stories delivered to your inbox every morning
            </p>
            <input 
              type="email" 
              placeholder="your@email.com" 
              className="email-input"
            />
            <button className="subscribe-btn">Subscribe</button>
          </div>

          {/* Instagram */}
          <div className="insta-card">
            <div className="insta-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4a574" strokeWidth="2">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              <h4 className="insta-title">@café_chronicles</h4>
            </div>
            <div className="insta-grid">
              {[6, 7, 8, 9].map((num) => (
                <div 
                  key={num}
                  className="insta-image-wrapper"
                >
                  <img 
                    src={`/image/blog${num}.jpg`} 
                    alt={`insta${num}`} 
                    className="insta-image"
                  />
                  <div className="insta-hover">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
      </div>

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

export default CafeBlog;