import React, { useEffect, useState, useCallback } from "react";
import "./UserManagement.css";

/**
 * UserManagement.jsx
 * - Normalizes user IDs (supports _id or id)
 * - Uses REACT_APP_API_BASE for API base URL (default: http://localhost:5000/api)
 * - Sends Authorization header with token from localStorage if available
 * - Clear, centralized action handlers for block/unblock/delete
 */

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const normalizeUser = (user) => {
  if (!user) return null;
  return { ...user, _id: user._id || user.id || user._id?.toString?.() };
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [notification, setNotification] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, type: "", user: null });
  const [actionLoading, setActionLoading] = useState(false);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      // handle non-JSON / auth errors
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Unauthorized. Please login again.");
        }
        throw new Error(`Failed to fetch users (status ${res.status})`);
      }

      const data = await res.json();
      // backend may return either array or { success, users }
      const userArray = Array.isArray(data) ? data : (data.users || []);
      setUsers(userArray.map(normalizeUser));
    } catch (err) {
      console.error("Fetch users error:", err);
      setError(err.message || "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserOrders = async (userId) => {
    if (!userId) {
      setUserOrders([]);
      return;
    }
    setOrdersLoading(true);
    try {
      const res = await fetch(`${API_BASE}/orders/user/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch orders (status ${res.status})`);
      }

      const data = await res.json();
      setUserOrders(data.success ? (data.orders || []) : (data.orders || []));
    } catch (err) {
      console.error("Fetch orders error:", err);
      setUserOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleRowClick = (user) => {
    const normalized = normalizeUser(user);
    setSelectedUser(normalized);
    fetchUserOrders(normalized?._id);
  };

  const handleCloseModal = () => {
    if (actionLoading) return;
    setSelectedUser(null);
    setUserOrders([]);
  };

  // central function to call user action endpoints
  const callUserAction = async ({ userId, action }) => {
    if (!userId) throw new Error("Missing user ID");
    const endpoint =
      action === "block"
        ? `${API_BASE}/users/${userId}/block`
        : action === "unblock"
        ? `${API_BASE}/users/${userId}/unblock`
        : action === "delete"
        ? `${API_BASE}/users/${userId}`
        : null;

    if (!endpoint) throw new Error("Invalid action");

    const method = action === "delete" ? "DELETE" : "PUT";

    const res = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    const data = await res.json().catch(() => ({ success: res.ok }));

    if (!res.ok) {
      throw new Error(data.message || `Action failed: ${res.status}`);
    }

    return data;
  };

  const handleConfirmAction = async () => {
    const { type, user } = confirmModal;
    if (!user) return;
    const userId = user._id || user.id;
    setActionLoading(true);

    try {
      await callUserAction({ userId, action: type });
      // update UI
      setConfirmModal({ show: false, type: "", user: null });

      // if a modal with user details is open, update its status or close
      if (selectedUser && selectedUser._id === userId) {
        if (type === "delete") {
          handleCloseModal();
        } else if (type === "block") {
          setSelectedUser((prev) => ({ ...prev, status: "blocked" }));
        } else if (type === "unblock") {
          setSelectedUser((prev) => ({ ...prev, status: "active" }));
        }
      }

      // refresh list from server (authoritative)
      await fetchUsers();

      // success message
      const actionVerb = type === "delete" ? "deleted" : type === "block" ? "blocked" : "unblocked";
      showNotification("success", `${user.fullname || user.email} has been ${actionVerb}`);
    } catch (err) {
      console.error(`${type} error:`, err);
      showNotification("error", err.message || `Error performing ${type}`);
      setConfirmModal({ show: false, type: "", user: null });
    } finally {
      setActionLoading(false);
    }
  };

  const openConfirmModal = (type, user) => {
    // always normalize before storing
    setConfirmModal({ show: true, type, user: normalizeUser(user) });
  };

  const closeConfirmModal = () => {
    if (!actionLoading) setConfirmModal({ show: false, type: "", user: null });
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // UI states
  if (loading) {
    return (
      <div className="user-management">
        <h2>Users Management</h2>
        <p className="loading-message">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-management">
        <h2>Users Management</h2>
        <p className="error-message">{error}</p>
        <div style={{ marginTop: 12 }}>
          <button onClick={fetchUsers} className="um-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management" data-testid="user-management">
      {/* Notification */}
      {notification && (
        <div className={`um-notification ${notification.type}`}>
          <div className="um-notification-icon">{notification.type === "success" ? "✓" : "✕"}</div>
          <p className="um-notification-message">{notification.message}</p>
          <button className="um-notification-close" onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="um-confirm-overlay" onClick={closeConfirmModal}>
          <div className="um-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className={`um-confirm-icon ${confirmModal.type}`}>
              {confirmModal.type === "delete" ? "🗑️" : confirmModal.type === "block" ? "🚫" : "✓"}
            </div>
            <h3>
              {confirmModal.type === "delete" && "Delete User?"}
              {confirmModal.type === "block" && "Block User?"}
              {confirmModal.type === "unblock" && "Unblock User?"}
            </h3>
            <p>
              {confirmModal.type === "delete" && `Permanently delete ${confirmModal.user?.fullname || confirmModal.user?.email}? This cannot be undone.`}
              {confirmModal.type === "block" && `Block ${confirmModal.user?.fullname || confirmModal.user?.email}? They will not be able to login.`}
              {confirmModal.type === "unblock" && `Unblock ${confirmModal.user?.fullname || confirmModal.user?.email}? They will be able to login again.`}
            </p>
            <div className="um-confirm-buttons">
              <button className="um-btn-cancel" onClick={closeConfirmModal} disabled={actionLoading}>Cancel</button>
              <button
                className={`um-btn-confirm ${confirmModal.type}`}
                onClick={handleConfirmAction}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : (confirmModal.type === "delete" ? "Delete" : confirmModal.type === "block" ? "Block" : "Unblock")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && !confirmModal.show && (
        <div className="um-modal-overlay" onClick={handleCloseModal}>
          <div className="um-modal" onClick={(e) => e.stopPropagation()}>
            <button className="um-modal-close" onClick={handleCloseModal}>×</button>

            <div className="um-modal-header">
              <div className="um-user-avatar">
                {selectedUser.picture ? (
                  <img src={selectedUser.picture} alt={selectedUser.fullname} />
                ) : (
                  <span>{(selectedUser.fullname || selectedUser.email || "U").charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="um-user-title">
                <h2>{selectedUser.fullname || selectedUser.email}</h2>
                <div className="um-badges">
                  <span className={`um-role-badge ${selectedUser.role}`}>{selectedUser.role || "user"}</span>
                  {selectedUser.status === "blocked" && <span className="um-status-badge blocked">Blocked</span>}
                </div>
              </div>
            </div>

            <div className="um-modal-body">
              <div className="um-info-section">
                <h3>User Information</h3>
                <div className="um-info-grid">
                  <div className="um-info-item"><label>Email</label><p>{selectedUser.email || "-"}</p></div>
                  <div className="um-info-item"><label>Username</label><p>{selectedUser.username || "-"}</p></div>
                  <div className="um-info-item"><label>Phone</label><p>{selectedUser.phone || "-"}</p></div>
                  <div className="um-info-item"><label>Birthday</label><p>{selectedUser.birthday || "-"}</p></div>
                  <div className="um-info-item full-width"><label>Address</label><p>{selectedUser.address || "-"}</p></div>
                  <div className="um-info-item"><label>Account Created</label><p>{formatDate(selectedUser.createdAt)}</p></div>
                  <div className="um-info-item"><label>Status</label>
                    <p className={selectedUser.status === "blocked" ? "status-blocked" : "status-active"}>
                      {selectedUser.status === "blocked" ? "🚫 Blocked" : "✅ Active"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="um-orders-section">
                <h3>Order History ({userOrders.length})</h3>
                {ordersLoading ? (
                  <p className="um-orders-loading">Loading orders...</p>
                ) : userOrders.length === 0 ? (
                  <p className="um-no-orders">No orders found</p>
                ) : (
                  <div className="um-orders-list">
                    {userOrders.map((order) => (
                      <div key={order._id || order.id} className="um-order-card">
                        <div className="um-order-header">
                          <span className="um-order-id">#{(order._id || order.id || "").slice(-8)}</span>
                          <span className={`um-order-status ${order.status?.toLowerCase()}`}>{order.status}</span>
                        </div>
                        <div className="um-order-details">
                          <p><strong>Items:</strong> {order.items?.length || 0}</p>
                          <p><strong>Total:</strong> ₱{(order.total || 0).toFixed(2)}</p>
                          <p><strong>Date:</strong> {formatDate(order.order_date || order.createdAt)}</p>
                          <p><strong>Payment:</strong> {order.payment_method || "-"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="um-modal-footer">
              {selectedUser.role !== "admin" && (
                <>
                  {selectedUser.status === "blocked" ? (
                    <button className="um-btn unblock" onClick={() => openConfirmModal("unblock", selectedUser)}><span>✓</span> Unblock User</button>
                  ) : (
                    <button className="um-btn block" onClick={() => openConfirmModal("block", selectedUser)}><span>🚫</span> Block User</button>
                  )}
                  <button className="um-btn delete" onClick={() => openConfirmModal("delete", selectedUser)}><span>🗑️</span> Delete User</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <h2>Users Management</h2>
      <div style={{ overflowX: "auto" }}>
        <table className="user-table" role="grid">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "40px" }}>No users found</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id || u.id} onClick={() => handleRowClick(u)} className="clickable-row">
                  <td data-label="Full Name">{u.fullname || u.name || "-"}</td>
                  <td data-label="Email">{u.email || "-"}</td>
                  <td data-label="Username">{u.username || "-"}</td>
                  <td data-label="Role"><span className={`role-tag ${u.role}`}>{u.role || "-"}</span></td>
                  <td data-label="Status">
                    <span className={`status-tag ${u.status === "blocked" ? "blocked" : "active"}`}>{u.status === "blocked" ? "Blocked" : "Active"}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
