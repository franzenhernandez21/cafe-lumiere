import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminProductmanagement.css";

const AdminProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [notification, setNotification] = useState(null);

 
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  
  const subcategoryOptions = {
    "Coffee": ["Hot", "Cold"],
    "Cakes": ["Flavors", "Occasional"],
    "Cupcake": ["Classic", "Packs"],
    "Pie": ["Fruits", "Cream/Custard"],
    "Gifting": ["Seasonal", "Bundle"]
  };

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
    stock: "",
    image: null,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("❌ Error fetching categories:", err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/products");
      const productData = res.data.products || res.data;
      setProducts(productData);
      setFilteredProducts(productData);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
      showNotification("error", "Failed to load products. Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredProducts(products);
      return;
    }
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase()) ||
        (p.category?.name?.toLowerCase() || "").includes(query.toLowerCase()) ||
        (p.subcategory?.toLowerCase() || "").includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const openAddModal = () => {
    setEditMode(false);
    setForm({
      name: "",
      description: "",
      price: "",
      category: "",
      subcategory: "",
      stock: "",
      image: null,
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditMode(true);
    setCurrentProductId(product._id);
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      category: product.category._id || "",
      subcategory: product.subcategory || "",
      stock: product.stock || 0,
      image: null,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("subcategory", form.subcategory);
      formData.append("stock", form.stock);
      if (form.image) formData.append("image", form.image);

      let response;
      if (editMode) {
        response = await axios.put(
          `http://localhost:5000/api/products/${currentProductId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        showNotification("success", "Product updated successfully!");
      } else {
        response = await axios.post(
          "http://localhost:5000/api/products",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        showNotification("success", "Product added successfully!");
      }

      setShowModal(false);
      fetchProducts();
    } catch (err) {
      console.error("❌ Error submitting form:", err);
      showNotification("error", err.response?.data?.error || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      showNotification("success", "Product deleted successfully!");
      fetchProducts();
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    } catch (err) {
      console.error("❌ Delete error:", err);
      showNotification("error", `Error deleting product: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setProductToDelete(null);
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c._id === categoryId);
    return cat?.name;
  };

  const availableSubcategories = getCategoryName(form.category) 
    ? subcategoryOptions[getCategoryName(form.category)] || [] 
    : [];

  return (
    <div className="admin-container">
      {/* Notification Toast */}
      {notification && (
        <div className={`product-notification ${notification.type}`}>
          <div className="product-notification-icon">
            {notification.type === "success" ? "✓" : "✕"}
          </div>
          <p className="product-notification-message">{notification.message}</p>
          <button className="product-notification-close" onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      <div className="admin-header">
        <h2 className="admin-title">Product Management</h2>
        <button onClick={openAddModal} className="add-button" disabled={loading}>
          <span className="add-icon">+</span> Add Product
        </button>
      </div>

      <div className="search-container">
        <span className="search-icon"></span>
        <input
          type="text"
          placeholder="Search products by name, description, category, or subcategory..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
          disabled={loading}
        />
        {searchQuery && (
          <span onClick={() => setSearchQuery("")} className="clear-icon">
            ✕
          </span>
        )}
      </div>

      <div className="product-grid">
        {filteredProducts.length === 0 && !loading ? (
          <div className="empty-state">
            <span className="empty-icon"></span>
            <p className="empty-text">
              {searchQuery
                ? "No products found"
                : "No products yet. Add your first product!"}
            </p>
          </div>
        ) : (
          filteredProducts.map((p) => (
            <div
              key={p._id}
              className={`product-card ${
                hoveredProduct === p._id ? "hovered" : ""
              }`}
              onMouseEnter={() => setHoveredProduct(p._id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <div className="image-container">
                <img
                  src={
                    p.image?.startsWith("http")
                      ? p.image
                      : `http://localhost:5000/${p.image}`
                  }
                  alt={p.name}
                  className="product-image"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                  }}
                />
                {hoveredProduct === p._id && (
                  <div className="overlay">
                    <button onClick={() => openEditModal(p)} className="edit-button">
                       Edit
                    </button>
                    <button onClick={() => handleDeleteClick(p)} className="delete-button">
                       Delete
                    </button>
                  </div>
                )}
              </div>
              <div className="product-info">
                <h4 className="product-name">{p.name}</h4>
                <p className="product-description">{p.description || "No description"}</p>
                <div className="product-meta">
                  <span className="product-price">₱{p.price}</span>
                  <span className="product-stock">Stock: {p.stock || 0}</span>
                </div>
                <span className="category-badge">{p.category?.name || "No category"}</span>
                {p.subcategory && (
                  <span className="subcategory-badge">{p.subcategory}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Enhanced Modal */}
      {showModal && (
        <div className="modal-overlay-enhanced" onClick={() => setShowModal(false)}>
          <div className="modal-enhanced-product" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-cafe">
              <div className="cafe-brand-header">
                <span className="cafe-name-product">Cafe Lumière</span>
                <span className="modal-subtitle-product">
                  {editMode ? "Edit Product" : "Add New Product"}
                </span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="close-button-cafe"
                disabled={loading}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form-cafe">
              <div className="form-section">
                <h4 className="section-title">PRODUCT INFORMATION</h4>
                
                <div className="form-group-cafe">
                  <label className="form-label-cafe">Product Name *</label>
                  <input
                    type="text"
                    placeholder="Enter product name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="form-input-cafe"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group-cafe">
                  <label className="form-label-cafe">Description</label>
                  <textarea
                    placeholder="Enter product description"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="form-textarea-cafe"
                    rows="3"
                    disabled={loading}
                  />
                </div>

                <div className="form-group-cafe">
                  <label className="form-label-cafe">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: "" })}
                    className="form-select-cafe"
                    required
                    disabled={loading}
                  >
                    <option value="">Select category</option>
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No categories available</option>
                    )}
                  </select>
                </div>

                {availableSubcategories.length > 0 && (
                  <div className="form-group-cafe">
                    <label className="form-label-cafe">Sub-Category</label>
                    <select
                      value={form.subcategory}
                      onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                      className="form-select-cafe"
                      disabled={loading}
                    >
                      <option value="">Select sub-category (optional)</option>
                      {availableSubcategories.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-row-cafe">
                  <div className="form-group-cafe">
                    <label className="form-label-cafe">Price *</label>
                    <div className="input-with-prefix">
                      <span className="currency-symbol">₱</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        className="form-input-cafe price-input"
                        step="0.01"
                        min="0"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-group-cafe">
                    <label className="form-label-cafe">Stock *</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      className="form-input-cafe"
                      min="0"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group-cafe">
                  <label className="form-label-cafe">Product Image</label>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      onChange={(e) =>
                        setForm({ ...form, image: e.target.files[0] })
                      }
                      accept="image/*"
                      className="form-file-input-cafe"
                      id="file-input"
                      disabled={loading}
                    />
                    <label htmlFor="file-input" className="file-upload-label">
                      <span className="file-icon">📎</span>
                      {form.image ? form.image.name : "Choose a file"}
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer-cafe">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cancel-button-cafe"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-button-cafe" disabled={loading}>
                  {loading ? "⏳ Saving..." : editMode ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && productToDelete && (
        <div className="modal-overlay-enhanced" onClick={cancelDelete}>
          <div className="modal-enhanced-simple delete-modal-product" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-simple">
              <div>
                <div className="modal-title-simple">Confirm Delete</div>
                <div className="modal-subtitle-delete">This action cannot be undone</div>
              </div>
              <button
                className="close-btn-simple"
                onClick={cancelDelete}
              >
                ✕
              </button>
            </div>

            <div className="modal-body-enhanced">
              <div className="delete-confirm-content">
                <p className="delete-message">
                  Are you sure you want to delete this product?
                </p>
                
                <div className="delete-product-info">
                  <div className="delete-info-row">
                    <span className="delete-info-label">Product Name:</span>
                    <span className="delete-info-value">{productToDelete.name}</span>
                  </div>
                  <div className="delete-info-row">
                    <span className="delete-info-label">Category:</span>
                    <span className="delete-info-value">
                      {productToDelete.category?.name || "No category"}
                    </span>
                  </div>
                  {productToDelete.subcategory && (
                    <div className="delete-info-row">
                      <span className="delete-info-label">Sub-Category:</span>
                      <span className="delete-info-value">{productToDelete.subcategory}</span>
                    </div>
                  )}
                  <div className="delete-info-row">
                    <span className="delete-info-label">Price:</span>
                    <span className="delete-info-value">₱{productToDelete.price}</span>
                  </div>
                  <div className="delete-info-row">
                    <span className="delete-info-label">Stock:</span>
                    <span className="delete-info-value">{productToDelete.stock || 0}</span>
                  </div>
                </div>
              </div>

              <div className="delete-actions">
                <button
                  onClick={() => handleDelete(productToDelete._id)}
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
};

export default AdminProductManagement;