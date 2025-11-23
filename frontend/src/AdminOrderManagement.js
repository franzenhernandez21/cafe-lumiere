import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminOrderManagement.css";

function AdminOrderManagement() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [notification, setNotification] = useState(null);

  // ✅ Notification Helper
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [statusFilter, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/orders");
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      showNotification("error", "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = orders;

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.status.toLowerCase() === statusFilter.toLowerCase()
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
      showNotification("success", `Order status updated to ${newStatus}!`);
      fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      console.error("Error updating status:", err);
      showNotification("error", "Failed to update order status");
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/orders/${orderId}`);
      showNotification("success", "Order deleted successfully!");
      fetchOrders();
      setShowDeleteConfirm(false);
      setOrderToDelete(null);
      setSelectedOrder(null);
    } catch (err) {
      console.error("Error deleting order:", err);
      showNotification("error", "Failed to delete order");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (orderId) => {
    setOrderToDelete(orderId);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setOrderToDelete(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#d4a574",
      paid: "#8ab446",
      completed: "#5a9fd4",
      cancelled: "#d17a5a",
    };
    return colors[status.toLowerCase()] || "#666";
  };

  return (
    <div className="admin-orders-container">
      {/* ✅ Notification Toast */}
      {notification && (
        <div className={`order-notification ${notification.type}`}>
          <div className="order-notification-icon">
            {notification.type === "success" ? "✓" : "✕"}
          </div>
          <p className="order-notification-message">{notification.message}</p>
          <button className="order-notification-close" onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      <div className="orders-header">
        <h2 className="orders-title">Orders Management</h2>
        <button onClick={fetchOrders} className="refresh-btn" disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      <div className="filters-container">
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
                    onClick={() => handleDeleteClick(order._id)}
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

      {/* Enhanced Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-enhanced" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header with Cafe Lumière branding */}
            <div className="modal-header-enhanced">
              <div className="cafe-brand">
                <span className="cafe-name">Cafe Lumière ☕</span>
                <span className="modal-subtitle">Order Details</span>
              </div>
              <button
                className="close-btn-enhanced"
                onClick={() => setSelectedOrder(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body-enhanced">
              {/* Two Column Layout */}
              <div className="modal-columns">
                {/* Left Column - Customer Information */}
                <div className="modal-column">
                  <div className="info-card">
                    <h4 className="card-title">CUSTOMER INFORMATION</h4>
                    
                    <div className="info-group">
                      <span className="info-label">Name</span>
                      <span className="info-value">{selectedOrder.user?.fullname || "N/A"}</span>
                    </div>

                    <div className="info-group">
                      <span className="info-label">Email</span>
                      <span className="info-value">{selectedOrder.user?.email || "N/A"}</span>
                    </div>

                    <div className="info-group">
                      <span className="info-label">Phone</span>
                      <span className="info-value">{selectedOrder.user?.phone || "N/A"}</span>
                    </div>

                    <div className="info-group">
                      <span className="info-label">Address</span>
                      <span className="info-value">{selectedOrder.user?.address || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column - Order Items */}
                <div className="modal-column">
                  <div className="info-card">
                    <h4 className="card-title">ORDER ITEMS</h4>
                    
                    <div className="items-list-enhanced">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="item-row-enhanced">
                          <span className="item-name-qty">{item.name} x{item.quantity}</span>
                          <span className="item-price">₱{item.price_at_purchase?.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Section */}
              <div className="total-section">
                <span className="total-label">Total</span>
                <span className="total-value">₱{selectedOrder.total?.toFixed(2)}</span>
              </div>

              {/* Status Update Section */}
              <div className="status-update-section">
                <h4 className="update-status-title">UPDATE STATUS</h4>
                <div className="status-buttons-grid">
                  <button
                    onClick={() => updateOrderStatus(selectedOrder._id, "Pending")}
                    className="status-btn-new pending"
                    disabled={loading}
                  >
                    PENDING
                  </button>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder._id, "Paid")}
                    className="status-btn-new paid"
                    disabled={loading}
                  >
                    PAID
                  </button>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder._id, "Completed")}
                    className="status-btn-new completed"
                    disabled={loading}
                  >
                    COMPLETED
                  </button>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder._id, "Cancelled")}
                    className="status-btn-new cancelled"
                    disabled={loading}
                  >
                    CANCELLED
                  </button>
                </div>
              </div>

              {/* Delete Button */}
              <div className="delete-order-section">
                <button
                  onClick={() => handleDeleteClick(selectedOrder._id)}
                  className="delete-order-button"
                  disabled={loading}
                >
                   Delete Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-enhanced delete-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header-enhanced">
              <div className="cafe-brand">
                <span className="cafe-name">Confirm Delete</span>
                <span className="modal-subtitle">This action cannot be undone</span>
              </div>
              <button
                className="close-btn-enhanced"
                onClick={cancelDelete}
              >
                ✕
              </button>
            </div>

            <div className="modal-body-enhanced">
              <div className="delete-confirm-content">
                <p className="delete-message">
                  Are you sure you want to delete this order?
                </p>
                
                {orders.find(o => o._id === orderToDelete) && (
                  <div className="delete-order-info">
                    <div className="delete-info-row">
                      <span className="delete-info-label">Order ID:</span>
                      <span className="delete-info-value">{orderToDelete}</span>
                    </div>
                    <div className="delete-info-row">
                      <span className="delete-info-label">Customer:</span>
                      <span className="delete-info-value">
                        {orders.find(o => o._id === orderToDelete).user?.fullname || "N/A"}
                      </span>
                    </div>
                    <div className="delete-info-row">
                      <span className="delete-info-label">Email:</span>
                      <span className="delete-info-value">
                        {orders.find(o => o._id === orderToDelete).user?.email || "N/A"}
                      </span>
                    </div>
                    <div className="delete-info-row">
                      <span className="delete-info-label">Total:</span>
                      <span className="delete-info-value">
                        ₱{orders.find(o => o._id === orderToDelete).total?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="delete-actions">
                <button
                  onClick={() => deleteOrder(orderToDelete)}
                  className="confirm-delete-btn"
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "OK"}
                </button>
                <button
                  onClick={cancelDelete}
                  className="cancel-delete-btn"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrderManagement;