import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./aboutus.css";

const teamMembers = [
  {
    name: "Mark Joseph Maninang",
    role: "UI / UX Developer",
    email: "markjosephmaninang@cafelumiere.com",
    image: "/image/joseph.png",
    bio: "Passionate developer with expertise in full-stack development and creating seamless user experiences."
  },
  {
    name: "Franzen Hernandez",
    role: "Full Stack Developer",
    email: "franzenhernandez@cafelumiere.com",
    image: "/image/zeyn.png",
    bio: "Creative designer focused on crafting beautiful and intuitive interfaces that users love."
  },
  {
    name: "Ruel Angelo Marquez",
    role: "Backend Developer",
    email: "ruelangelomarquez@cafelumiere.com",
    image: "/image/rule.png",
    bio: "Strategic thinker dedicated to delivering exceptional products that exceed customer expectations."
  },
  {
    name: "Justine Dave Arceo",
    role: "Backend Developer",
    email: "justinedacearceo@cafelumiere.com",
    image: "/image/arceo.jpg",
    bio: "Dynamic marketer with a passion for building brand awareness and engaging customer communities."
  },
];

const goalsData = [
  {
    id: 1,
    title: "Expand Our Reach",
    description: "Open 5 new branches across the region by 2026, bringing our specialty coffee and pastries to more communities.",
    image: "/image/expand.png"
  },
  {
    id: 2,
    title: "Sustainable Practices",
    description: "Implement 100% eco-friendly packaging and source all ingredients from local, sustainable farms by 2025.",
    image: "/image/package.png"
  },
  {
    id: 3,
    title: "Training Excellence",
    description: "Launch our Barista Academy to train and certify the next generation of coffee professionals.",
    image: "/image/more.jpg"
  },
  {
    id: 4,
    title: "Innovation First",
    description: "Introduce seasonal specialty drinks and collaborate with local artisans to create unique menu items.",
    image: "/image/drinks.png"
  },
  {
    id: 5,
    title: "Community Impact",
    description: "Partner with local charities and donate 5% of profits to support education and youth programs.",
    image: "/image/charity.jpg"
  },
  {
    id: 6,
    title: "Customer Excellence",
    description: "Maintain a 95%+ customer satisfaction rating through exceptional service and quality products.",
    image: "/image/coomunity.jpg"
  }
];

export default function AboutUs() {
  const navigate = useNavigate();
  const [selectedMember, setSelectedMember] = useState(null);
  const [clickedGoal, setClickedGoal] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openModal = (member) => {
    setSelectedMember(member);
  };

  const closeModal = () => {
    setSelectedMember(null);
  };

  const handleGoalClick = (goalId) => {
    setClickedGoal(goalId);
    setTimeout(() => {
      setClickedGoal(null);
    }, 1000);
  };

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
          backgroundAttachment: "fixed",
          position: "relative",
        }}
      >
        <header className={`bakery-header ${isScrolled ? 'scrolled' : ''}`}>
          {/* Logo Section */}
          <div className="header-logo" onClick={() => navigate("/")}>
            <img src="/image/lumierelogo.png" alt="Café Lumière Logo" className="logo-image" />
            <span className="logo-text">Café Lumière</span>
          </div>

          {/* Navigation */}
          <nav className="nav-links">
            <a onClick={() => navigate("/")}>Home</a>
            <a onClick={() => navigate("/aboutus")}>About Us</a>
            <a onClick={() => navigate("/Contactus2")}>Contact Us</a>
          </nav>
        </header>
        <main className="bakery-main">
          <div className="text-section">
            <h1>Meet Our <span className="highlight-lightbrown">Amazing Team</span></h1>
          </div>
        </main>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <section className="about-section">
        <h2 className="section-title"></h2>
        <div className="card-container">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="team-card"
              onClick={() => openModal(member)}
            >
              <div className="team-card-image-wrapper">
                <img src={member.image} alt={member.name} className="team-card-image" />
              </div>
              <div className="team-card-content">
                <h3 className="team-card-name">{member.name}</h3>
                <p className="team-card-role">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== MODAL POPUP ===== */}
      {selectedMember && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>
            <div className="modal-body">
              <img src={selectedMember.image} alt={selectedMember.name} className="modal-image" />
              <div className="modal-details">
                <h2>{selectedMember.name}</h2>
                <div className="detail-row">
                  <span className="detail-label">Role:</span>
                  <span className="detail-value">{selectedMember.role}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedMember.email}</span>
                </div>
                <div className="bio-section">
                  <h3>About</h3>
                  <p>{selectedMember.bio}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== OUR GOALS AND PLAN SECTION ===== */}
      <section 
        className="goals-section"
        style={{
          backgroundImage: "url('/image/goals-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          position: "relative"
        }}
      >
        <div className="goals-overlay"></div>
        <div className="goals-container">
          <h2 className="goals-title">Our Goals & Future Plans</h2>
          <p className="goals-intro">
            At Café Lumière, we're committed to excellence and continuous growth. Here's what we're working towards:
          </p>
          
          <div className="goals-grid">
            {goalsData.map((goal) => (
              <div 
                key={goal.id}
                className={`goal-card ${clickedGoal === goal.id ? 'goal-clicked' : ''}`}
                onClick={() => handleGoalClick(goal.id)}
              >
                <div className="goal-image-container">
                  <img 
                    src={goal.image} 
                    alt={goal.title} 
                    className="goal-image"
                  />
                  <div className="goal-overlay">
                    <div className="goal-icon">{goal.icon}</div>
                  </div>
                </div>
                <h3>{goal.title}</h3>
                <p>{goal.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER SECTION ===== */}
      <footer className="footer-section">
        <div className="footer-container">
          <div className="footer-content">
            {/* About Section */}
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
}