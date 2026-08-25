import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useUserAuth } from '../context/UserAuthContext';
import { useToast } from '../context/ToastContext';
import { createOrder, createPaymentOrder } from '../utils/api';

export default function Checkout() {
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useUserAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    address: '',
    city: '',
    pincode: '',
    notes: '',
  });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        customer_name: user.name || prev.customer_name,
        customer_email: user.email || prev.customer_email,
        customer_phone: user.phone || prev.customer_phone,
        address: user.address || prev.address,
        city: user.city || prev.city,
        pincode: user.pincode || prev.pincode,
      }));
    }
  }, [user]);

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  if (items.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <h2>Your cart is empty</h2>
          <p style={{ marginTop: '10px', color: '#78716c' }}>
            Add some delicious pickles or snacks before checking out!
          </p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>
            Go to Shop
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const validate = () => {
    const errs = {};
    if (!form.customer_name.trim()) errs.customer_name = 'Name is required';
    if (!form.customer_email.trim()) errs.customer_email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.customer_email)) errs.customer_email = 'Invalid email';
    if (!form.customer_phone.trim()) errs.customer_phone = 'Phone is required';
    else if (form.customer_phone.length < 10) errs.customer_phone = 'Enter valid 10-digit phone';
    if (!form.address.trim()) errs.address = 'Address is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.pincode.trim()) errs.pincode = 'Pincode is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    try {
      const orderPayload = {
        ...form,
        items,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
      };

      if (paymentMethod === 'razorpay') {
        const res = await loadRazorpayScript();
        if (!res) {
          addToast('Razorpay SDK failed to load. Falling back to order placement.', 'error');
          const createdOrder = await createOrder(orderPayload);
          clearCart();
          navigate('/order-success', { state: { order: createdOrder } });
          return;
        }

        try {
          const payOrder = await createPaymentOrder(totalAmount);
          const options = {
            key: payOrder.key_id,
            amount: payOrder.amount,
            currency: payOrder.currency,
            name: 'Student Ruchulu',
            description: 'Homemade Pickles & Snacks Order',
            order_id: payOrder.order_id,
            prefill: {
              name: form.customer_name,
              email: form.customer_email,
              contact: form.customer_phone,
            },
            theme: { color: '#b91c1c' },
            handler: async function (response) {
              const finalPayload = {
                ...orderPayload,
                payment_id: response.razorpay_payment_id,
                payment_order_id: response.razorpay_order_id,
                payment_status: 'paid',
              };
              const createdOrder = await createOrder(finalPayload);
              clearCart();
              addToast('Order placed & payment verified! Email sent to registered mail 📩', 'success');
              navigate('/order-success', { state: { order: createdOrder } });
            },
            modal: {
              ondismiss: async function () {
                addToast('Payment cancelled. Creating order with pending payment status.', 'info');
                const createdOrder = await createOrder(orderPayload);
                clearCart();
                navigate('/order-success', { state: { order: createdOrder } });
              },
            },
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        } catch (payErr) {
          console.warn('Payment API test mode note:', payErr);
          const createdOrder = await createOrder({ ...orderPayload, payment_status: 'pending' });
          clearCart();
          addToast('Order placed! Confirmation sent to your registered email 📩', 'success');
          navigate('/order-success', { state: { order: createdOrder } });
        }
      } else {
        const createdOrder = await createOrder(orderPayload);
        clearCart();
        addToast('Order placed! Confirmation sent to your registered email 📩', 'success');
        navigate('/order-success', { state: { order: createdOrder } });
      }
    } catch (err) {
      addToast(err.message || 'Failed to place order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const deliveryFee = totalAmount >= 999 ? 0 : 50;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="checkout-page container">
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '24px' }}>
          Checkout 📦
        </h1>

        {!user && (
          <div
            style={{
              background: '#fef3c7',
              border: '1px solid #fde68a',
              padding: '14px 20px',
              borderRadius: '12px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <strong>Have an account?</strong> Login with OTP to pre-fill your details and track orders.
            </div>
            <Link to="/login" state={{ from: '/checkout' }} className="btn btn-outline btn-sm">
              Login via OTP
            </Link>
          </div>
        )}

        <div className="checkout-grid">
          <div>
            <h2 className="checkout-section-title">Delivery Details</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="customer_name"
                  className={`form-input ${errors.customer_name ? 'error' : ''}`}
                  placeholder="e.g. Rahul Sharma"
                  value={form.customer_name}
                  onChange={handleInputChange}
                />
                {errors.customer_name && <div className="form-error">{errors.customer_name}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Registered Email Address (Receipt sent here)</label>
                  <input
                    type="email"
                    name="customer_email"
                    className={`form-input ${errors.customer_email ? 'error' : ''}`}
                    placeholder="e.g. rahul@example.com"
                    value={form.customer_email}
                    onChange={handleInputChange}
                  />
                  {errors.customer_email && <div className="form-error">{errors.customer_email}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="customer_phone"
                    className={`form-input ${errors.customer_phone ? 'error' : ''}`}
                    placeholder="10-digit mobile number"
                    value={form.customer_phone}
                    onChange={handleInputChange}
                  />
                  {errors.customer_phone && <div className="form-error">{errors.customer_phone}</div>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Address</label>
                <input
                  type="text"
                  name="address"
                  className={`form-input ${errors.address ? 'error' : ''}`}
                  placeholder="House/Flat No., Street, Area"
                  value={form.address}
                  onChange={handleInputChange}
                />
                {errors.address && <div className="form-error">{errors.address}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    className={`form-input ${errors.city ? 'error' : ''}`}
                    placeholder="City"
                    value={form.city}
                    onChange={handleInputChange}
                  />
                  {errors.city && <div className="form-error">{errors.city}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    className={`form-input ${errors.pincode ? 'error' : ''}`}
                    placeholder="6-digit pincode"
                    value={form.pincode}
                    onChange={handleInputChange}
                  />
                  {errors.pincode && <div className="form-error">{errors.pincode}</div>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Order Notes (Optional)</label>
                <input
                  type="text"
                  name="notes"
                  className="form-input"
                  placeholder="e.g. Less spicy, call before delivery"
                  value={form.notes}
                  onChange={handleInputChange}
                />
              </div>

              <h2 className="checkout-section-title" style={{ marginTop: '32px' }}>
                Payment Method
              </h2>
              <div className="payment-methods">
                {/* Online Payment Gateway (UPI / Cards / NetBanking) - Commented out for now; activate later
                <div className="payment-method" onClick={() => setPaymentMethod('razorpay')}>
                  <input
                    type="radio"
                    id="razorpay"
                    name="payment"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                  />
                  <label htmlFor="razorpay">
                    💳 Pay via UPI / Razorpay (Cards, UPI, NetBanking)
                  </label>
                </div>
                */}
                <div className="payment-method" onClick={() => setPaymentMethod('cod')}>
                  <input
                    type="radio"
                    id="cod"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <label htmlFor="cod">💵 Cash on Delivery (COD)</label>
                </div>
              </div>

              <button
                type="submit"
                className="checkout-btn"
                style={{ marginTop: '24px' }}
                disabled={submitting}
              >
                {submitting ? 'Placing Order...' : `Place Order • ₹${totalAmount + deliveryFee}`}
              </button>
            </form>
          </div>

          <div>
            <div className="order-summary-card">
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
                Order Summary ({items.length} items)
              </h3>

              {items.map((item) => (
                <div key={item.id} className="order-summary-item">
                  <div>
                    <div style={{ fontWeight: '600' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: '#a8a29e' }}>
                      Qty: {item.quantity} × ₹{item.price}
                    </div>
                  </div>
                  <div style={{ fontWeight: '600' }}>₹{item.price * item.quantity}</div>
                </div>
              ))}

              <div className="order-summary-item" style={{ marginTop: '12px' }}>
                <span>Subtotal</span>
                <span>₹{totalAmount}</span>
              </div>

              <div className="order-summary-item">
                <span>Delivery Charge</span>
                <span>{deliveryFee === 0 ? <strong style={{ color: '#16a34a' }}>FREE</strong> : `₹${deliveryFee}`}</span>
              </div>

              <div className="order-summary-total">
                <span>Total Amount</span>
                <span style={{ color: '#b91c1c' }}>₹{totalAmount + deliveryFee}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
