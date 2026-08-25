import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Footer from '../components/Footer';
import {
  fetchDashboardStats,
  fetchOrders,
  updateOrderStatus,
  fetchProducts,
  createProduct,
  deleteProduct,
  uploadImage,
} from '../utils/api';

export default function AdminDashboard() {
  const { token, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'products'
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // New Product Modal Form State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'pickles',
    weight: '250g',
    spice_level: 3,
    is_bestseller: 0,
    image_url: '/images/gongura.jpg',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, ordersData, productsData] = await Promise.all([
        fetchDashboardStats(token),
        fetchOrders({ status: statusFilter }, token),
        fetchProducts({}),
      ]);
      setStats(statsData);
      setOrders(ordersData);
      setProductsList(productsData);
    } catch (err) {
      addToast(err.message || 'Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { order_status: newStatus }, token);
      addToast(`Order #${orderId} status updated to ${newStatus}!`, 'success');
      loadData();
      if (selectedOrder && selectedOrder.order_id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, order_status: newStatus }));
      }
    } catch (err) {
      addToast(err.message || 'Failed to update order status', 'error');
    }
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await uploadImage(file);
      setNewProduct((prev) => ({ ...prev, image_url: res.image_url }));
      setImagePreview(res.image_url);
      addToast('Image uploaded successfully! 📸', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to upload image', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateProductSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProduct({ ...newProduct, price: parseFloat(newProduct.price) }, token);
      addToast('New product added successfully! 🎉', 'success');
      setShowAddProductModal(false);
      setImagePreview('');
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: 'pickles',
        weight: '250g',
        spice_level: 3,
        is_bestseller: 0,
        image_url: '/images/gongura.jpg',
      });
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to add product', 'error');
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) return;
    try {
      await deleteProduct(productId, token);
      addToast(`Deleted "${productName}"`, 'info');
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to delete product', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully', 'info');
    navigate('/admin/login');
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="container admin-header-inner">
          <div className="admin-title">
            <img
              src="/logo.png"
              alt="Student Ruchulu Logo"
              style={{ height: '36px', objectFit: 'contain', display: 'block' }}
            />
            <span>Student Ruchulu Admin Panel</span>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/')}>
              🌐 Storefront
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleLogout}>
              Logout 🚪
            </button>
          </div>
        </div>
      </header>

      <main className="container admin-content">
        {/* Stats Grid */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon orders">📦</div>
              <div className="stat-value">{stats.total_orders}</div>
              <div className="stat-label">Total Orders</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon revenue">💰</div>
              <div className="stat-value">₹{stats.total_revenue}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon pending">⏳</div>
              <div className="stat-value">{stats.pending_orders}</div>
              <div className="stat-label">Pending Orders</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon products">🍲</div>
              <div className="stat-value">{stats.total_products}</div>
              <div className="stat-label">Active Products</div>
            </div>
          </div>
        )}

        {/* Tab Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div className="admin-tabs">
            <button
              className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              📦 Order Management ({orders.length})
            </button>
            <button
              className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              🌶️ Menu Items ({products.length})
            </button>
          </div>

          {activeTab === 'products' && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddProductModal(true)}
            >
              + Add New Item
            </button>
          )}
        </div>

        {/* Orders View */}
        {activeTab === 'orders' && (
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Filter Status:</span>
              <select
                className="status-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Loading orders...</div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px' }}>
                No orders match the filter.
              </div>
            ) : (
              <div className="orders-table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Order Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>
                          <strong>#{o.order_id}</strong>
                          <div style={{ fontSize: '11px', color: '#a8a29e' }}>
                            {new Date(o.created_at).toLocaleString()}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: '600' }}>{o.customer_name}</div>
                          <div style={{ fontSize: '12px', color: '#57534e' }}>{o.customer_phone}</div>
                          <div style={{ fontSize: '11px', color: '#a8a29e' }}>{o.customer_email}</div>
                        </td>
                        <td>
                          {o.items?.map((item, idx) => (
                            <div key={idx} style={{ fontSize: '12px' }}>
                              {item.name} × {item.quantity}
                            </div>
                          ))}
                        </td>
                        <td style={{ fontWeight: '700', color: '#b91c1c' }}>₹{o.total_amount}</td>
                        <td>
                          <span className={`status-badge ${o.payment_status}`}>
                            {o.payment_status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <select
                            className={`status-select ${o.order_status}`}
                            value={o.order_status}
                            onChange={(e) => handleStatusChange(o.order_id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setSelectedOrder(o)}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Products View */}
        {activeTab === 'products' && (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Weight</th>
                  <th>Spice Level</th>
                  <th>Bestseller</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={p.image_url}
                          alt={p.name}
                          style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = 'https://images.pexels.com/photos/7812134/pexels-photo-7812134.jpeg?auto=compress&cs=tinysrgb&w=600';
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: '600' }}>{p.name}</div>
                          <div style={{ fontSize: '11px', color: '#a8a29e' }}>{p.description}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge confirmed">{p.category.toUpperCase()}</span>
                    </td>
                    <td style={{ fontWeight: '700' }}>₹{p.price}</td>
                    <td>{p.weight}</td>
                    <td>{'🌶️'.repeat(p.spice_level || 0)}</td>
                    <td>{p.is_bestseller === 1 ? '🔥 Yes' : 'No'}</td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ color: '#dc2626', borderColor: '#fee2e2' }}
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Order Details #{selectedOrder.order_id}</h3>
                <button className="cart-close-btn" onClick={() => setSelectedOrder(null)}>
                  ✕
                </button>
              </div>

              <div style={{ background: '#fffbf0', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
                <div style={{ fontWeight: '700', marginBottom: '6px' }}>Customer Info</div>
                <div>Name: {selectedOrder.customer_name}</div>
                <div>Phone: {selectedOrder.customer_phone}</div>
                <div>Email: {selectedOrder.customer_email}</div>
                <div>Address: {selectedOrder.address}, {selectedOrder.city} — {selectedOrder.pincode}</div>
                {selectedOrder.notes && (
                  <div style={{ marginTop: '6px', color: '#d97706' }}>
                    Note: {selectedOrder.notes}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: '700', marginBottom: '8px' }}>Ordered Items</div>
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f4' }}>
                    <span>{item.name} × {item.quantity} ({item.weight || '250g'})</span>
                    <strong>₹{item.price * item.quantity}</strong>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '18px', fontWeight: '800' }}>
                  <span>Grand Total</span>
                  <span style={{ color: '#b91c1c' }}>₹{selectedOrder.total_amount}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <select
                  className="status-select"
                  style={{ flex: 1 }}
                  value={selectedOrder.order_status}
                  onChange={(e) => handleStatusChange(selectedOrder.order_id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button className="btn btn-primary btn-sm" onClick={() => setSelectedOrder(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Product Modal with File Image Upload */}
        {showAddProductModal && (
          <div className="modal-overlay" onClick={() => setShowAddProductModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Add New Menu Item 🌶️</h3>
                <button className="cart-close-btn" onClick={() => setShowAddProductModal(false)}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateProductSubmit}>
                <div className="form-group">
                  <label className="form-label">Item Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Gongura Pickle"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Spicy & tangy sorrel leaves pickle..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    required
                  />
                </div>

                {/* File Image Upload */}
                <div className="form-group">
                  <label className="form-label">Product Image Upload</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-input"
                    onChange={handleImageFileChange}
                    style={{ padding: '8px' }}
                  />
                  {uploadingImage && <div style={{ fontSize: '12px', color: '#d97706', marginTop: '4px' }}>Uploading image...</div>}
                  {imagePreview && (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <span style={{ fontSize: '12px', color: '#16a34a' }}>✓ Image uploaded!</span>
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Price (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-input"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    >
                      <option value="pickles">Pickles</option>
                      <option value="snacks">Snacks</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Weight</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newProduct.weight}
                      onChange={(e) => setNewProduct({ ...newProduct, weight: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Spice Level (0-5)</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      className="form-input"
                      value={newProduct.spice_level}
                      onChange={(e) => setNewProduct({ ...newProduct, spice_level: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '16px' }}>
                  Save Menu Item
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
