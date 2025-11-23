import React, { useState, useEffect } from "react";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";

// SVG Icons
const Icons = {
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Blocked: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
    </svg>
  ),
  Loader: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  )
};

// Toast Component
const Toast = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success': return <Icons.Check />;
      case 'error': return <Icons.X />;
      case 'blocked': return <Icons.Blocked />;
      default: return <Icons.X />;
    }
  };

  return (
    <div className={`toast-notification ${notification.type}`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-content">
        <p className="toast-title">{notification.title}</p>
        <p className="toast-message">{notification.message}</p>
      </div>
      <button className="toast-close" onClick={onClose}>
        <Icons.X />
      </button>
      <div className="toast-progress"></div>
    </div>
  );
};

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showNotification = (type, title, message) => {
    setNotification({ type, title, message });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.blocked || (data.success === false && res.status === 403)) {
        showNotification("blocked", "Account Blocked", data.message || "Your account has been blocked. Please contact support.");
        setIsLoading(false);
        return;
      }

      if (data.success) {
        showNotification("success", "Welcome Back!", "Login successful! Redirecting...");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setTimeout(() => {
          navigate(data.user.role === "admin" ? "/adminpage" : "/userhomepage");
        }, 1500);
      } else {
        showNotification("error", "Login Failed", data.message || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      showNotification("error", "Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Toast Notification */}
      {notification && (
        <Toast notification={notification} onClose={() => setNotification(null)} />
      )}

      {/* Left side image */}
      <div className="left-side">
        <img src="/image/coffee.jpg" alt="Cafe background" />
      </div>

      {/* Login Form */}
      <form className="login-form" onSubmit={handleSubmit}>
        <img src="/image/lumierelogo.png" alt="Cafe Logo" className="logo" />
        <p className="subtitle">Please login to your account</p>

        <div className="input-group">
          <input type="email" name="email" placeholder="Email" className="glass-input"
            value={formData.email} onChange={handleChange} required disabled={isLoading} />
        </div>

        <div className="input-group">
          <input type="password" name="password" placeholder="Password" className="glass-input"
            value={formData.password} onChange={handleChange} required disabled={isLoading} />
        </div>

        <button type="submit" className="login-btn" disabled={isLoading}>
          {isLoading ? (
            <span className="btn-loading">
              <span className="spinner"><Icons.Loader /></span>
              Logging in...
            </span>
          ) : "Login"}
        </button>

        <a href="/forgot-password" className="forgot">Forgot Password?</a>

        <p className="signup-text">
          Don't have an account? <a href="/signup" className="signup-link">Sign up</a>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;