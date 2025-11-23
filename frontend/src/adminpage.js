import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./adminpage.css";
import AdminProductManagement from "./AdminProductmanagement";
import UserManagement from "./usermanangement"; 
import AdminOrderManagement from "./AdminOrderManagement";
import AdminCategories from "./AdminCategories"; // ✅ NEW IMPORT
import AdminReports from "./AdminReports"; // ✅ NEW IMPORT
import axios from "axios";

// SVG Icons
const LayoutDashboardIcon = () => (
  <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const PackageIcon = () => (
  <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const ShoppingCartIcon = () => (
  <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const FolderTreeIcon = () => (
  <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const FileTextIcon = () => (
  <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const LogOutIcon = () => (
  <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const DollarSignIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Hamburger Icon
const HamburgerIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

// Close Icon
const CloseIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

function AdminPage() {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (page === "dashboard") {
      fetchDashboardData();
    }
  }, [page]);

  // Close sidebar on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        axios.get("http://localhost:5000/api/products"),
        axios.get("http://localhost:5000/api/orders"),
        axios.get("http://localhost:5000/api/users")
      ]);

      const products = productsRes.data.products || productsRes.data || [];
      const orders = ordersRes.data.orders || ordersRes.data || [];
      const users = usersRes.data.users || usersRes.data || [];

      const revenue = orders
        .filter(order => order.status !== "Cancelled")
        .reduce((sum, order) => sum + (order.total || 0), 0);

      const activities = generateRecentActivities(orders, users, products);

      setDashboardData({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalUsers: users.length,
        totalRevenue: revenue,
        recentActivities: activities
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecentActivities = (orders, users, products) => {
    const activities = [];

    const recentOrders = orders
      .sort((a, b) => new Date(b.order_date) - new Date(a.order_date))
      .slice(0, 3);

    recentOrders.forEach(order => {
      const timeAgo = getTimeAgo(order.order_date);
      activities.push({
        text: `New order #${order._id.slice(-6)} received - ₱${order.total?.toFixed(2)}`,
        time: timeAgo,
        type: "green",
        timestamp: new Date(order.order_date)
      });
    });

    const recentUsers = users
      .filter(user => user.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 2);

    recentUsers.forEach(user => {
      const timeAgo = getTimeAgo(user.createdAt);
      activities.push({
        text: `New user ${user.fullname} registered`,
        time: timeAgo,
        type: "blue",
        timestamp: new Date(user.createdAt)
      });
    });

    const recentProducts = products
      .filter(product => product.date_added)
      .sort((a, b) => new Date(b.date_added) - new Date(a.date_added))
      .slice(0, 2);

    recentProducts.forEach(product => {
      const timeAgo = getTimeAgo(product.date_added);
      activities.push({
        text: `Product '${product.name}' added to inventory`,
        time: timeAgo,
        type: "orange",
        timestamp: new Date(product.date_added)
      });
    });

    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);
  };

  const getTimeAgo = (date) => {
    if (!date) return "recently";
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    if (diffMs < 0 || isNaN(diffMs)) return "recently";
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleMenuClick = (id) => {
    setPage(id);
    setSidebarOpen(false); // Close drawer on mobile after selection
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
    { id: "products", label: "Products", icon: PackageIcon },
    { id: "orders", label: "Orders", icon: ShoppingCartIcon },
    { id: "users", label: "Users", icon: UsersIcon },
    { id: "categories", label: "Categories", icon: FolderTreeIcon },
    { id: "reports", label: "Reports", icon: FileTextIcon },
  ];

  const stats = [
    { label: "Total Products", value: loading ? "..." : dashboardData.totalProducts, icon: PackageIcon, colorClass: "blue", trend: loading ? "..." : `${dashboardData.totalProducts} items` },
    { label: "Total Orders", value: loading ? "..." : dashboardData.totalOrders, icon: ShoppingCartIcon, colorClass: "green", trend: loading ? "..." : "All time" },
    { label: "Total Users", value: loading ? "..." : dashboardData.totalUsers, icon: UsersIcon, colorClass: "orange", trend: loading ? "..." : "Registered" },
    { label: "Total Revenue", value: loading ? "..." : `₱${dashboardData.totalRevenue.toFixed(2)}`, icon: DollarSignIcon, colorClass: "amber", trend: loading ? "..." : "Sales" },
  ];

  const quickActions = [
    { title: "Add New Product", description: "Expand your inventory", icon: PackageIcon, colorClass: "blue", action: () => handleMenuClick("products") },
    { title: "View Orders", description: "Manage pending orders", icon: ShoppingCartIcon, colorClass: "green", action: () => handleMenuClick("orders") },
    { title: "Generate Report", description: "View sales analytics", icon: FileTextIcon, colorClass: "orange", action: () => handleMenuClick("reports") },
  ];

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
          <HamburgerIcon />
        </button>
        <div className="mobile-logo">
          <img src="/image/lumierelogo.png" alt="Café Lumière" className="mobile-logo-img" />
          <span>Lumière</span>
        </div>
        <div className="mobile-header-spacer"></div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Close Button (Mobile) */}
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
          <CloseIcon />
        </button>

        {/* Logo */}
        <div className="logo-container">
          <img src="/image/lumierelogo.png" alt="Café Lumière" className="sidebar-logo" />
          <div className="logo-text">
            <h1 className="logo-title">Lumière</h1>
            <p className="logo-subtitle">Admin Dashboard</p>
          </div>
        </div>

        {/* Menu */}
        <nav className="menu-container">
          <ul className="menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id} className={page === item.id ? "active" : ""}>
                  <button className="menu-item" onClick={() => handleMenuClick(item.id)}>
                    <Icon />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="logout-container">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOutIcon />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {page === "dashboard" && (
          <div className="dashboard-content">
            <div className="dashboard-header">
              <h2 className="dashboard-title">Welcome Back! ☕</h2>
              <p className="dashboard-subtitle">Here's what's happening with your store today.</p>
            </div>

            <div className="stats-grid">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="stat-card">
                    <div className="stat-card-header">
                      <div className={`stat-icon ${stat.colorClass}`}><Icon /></div>
                      <div className="stat-trend"><TrendingUpIcon />{stat.trend}</div>
                    </div>
                    <h3 className="stat-label">{stat.label}</h3>
                    <p className="stat-value">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="activity-card">
              <h3 className="activity-title">Recent Activity</h3>
              {loading ? (
                <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Loading activities...</p>
              ) : dashboardData.recentActivities.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No recent activities yet</p>
              ) : (
                <div className="activity-list">
                  {dashboardData.recentActivities.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-content">
                        <div className={`activity-dot ${activity.type}`}></div>
                        <span className="activity-text">{activity.text}</span>
                      </div>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="quick-actions-grid">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button key={index} className={`action-card ${action.colorClass}`} onClick={action.action}>
                    <div className="action-icon"><Icon /></div>
                    <h4 className="action-title">{action.title}</h4>
                    <p className="action-description">{action.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {page === "products" && <AdminProductManagement />}
        {page === "orders" && <AdminOrderManagement />}
        {page === "users" && <UserManagement />}
        {page === "categories" && <AdminCategories />}
        {page === "reports" && <AdminReports />}
      </main>
    </div>
  );
}

export default AdminPage;