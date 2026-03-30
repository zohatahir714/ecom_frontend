import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';

const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

const CATEGORIES = [
  'Pizzas',
  'Burgers',
  'Fries & Sides',
  'Sandwiches & Platters',
  'Pastas',
  'Drinks',
  'Add-ons',
  'Deals',
];

const formatPrice = (n) => `$${(Number(n) ?? 0).toFixed(2)}`;

const AdminDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Pizzas',
    image: '',
    imageFile: null,
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [toast, setToast] = useState(null);
  const [statusHistory, setStatusHistory] = useState(null);
  const [loadingStatusId, setLoadingStatusId] = useState(null);

  const fetchAll = async () => {
    const [productsRes, usersRes, ordersRes] = await Promise.all([
      axios.get('/api/products'),
      axios.get('/api/users'),
      axios.get('/api/orders'),
    ]);
    setProducts(productsRes.data);
    setUsers(usersRes.data);
    setOrders(ordersRes.data);
  };

  useEffect(() => {
    fetchAll().catch(console.error);
  }, []);

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    if (name === 'imageFile') {
      setNewProduct((prev) => ({ ...prev, imageFile: e.target.files?.[0] || null }));
      return;
    }
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const createProduct = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('description', newProduct.description || '');
      formData.append('price', parseFloat(newProduct.price));
      formData.append('category', newProduct.category || 'Pizzas');
      if (newProduct.image) formData.append('image', newProduct.image);
      if (newProduct.imageFile) formData.append('image', newProduct.imageFile);

      if (newProduct.imageFile) {
        await axios.post('/api/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post('/api/products', {
          name: newProduct.name,
          description: newProduct.description || undefined,
          price: parseFloat(newProduct.price),
          category: newProduct.category || 'Pizzas',
          image: newProduct.image || undefined,
        });
      }
      setNewProduct({ name: '', description: '', price: '', category: 'Pizzas', image: '', imageFile: null });
      fetchAll();
      showToast('Product created successfully.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create product.', 'error');
    }
  };

  const startEdit = (p) => {
    setEditingProduct({
      _id: p._id,
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      category: p.category || 'Pizzas',
      image: p.image || p.imageUrl || '',
      imageFile: null,
    });
  };

  const cancelEdit = () => setEditingProduct(null);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === 'imageFile') {
      setEditingProduct((prev) => ({ ...prev, imageFile: e.target.files?.[0] || null }));
      return;
    }
    setEditingProduct((prev) => ({ ...prev, [name]: value }));
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct.imageFile) {
        const formData = new FormData();
        formData.append('name', editingProduct.name);
        formData.append('description', editingProduct.description || '');
        formData.append('price', parseFloat(editingProduct.price));
        formData.append('category', editingProduct.category || 'Pizzas');
        formData.append('image', editingProduct.imageFile);
        await axios.put(`/api/products/${editingProduct._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.put(`/api/products/${editingProduct._id}`, {
          name: editingProduct.name,
          description: editingProduct.description || undefined,
          price: parseFloat(editingProduct.price),
          category: editingProduct.category || 'Pizzas',
          image: editingProduct.image || undefined,
        });
      }
      setEditingProduct(null);
      fetchAll();
      showToast('Product updated successfully.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update product.', 'error');
    }
  };

  const toggleUserRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    await axios.put(`/api/users/${user._id}/role`, { role: newRole });
    fetchAll();
  };

  const toggleUserBlock = async (user) => {
    try {
      await axios.put(`/api/users/${user._id}/block`, { isBlocked: !user.isBlocked });
      fetchAll();
      showToast(`User ${user.isBlocked ? 'unblocked' : 'blocked'} successfully.`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update user.', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setLoadingStatusId(orderId);
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      showToast('Order status updated successfully.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status.', 'error');
    } finally {
      setLoadingStatusId(null);
    }
  };

  const openStatusHistory = async (orderId) => {
    try {
      const res = await axios.get(`/api/orders/${orderId}/status`);
      setStatusHistory({ orderId, ...res.data });
    } catch {
      showToast('Could not load status history.', 'error');
    }
  };

  const closeStatusHistory = () => setStatusHistory(null);

  return (
    <div className="admin-page">
      <h2>Admin Panel</h2>

      <section>
        <h3>Manage Products</h3>
        <form className="admin-product-form" onSubmit={createProduct}>
          <input
            name="name"
            placeholder="Name"
            value={newProduct.name}
            onChange={handleProductChange}
            required
          />
          <input
            name="description"
            placeholder="Description"
            value={newProduct.description}
            onChange={handleProductChange}
          />
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="Price"
            value={newProduct.price}
            onChange={handleProductChange}
            required
          />
          <select
            name="category"
            value={newProduct.category}
            onChange={handleProductChange}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            name="image"
            placeholder="Image URL (or upload below)"
            value={newProduct.image}
            onChange={handleProductChange}
          />
          <label className="file-upload-label">
            Upload Image
            <input
              type="file"
              name="imageFile"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleProductChange}
            />
          </label>
          <button className="btn-primary" type="submit">
            Add Product
          </button>
        </form>

        {editingProduct && (
          <div className="edit-product-form-wrap">
            <h4>Edit Product</h4>
            <form className="form edit-product-form" onSubmit={saveProduct}>
              <label>
                Name
                <input
                  name="name"
                  value={editingProduct.name}
                  onChange={handleEditChange}
                  required
                />
              </label>
              <label>
                Description
                <input
                  name="description"
                  value={editingProduct.description}
                  onChange={handleEditChange}
                />
              </label>
              <label>
                Price
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingProduct.price}
                  onChange={handleEditChange}
                  required
                />
              </label>
              <label>
                Category
                <select
                  name="category"
                  value={editingProduct.category}
                  onChange={handleEditChange}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Image URL
                <input
                  name="image"
                  placeholder="https://..."
                  value={editingProduct.image}
                  onChange={handleEditChange}
                />
              </label>
              <label>
                Or upload new image
                <input
                  type="file"
                  name="imageFile"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleEditChange}
                />
              </label>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={cancelEdit}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        )}

        <ul className="admin-product-list">
          {products.map((p) => (
            <li key={p._id} className="admin-product-item">
              <img
                src={p.image || p.imageUrl || 'https://via.placeholder.com/64/1f2937/9ca3af?text=P'}
                alt=""
                className="admin-product-thumb"
              />
              <span>{p.name} — {p.category || 'Pizzas'} — {formatPrice(p.price)}</span>
              <button type="button" className="btn-secondary btn-sm" onClick={() => startEdit(p)}>
                Edit
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Manage Users</h3>
        <div className="admin-users-table-wrap">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className={u.isBlocked ? 'user-blocked' : ''}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <span className={u.isBlocked ? 'status-badge status-cancelled' : 'status-badge status-delivered'}>
                      {u.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-secondary btn-sm"
                      onClick={() => toggleUserRole(u)}
                      disabled={String(u._id) === String(user?.id)}
                    >
                      Make {u.role === 'admin' ? 'User' : 'Admin'}
                    </button>
                    <button
                      className={`btn-sm ${u.isBlocked ? 'btn-unblock' : 'btn-block'}`}
                      onClick={() => toggleUserBlock(u)}
                      disabled={String(u._id) === String(user?.id)}
                    >
                      {u.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3>All Orders</h3>
        {toast && (
          <div className={`toast toast-${toast.type}`} role="alert">
            {toast.message}
          </div>
        )}
        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Total</th>
                <th>Items</th>
                <th>History</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>{o.user?.email || 'Unknown user'}</td>
                  <td>
                    <select
                      className={`status-select status-${(o.status || 'pending').replace('_', '-')}`}
                      value={o.status || 'pending'}
                      onChange={(e) => handleStatusChange(o._id, e.target.value)}
                      disabled={loadingStatusId === o._id}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{formatPrice(o.totalAmount)}</td>
                  <td>{o.items?.length || 0} items</td>
                  <td>
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={() => openStatusHistory(o._id)}
                    >
                      View history
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {statusHistory && (
        <div className="modal-overlay" onClick={closeStatusHistory}>
          <div className="modal-content status-history-modal" onClick={(e) => e.stopPropagation()}>
            <h4>Status history — Order #{statusHistory.orderId?.slice(-6)}</h4>
            <p className="current-status">
              Current: <span className={`status-badge status-${(statusHistory.status || 'pending').replace('_', '-')}`}>{statusHistory.status?.replace(/_/g, ' ')}</span>
            </p>
            <ul className="status-history-list">
              {statusHistory.history?.length
                ? statusHistory.history.map((h, i) => (
                    <li key={i}>
                      <span className={`status-badge status-${h.status.replace('_', '-')}`}>{h.status.replace(/_/g, ' ')}</span>
                      <span className="status-history-date">
                        {new Date(h.updatedAt).toLocaleString()}
                      </span>
                    </li>
                  ))
                : <li>No history recorded.</li>}
            </ul>
            <button type="button" className="btn-secondary" onClick={closeStatusHistory}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
