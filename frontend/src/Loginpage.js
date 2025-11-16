import React, { useState } from "react";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Login successful!");

        // ✅ Store token and user info
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // ✅ Redirect based on role
        if (data.user.role === "admin") {
          navigate("/adminpage");
        } else {
          navigate("/userhomepage");
        }
      } else {
        setMessage("❌ " + data.message);
      }
    } catch (error) {
      console.error("Login Error:", error);
      setMessage("❌ Something went wrong. Please try again.");
    }
  };

  return (
    <div className="login-page">
      {/* Left side image */}
      <div className="left-side">
        <img src="/image/coffee.jpg" alt="Cafe background" />
      </div>

      {/* Right side login form */}
      <form className="login-form" onSubmit={handleSubmit}>
        <img src="/image/logo.png" alt="Cafe Logo" className="logo" />

        <p className="subtitle">Please login to your account</p>

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

        <button type="submit" className="login-btn">Login</button>

        {message && <p className="login-message">{message}</p>}

        <a href="/forgot-password" className="forgot">Forgot Password?</a>

        <p className="signup-text">
          Don’t have an account?{" "}
          <a href="/signup" className="signup-link">Sign up</a>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
