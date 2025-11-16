import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ResetPasswordPage.css";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [checking, setChecking] = useState(true);
  
  const navigate = useNavigate();
  const { token } = useParams();

  // ✅ Verify token on page load
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/users/reset-password/${token}`);
        const data = await res.json();

        if (data.success) {
          setValidToken(true);
        } else {
          setMessage("❌ " + data.message);
        }
      } catch (error) {
        setMessage("❌ Invalid or expired reset link");
      } finally {
        setChecking(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validate passwords
    if (password.length < 6) {
      setMessage("❌ Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("❌ Passwords do not match");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`http://localhost:5000/api/users/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ " + data.message);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage("❌ " + data.message);
      }
    } catch (error) {
      setMessage("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="reset-password-page">
        <div className="loading">Verifying reset link...</div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="reset-password-page">
        <div className="error-container">
          <h2>❌ Invalid Reset Link</h2>
          <p>{message}</p>
          <button onClick={() => navigate("/forgot-password")} className="btn">
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-card">
          <img src="/image/logo.png" alt="Cafe Logo" className="logo" />
          
          <h2>Reset Your Password</h2>
          <p className="subtitle">Enter your new password below</p>

          <form onSubmit={handleSubmit} className="reset-password-form">
            <div className="input-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="glass-input"
                minLength="6"
              />
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="glass-input"
                minLength="6"
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn" 
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            {message && (
              <p className={`message ${message.includes("✅") ? "success" : "error"}`}>
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;