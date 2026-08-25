import { useLocation, Link, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="success-page">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h1 className="success-title">Order Placed Successfully!</h1>
          <p className="success-subtitle">
            Thank you for ordering with Student Ruchulu. Our kitchen is preparing your homemade delicious treats!
          </p>

          <div className="success-order-id">
            Order ID: #{order.order_id}
          </div>

          <div
            style={{
              textAlign: 'left',
              background: '#fffbf0',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #fde68a',
              marginBottom: '24px',
              fontSize: '14px',
            }}
          >
            <div style={{ fontWeight: '700', marginBottom: '8px', color: '#92400e' }}>
              📍 Delivery Details
            </div>
            <div><strong>Name:</strong> {order.customer_name}</div>
            <div><strong>Phone:</strong> {order.customer_phone}</div>
            <div><strong>Email:</strong> {order.customer_email}</div>
            <div><strong>Address:</strong> {order.address}, {order.city} — {order.pincode}</div>
            <div style={{ marginTop: '8px' }}>
              <strong>Total Amount:</strong> <span style={{ color: '#b91c1c', fontWeight: '700' }}>₹{order.total_amount}</span> ({order.payment_status.toUpperCase()})
            </div>
          </div>

          <div style={{ fontSize: '13px', color: '#166534', background: '#dcfce7', padding: '10px', borderRadius: '8px', marginBottom: '24px' }}>
            📩 An email notification has been sent to our kitchen admin for quick dispatch!
          </div>

          <Link to="/" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
