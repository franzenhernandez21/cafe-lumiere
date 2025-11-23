import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
  });

  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        showNotification("success", "Signup successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        showNotification("error", data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      showNotification("error", "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="signup-page">
      {/* Notification Toast */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-icon">
            {notification.type === "success" ? "✓" : "✕"}
          </div>
          <div className="notification-content">
            <p className="notification-message">{notification.message}</p>
          </div>
          <button 
            className="notification-close"
            onClick={() => setNotification(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Right side image */}
      <div className="right-side">
        <img src="/image/cake.jpg" alt="Cafe background" />
      </div>

      {/* Signup Form */}
      <form className="signup-form" onSubmit={handleSubmit}>
        <img src="/image/lumierelogo.png" alt="Cafe Logo" className="logo" />

        <p className="subtitle">Create your account</p>

        <input
          type="text"
          name="fullname"
          placeholder="Full Name"
          className="glass-input"
          value={formData.fullname}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          className="glass-input"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="glass-input"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="glass-input"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit" className="signup-btn">Sign Up</button>

        <p className="login-text">
          Already have an account?{" "}
          <a href="/login" className="login-link">Login</a>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;