import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminOrderManagement.css";

function AdminOrderManagement() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, statusFilter, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/orders");
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      alert("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = orders;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.user?.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, {
        status: newStatus,
      });
      alert(`Order status updated to ${newStatus}!`);
      fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update order status");
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:5000/api/orders/${orderId}`);
        alert("Order deleted successfully!");
        fetchOrders();
      } catch (err) {
        console.error("Error deleting order:", err);
        alert("Failed to delete order");
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#ffa500",
      paid: "#4caf50",
      completed: "#2196f3",
      cancelled: "#f44336",
    };
    return colors[status.toLowerCase()] || "#666";
  };

  return (
    <div className="admin-orders-container">
      <div className="orders-header">
        <h2 className="orders-title">Orders Management</h2>
        <button onClick={fetchOrders} className="refresh-btn" disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, or Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="status-filters">
          <button
            className={`filter-btn ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All Orders
          </button>
          <button
            className={`filter-btn ${statusFilter === "pending" ? "active" : ""}`}
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${statusFilter === "paid" ? "active" : ""}`}
            onClick={() => setStatusFilter("paid")}
          >
            Paid
          </button>
          <button
            className={`filter-btn ${statusFilter === "completed" ? "active" : ""}`}
            onClick={() => setStatusFilter("completed")}
          >
            Completed
          </button>
          <button
            className={`filter-btn ${statusFilter === "cancelled" ? "active" : ""}`}
            onClick={() => setStatusFilter("cancelled")}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="loading-state">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📦</span>
          <p>No orders found</p>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header-section">
                <div className="order-id">
                  <strong>Order ID:</strong> {order._id}
                </div>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status}
                </span>
              </div>

              <div className="order-details">
                <div className="detail-row">
                  <span className="detail-label">Customer:</span>
                  <span className="detail-value">
                    {order.user?.fullname || "N/A"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">
                    {order.user?.email || "N/A"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">
                    {order.user?.phone || "N/A"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Order Date:</span>
                  <span className="detail-value">
                    {new Date(order.order_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Payment Method:</span>
                  <span className="detail-value">{order.payment_method}</span>
                </div>
              </div>

              <div className="order-items">
                <strong>Items:</strong>
                <ul>
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.name} x{item.quantity} - ₱
                      {item.price_at_purchase?.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="order-footer">
                <div className="total-amount">
                  <strong>Total: ₱{order.total?.toFixed(2)}</strong>
                </div>
                <div className="order-actions">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="view-btn"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => deleteOrder(order._id)}
                    className="delete-btn"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedOrder(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h4>Customer Information</h4>
                <p>
                  <strong>Name:</strong> {selectedOrder.user?.fullname}
                </p>
                <p>
                  <strong>Email:</strong> {selectedOrder.user?.email}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedOrder.user?.phone || "N/A"}
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  {selectedOrder.user?.address || "N/A"}
                </p>
              </div>

              <div className="modal-section">
                <h4>Order Information</h4>
                <p>
                  <strong>Order ID:</strong> {selectedOrder._id}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(selectedOrder.order_date).toLocaleString()}
                </p>
                <p>
                  <strong>Payment:</strong> {selectedOrder.payment_method}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    style={{ color: getStatusColor(selectedOrder.status) }}
                  >
                    {selectedOrder.status}
                  </span>
                </p>
              </div>

              <div className="modal-section">
                <h4>Items</h4>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="modal-item">
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <span>₱{item.price_at_purchase?.toFixed(2)}</span>
                  </div>
                ))}
                <div className="modal-total">
                  <strong>Total:</strong>
                  <strong>₱{selectedOrder.total?.toFixed(2)}</strong>
                </div>
              </div>

              <div className="modal-section">
                <h4>Update Status</h4>
                <div className="status-buttons">
                  <button
                    onClick={() =>
                      updateOrderStatus(selectedOrder._id, "Pending")
                    }
                    className="status-btn pending"
                    disabled={loading}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder._id, "Paid")}
                    className="status-btn paid"
                    disabled={loading}
                  >
                    Paid
                  </button>
                  <button
                    onClick={() =>
                      updateOrderStatus(selectedOrder._id, "Completed")
                    }
                    className="status-btn completed"
                    disabled={loading}
                  >
                    Completed
                  </button>
                  <button
                    onClick={() =>
                      updateOrderStatus(selectedOrder._id, "Cancelled")
                    }
                    className="status-btn cancelled"
                    disabled={loading}
                  >
                    Cancelled
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default AdminOrderManagement;