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

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "coffee",
    stock: "",
    image: null,
  });

  // ✅ Fetch categories from backend
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

  // ===== Fetch products =====
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
      alert("❌ Failed to load products. Check if backend is running.");
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
        (p.category?.toLowerCase() || "").includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const openAddModal = () => {
    setEditMode(false);
    setForm({
      name: "",
      description: "",
      price: "",
      category: "coffee",
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
      category: product.category || "coffee",
      stock: product.stock || 0,
      image: null,
    });
    setShowModal(true);
  };

  // ===== Submit Form =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("stock", form.stock);
      if (form.image) formData.append("image", form.image);

      let response;
      if (editMode) {
        response = await axios.put(
          `http://localhost:5000/api/products/${currentProductId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        alert("✅ Product updated successfully!");
      } else {
        response = await axios.post(
          "http://localhost:5000/api/products",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        alert("✅ Product added successfully!");
      }

      setShowModal(false);
      fetchProducts();
    } catch (err) {
      console.error("❌ Error submitting form:", err);
      alert(err.response?.data?.error || "❌ Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this product?")) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:5000/api/products/${id}`);
        alert("✅ Product deleted successfully!");
        fetchProducts();
      } catch (err) {
        console.error("❌ Delete error:", err);
        alert(`❌ Error deleting product: ${err.response?.data?.error || err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2 className="admin-title">Product Management</h2>
        <button onClick={openAddModal} className="add-button" disabled={loading}>
          <span className="add-icon">+</span> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="search-container">
        <span className="search-icon"></span>
        <input
          type="text"
          placeholder="Search products by name, description, or category..."
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

      {/* Product Grid */}
      <div className="product-grid">
        {filteredProducts.length === 0 && !loading ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
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
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(p._id)} className="delete-button">
                      🗑️ Delete
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
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editMode ? "✏️ Edit Product" : "Add New Product"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="close-button"
                disabled={loading}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  placeholder="Enter product name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  placeholder="Enter product description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="form-textarea"
                  rows="3"
                  disabled={loading}
                />
              </div>

              {/* ✅ Category Dropdown (with default + DB categories) */}
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
  value={form.category}
  onChange={(e) => setForm({ ...form, category: e.target.value })}
  className="form-select"
  required
  disabled={loading}
>
  <option value="">Select category</option>

  {/* ✅ Dynamically fetched categories from DB */}
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

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price *</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="form-input"
                    step="0.01"
                    min="0"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stock *</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="form-input"
                    min="0"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Product Image</label>
                <input
                  type="file"
                  onChange={(e) =>
                    setForm({ ...form, image: e.target.files[0] })
                  }
                  accept="image/*"
                  className="form-file-input"
                  disabled={loading}
                />
                {form.image && (
                  <p style={{ marginTop: "8px", fontSize: "14px", color: "#666" }}>
                    📎 Selected: {form.image.name}
                  </p>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cancel-button"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? "⏳ Saving..." : editMode ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductManagement;
