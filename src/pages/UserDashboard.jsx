import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../context/CartContext';

const ORDER_STEPS = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
const STEP_INDEX = Object.fromEntries(ORDER_STEPS.map((s, i) => [s, i]));

const formatPrice = (n) => `$${(Number(n) ?? 0).toFixed(2)}`;

const UserDashboard = () => {
  const { user } = useAuth();
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal, placeOrder } = useCart();
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('orders');

  const placeOrderHandler = async () => {
    if (cart.length === 0) return;
    try {
      const items = cart.map((c) => ({ product: c.product._id, quantity: c.quantity }));
      await api.post('/orders', { items });
      setMessage('Order placed successfully!');
      clearCart();
      const ordersRes = await api.get('/orders/my');
      setOrders(ordersRes.data);
      setActiveTab('orders');
    } catch {
      setMessage('Failed to place order');
    }
  };

  useEffect(() => {
    api.get('/orders/my').then((res) => setOrders(res.data)).catch(console.error);
  }, []);

  return (
    <div className="dashboard-page">
      <h2 className="dashboard-title">My Dashboard</h2>
      {message && <div className={`info ${message.includes('Failed') ? 'error' : ''}`}>{message}</div>}

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button
          className={`tab-btn ${activeTab === 'cart' ? 'active' : ''}`}
          onClick={() => setActiveTab('cart')}
        >
          Cart {cart.length > 0 && `(${cart.length})`}
        </button>
        <button
          className={`tab-btn ${activeTab === 'promos' ? 'active' : ''}`}
          onClick={() => setActiveTab('promos')}
        >
          WOW Deals
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
        <button
          className={`tab-btn ${activeTab === 'support' ? 'active' : ''}`}
          onClick={() => setActiveTab('support')}
        >
          Support
        </button>
      </div>

      {activeTab === 'profile' && (
        <section className="dashboard-section">
          <h3>Profile Summary</h3>
          <div className="profile-card">
            <div className="profile-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'orders' && (
        <section className="dashboard-section">
          <h3>Order History</h3>
          {orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            <div className="order-cards">
              {orders.map((o) => {
                const status = o.status || 'pending';
                const isCancelled = status === 'cancelled';
                const currentStep = isCancelled ? -1 : (STEP_INDEX[status] ?? 0);
                const progressPercent = isCancelled ? 0 : ((currentStep + 1) / ORDER_STEPS.length) * 100;
                const statusLabel = status === 'pending' ? 'Pending' :
                  status === 'confirmed' ? 'Preparing' : status === 'preparing' ? 'Preparing' :
                  status === 'out_for_delivery' ? 'Out for Delivery' :
                  status === 'delivered' ? 'Delivered' : status.replace(/_/g, ' ');
                return (
                  <div key={o._id} className="order-card">
                    <div className="order-card-header">
                      <span className="order-id">Order #{o._id?.slice(-6)}</span>
                      <span className={`status-badge status-${status.replace('_', '-')}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <p className="order-card-meta">
                      {formatPrice(o.totalAmount)} · {o.items?.length || 0} items
                    </p>
                    <p className="order-card-date">
                      {o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}
                    </p>
                    {o.items?.length > 0 && (
                      <ul className="order-items-list">
                        {o.items.map((item, i) => (
                          <li key={i}>
                            {item.product?.name || 'Product'} × {item.quantity} — {formatPrice((item.product?.price ?? 0) * item.quantity)}
                          </li>
                        ))}
                      </ul>
                    )}
                    {status === 'out_for_delivery' && (
                      <p className="order-estimated-delivery">
                        Estimated delivery: about 30–45 minutes
                      </p>
                    )}
                    {!isCancelled && status !== 'delivered' && (
                      <div className="order-progress-wrap">
                        <div className="order-progress-bar">
                          <div
                            className="order-progress-fill"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <div className="order-progress-steps">
                          {['Pending', 'Preparing', 'Out for Delivery', 'Delivered'].map((step, i) => (
                            <span
                              key={step}
                              className={`order-step ${i <= currentStep ? 'done' : ''}`}
                            >
                              {step}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {activeTab === 'cart' && (
        <section className="dashboard-section">
          <h3>Current Cart</h3>
          {cart.length === 0 ? (
            <p>No items in cart.</p>
          ) : (
            <>
              <ul className="cart-list">
                {cart.map((item) => (
                  <li key={item.product?._id} className="cart-item">
                    <div className="cart-item-image-wrap">
                      <img
                        src={item.product?.image || item.product?.imageUrl || 'https://via.placeholder.com/80/1f2937/9ca3af?text=P'}
                        alt=""
                        className="cart-item-image"
                      />
                    </div>
                    <div className="cart-item-details">
                      <span className="cart-item-name">{item.product?.name}</span>
                      <span className="cart-item-qty">× {item.quantity}</span>
                      <div className="cart-item-actions">
                        <button onClick={() => updateQuantity(item.product?._id, -1)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product?._id, 1)}>+</button>
                        <button className="remove-btn" onClick={() => removeFromCart(item.product?._id)}>Remove</button>
                      </div>
                    </div>
                    <span className="cart-item-price">{formatPrice((item.product?.price ?? 0) * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <p className="cart-total">Total: {formatPrice(cartTotal)}</p>
              <button className="btn-primary" onClick={placeOrderHandler}>
                Checkout
              </button>
            </>
          )}
        </section>
      )}

      {activeTab === 'promos' && (
        <section className="dashboard-section">
          <h3>WOW Deals for You</h3>
          <div className="promo-cards promo-cards-compact">
            <div className="promo-card promo-limited">
              <span className="promo-label">Limited Time</span>
              <h4>2 Large Pizzas at 50% Off</h4>
            </div>
            <div className="promo-card">
              <span className="promo-label">Limited Time</span>
              <h4>Free Fries with Any Burger</h4>
            </div>
            <div className="promo-card">
              <span className="promo-label">Seasonal</span>
              <h4>Family Feast Combo</h4>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'settings' && (
        <section className="dashboard-section">
          <h3>Account Settings</h3>
          <div className="settings-card">
            <p><strong>Update Profile:</strong> Coming soon.</p>
            <p><strong>Change Password:</strong> Coming soon.</p>
            <p><strong>Manage Addresses:</strong> Coming soon.</p>
            <p><strong>Payment Methods:</strong> Coming soon.</p>
          </div>
        </section>
      )}

      {activeTab === 'support' && (
        <section className="dashboard-section">
          <h3>Support & Help</h3>
          <div className="support-card">
            <p>Need help? Contact us:</p>
            <a href="mailto:support@pizzahut.com" className="support-link">support@pizzahut.com</a>
            <p className="faq-title">FAQs</p>
            <ul className="faq-list">
              <li><strong>How do I track my order?</strong> — Go to Orders in your dashboard to see status.</li>
              <li><strong>Can I modify my order?</strong> — Contact support within 5 minutes of placing.</li>
              <li><strong>Refund policy?</strong> — Full refund if order is cancelled before preparation.</li>
            </ul>
            <button className="btn-primary">Contact Support</button>
          </div>
        </section>
      )}
    </div>
  );
};

export default UserDashboard;
