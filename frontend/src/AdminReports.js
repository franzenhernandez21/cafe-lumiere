// AdminReports.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminReports.css";

// SVG Icon Components
const Icons = {
  DollarSign: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  Package: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/>
    </svg>
  ),
  Coffee: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  Refresh: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Award: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  ),
  ShoppingBag: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  )
};

const AdminReports = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        axios.get("http://localhost:5000/api/orders"),
        axios.get("http://localhost:5000/api/products"),
        axios.get("http://localhost:5000/api/users"),
      ]);

      const orders = ordersRes.data.orders || [];
      const products = productsRes.data.products || productsRes.data || [];
      const users = usersRes.data.users || usersRes.data || [];

      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const pendingOrders = orders.filter(o => o.status === "Pending").length;
      const completedOrders = orders.filter(o => o.status === "Completed").length;

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: products.length,
        totalUsers: users.length,
        pendingOrders,
        completedOrders,
      });

      setRecentOrders(orders.slice(0, 5));

      const productSales = {};
      orders.forEach(order => {
        order.items?.forEach(item => {
          if (productSales[item.name]) {
            productSales[item.name] += item.quantity;
          } else {
            productSales[item.name] = item.quantity;
          }
        });
      });

      const topProds = Object.entries(productSales)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
      
      setTopProducts(topProds);

    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="reports-container">
        <h2>Reports & Analytics</h2>
        <div className="loading-state">
          <div className="loading-spinner"><Icons.Refresh /></div>
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div className="header-title-wrapper">
          <span className="header-icon"><Icons.TrendingUp /></span>
          <h2 className="reports-title">Reports & Analytics</h2>
        </div>
        <button onClick={fetchReports} className="refresh-btn">
          <span className="btn-icon"><Icons.Refresh /></span>
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card revenue">
          <div className="stat-icon"><Icons.DollarSign /></div>
          <div className="stat-details">
            <h3>Total Revenue</h3>
            <p className="stat-value">₱{stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="stat-card orders">
          <div className="stat-icon"><Icons.Package /></div>
          <div className="stat-details">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats.totalOrders}</p>
          </div>
        </div>

        <div className="stat-card products">
          <div className="stat-icon"><Icons.Coffee /></div>
          <div className="stat-details">
            <h3>Total Products</h3>
            <p className="stat-value">{stats.totalProducts}</p>
          </div>
        </div>

        <div className="stat-card users">
          <div className="stat-icon"><Icons.Users /></div>
          <div className="stat-details">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon"><Icons.Clock /></div>
          <div className="stat-details">
            <h3>Pending Orders</h3>
            <p className="stat-value">{stats.pendingOrders}</p>
          </div>
        </div>

        <div className="stat-card completed">
          <div className="stat-icon"><Icons.CheckCircle /></div>
          <div className="stat-details">
            <h3>Completed Orders</h3>
            <p className="stat-value">{stats.completedOrders}</p>
          </div>
        </div>
      </div>

      {/* Two Columns */}
      <div className="reports-columns">
        {/* Recent Orders */}
        <div className="report-section">
          <div className="section-header">
            <span className="section-icon"><Icons.ShoppingBag /></span>
            <h3>Recent Orders</h3>
          </div>
          {recentOrders.length === 0 ? (
            <p className="no-data">No orders yet</p>
          ) : (
            <div className="recent-orders-list">
              {recentOrders.map(order => (
                <div key={order._id} className="recent-order-item">
                  <div className="order-avatar"><Icons.User /></div>
                  <div className="order-info">
                    <p className="order-customer">{order.user?.fullname || "N/A"}</p>
                    <p className="order-date">
                      <span className="date-icon"><Icons.Calendar /></span>
                      {new Date(order.order_date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="order-total">₱{order.total?.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="report-section">
          <div className="section-header">
            <span className="section-icon"><Icons.Award /></span>
            <h3>Top Selling Products</h3>
          </div>
          {topProducts.length === 0 ? (
            <p className="no-data">No sales data yet</p>
          ) : (
            <div className="top-products-list">
              {topProducts.map((prod, idx) => (
                <div key={idx} className="top-product-item">
                  <span className="product-rank">#{idx + 1}</span>
                  <span className="product-name">{prod.name}</span>
                  <span className="product-sales">{prod.quantity} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;