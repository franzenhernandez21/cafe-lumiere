import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./adminpage.css";
import AdminProductManagement from "./AdminProductmanagement";
import UserManagement from "./usermanangement"; 
import AdminOrderManagement from "./AdminOrderManagement";

function AdminPage() {
  const [page, setPage] = useState("dashboard");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h2 className="logo">☕ Lumière Admin</h2>
        <ul className="menu">
          <li className={page === "dashboard" ? "active" : ""} onClick={() => setPage("dashboard")}>
            📊 Dashboard
          </li>
          <li className={page === "products" ? "active" : ""} onClick={() => setPage("products")}>
            🛍️ Product Management
          </li>
          <li className={page === "orders" ? "active" : ""} onClick={() => setPage("orders")}>
            🧾 Orders Management
          </li>
          <li className={page === "users" ? "active" : ""} onClick={() => setPage("users")}>
            👥 Users Management
          </li>
          <li onClick={() => alert("Categories menu coming soon!")}>
            🏷️ Categories Menu
          </li>
          <li onClick={() => alert("Reports coming soon!")}>
            📈 Reports
          </li>
          <li onClick={handleLogout}>
            🚪 Logout
          </li>
        </ul>
      </aside>

      <main className="main-content">
        {page === "dashboard" && (
          <div className="dashboard-content">
            <h2>📊 Welcome to the Admin Dashboard!</h2>
            <div className="dashboard-stats">
              <div className="stat-card">
                <h3>Total Products</h3>
                <p className="stat-number">—</p>
              </div>
              <div className="stat-card">
                <h3>Total Orders</h3>
                <p className="stat-number">—</p>
              </div>
              <div className="stat-card">
                <h3>Total Users</h3>
                <p className="stat-number">—</p>
              </div>
              <div className="stat-card">
                <h3>Revenue</h3>
                <p className="stat-number">₱—</p>
              </div>
            </div>
          </div>
        )}
        {page === "products" && <AdminProductManagement />}
        {page === "orders" && <AdminOrderManagement />}
        {page === "users" && <UserManagement />}
      </main>
    </div>
  );
}

export default AdminPage;