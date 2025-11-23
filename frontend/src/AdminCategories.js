// AdminCategories.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminCategories.css";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      showNotification("error", "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditMode(false);
    setCategoryName("");
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditMode(true);
    setCurrentCategoryId(category._id);
    setCategoryName(category.name);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editMode) {
        await axios.put(`http://localhost:5000/api/categories/${currentCategoryId}`, {
          name: categoryName,
        });
        showNotification("success", "Category updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/categories", {
          name: categoryName,
        });
        showNotification("success", "Category added successfully!");
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      console.error("Error:", err);
      showNotification("error", err.response?.data?.error || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/categories/${id}`);
      showNotification("success", "Category deleted successfully!");
      fetchCategories();
      setShowDeleteConfirm(false);
      setCategoryToDelete(null);
    } catch (err) {
      console.error("Delete error:", err);
      showNotification("error", err.response?.data?.error || "Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setCategoryToDelete(null);
  };

  return (
    <div className="categories-container">
      {notification && (
        <div className={`category-notification ${notification.type}`}>
          <div className="category-notification-icon">
            {notification.type === "success" ? "✓" : "✕"}
          </div>
          <p className="category-notification-message">{notification.message}</p>
          <button className="category-notification-close" onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      <div className="categories-header">
        <h2 className="categories-title">Categories Management</h2>
        <button onClick={openAddModal} className="add-category-btn" disabled={loading}>
          <span>+</span> Add Category
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon"></span>
          <p>No categories yet. Add your first category!</p>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((cat) => (
            <div key={cat._id} className="category-card">
              <div className="category-icon"></div>
              <h3 className="category-name">{cat.name}</h3>
              <div className="category-actions">
                <button onClick={() => openEditModal(cat)} className="edit-cat-btn">
                   Edit
                </button>
                <button onClick={() => handleDeleteClick(cat)} className="delete-cat-btn">
                   Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-category" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editMode ? "Edit Category" : "Add New Category"}</h3>
              <button onClick={() => setShowModal(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleSubmit} className="category-form">
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  required
                  disabled={loading}
                />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn" disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Saving..." : editMode ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && categoryToDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-category delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Category</h3>
              <button onClick={cancelDelete} className="close-btn">×</button>
            </div>
            <div className="delete-content">
              <p>Are you sure you want to delete "{categoryToDelete.name}"?</p>
              <p className="warning">⚠️ This will affect all products in this category!</p>
            </div>
            <div className="modal-footer">
              <button onClick={cancelDelete} className="cancel-btn" disabled={loading}>Cancel</button>
              <button onClick={() => handleDelete(categoryToDelete._id)} className="delete-confirm-btn" disabled={loading}>
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;