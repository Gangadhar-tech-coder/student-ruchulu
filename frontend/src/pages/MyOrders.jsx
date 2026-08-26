import { useState, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useUserAuth } from '../context/UserAuthContext';
import { fetchMe } from '../utils/api';

export default function MyOrders() {
  const { user, userToken, logoutUser } = useUserAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    if (!userToken) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchMe(userToken);
      setProfileData(data);
    } catch (err) {
      setError(err.message || 'Failed to load order history');
    } finally {
      setLoading(false);
    }
  }, [userToken]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (!userToken) {
    return <Navigate to="/login" replace />;
  }

  const getStatusStep = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      case 'cancelled': return -1;
      default: return 0; // pending
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' };
      case 'processing': return { bg: '#e0e7ff', color: '#3730a3', border: '#c7d2fe' };
      case 'shipped': return { bg: '#fef3c7', color: '#92400e', border: '#fde68a' };
      case 'delivered': return { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' };
      case 'cancelled': return { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' };
      default: return { bg: '#fef9c3', color: '#854d0e', border: '#fef08a' };
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ background: '#fafaf9' }}>
      <div>
        <Navbar />
        
        <div style={{ maxWidth: '900px', margin: '32px auto', padding: '0 20px' }}>
          
          {/* Top Bar Header */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: 'white', padding: '20px 24px', borderRadius: '16px', border: '1px solid #e7e5e4', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1c1917', margin: 0 }}>
                📦 My Profile & Order History
              </h1>
              <p style={{ fontSize: '13px', color: '#78716c', margin: '4px 0 0' }}>
                Welcome back, <strong>{profileData?.name || user?.name || user?.email}</strong>!
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                onClick={loadProfile}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #d6d3d1', background: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                🔄 Refresh Status
              </button>
              <button
                onClick={logoutUser}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fff5f5', color: '#dc2626', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Logout
              </button>
            </div>
          </div>

          {/* Account Profile Card */}
          <div style={{ background: 'white', padding: '20px 24px', borderRadius: '16px', border: '1px solid #e7e5e4', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1c1917', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>👤</span> Customer Details
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '14px' }}>
              <div>
                <span style={{ color: '#78716c', fontSize: '12px', display: 'block' }}>Email Address</span>
                <strong>{profileData?.email || user?.email}</strong>
              </div>
              <div>
                <span style={{ color: '#78716c', fontSize: '12px', display: 'block' }}>Phone Number</span>
                <strong>{profileData?.phone || 'Not provided'}</strong>
              </div>
              <div>
                <span style={{ color: '#78716c', fontSize: '12px', display: 'block' }}>Total Orders</span>
                <strong>{profileData?.orders?.length || 0} Orders Placed</strong>
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1c1917', marginBottom: '16px' }}>
            Your Orders ({profileData?.orders?.length || 0})
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px' }}>
              <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
              <p style={{ color: '#78716c' }}>Fetching your latest order status...</p>
            </div>
          ) : error ? (
            <div style={{ padding: '20px', background: '#fee2e2', color: '#991b1b', borderRadius: '12px' }}>
              {error}
            </div>
          ) : !profileData?.orders || profileData.orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', background: 'white', borderRadius: '16px', border: '1px solid #e7e5e4' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛒</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 8px' }}>No Orders Found</h3>
              <p style={{ color: '#78716c', fontSize: '14px', marginBottom: '20px' }}>
                You haven't placed any orders yet. Explore our authentic Andhra pickles & snacks menu!
              </p>
              <Link to="/" className="btn btn-primary">
                Browse Menu 🌶️
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {profileData.orders.map((order) => {
                const currentStep = getStatusStep(order.order_status);
                const badgeStyle = getStatusBadgeStyle(order.order_status);

                return (
                  <div
                    key={order.id}
                    style={{ background: 'white', borderRadius: '16px', border: '1px solid #e7e5e4', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}
                  >
                    {/* Header */}
                    <div style={{ padding: '16px 20px', background: '#fafaf9', borderBottom: '1px solid #f5f5f4', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#1c1917' }}>
                          Order #{order.order_id}
                        </span>
                        <div style={{ fontSize: '12px', color: '#78716c', marginTop: '2px' }}>
                          Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          background: badgeStyle.bg,
                          color: badgeStyle.color,
                          border: `1px solid ${badgeStyle.border}`
                        }}>
                          {order.order_status}
                        </span>
                      </div>
                    </div>

                    {/* Order Progress Timeline */}
                    {currentStep >= 0 && (
                      <div style={{ padding: '20px', background: '#fffcf5', borderBottom: '1px solid #f5f5f4' }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#92400e', marginBottom: '12px' }}>
                          LIVE ORDER TRACKER
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                          {['Confirmed', 'Processing', 'Shipped', 'Delivered'].map((stepName, i) => {
                            const stepNum = i + 1;
                            const isCompleted = currentStep >= stepNum;
                            const isCurrent = currentStep === stepNum;

                            return (
                              <div key={stepName} style={{ flex: 1, textAlign: 'center', zIndex: 1 }}>
                                <div style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  background: isCompleted ? '#166534' : isCurrent ? '#d97706' : '#e7e5e4',
                                  color: isCompleted || isCurrent ? 'white' : '#78716c',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  margin: '0 auto 6px',
                                  fontWeight: '800',
                                  fontSize: '12px',
                                  boxShadow: isCurrent ? '0 0 0 4px #fef3c7' : 'none'
                                }}>
                                  {isCompleted ? '✓' : stepNum}
                                </div>
                                <div style={{ fontSize: '11px', fontWeight: isCompleted || isCurrent ? '700' : '500', color: isCompleted ? '#166534' : isCurrent ? '#b45309' : '#a8a29e' }}>
                                  {stepName}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Body */}
                    <div style={{ padding: '20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                        
                        {/* Items */}
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#57534e', marginBottom: '10px' }}>
                            Items Ordered:
                          </div>
                          {Array.isArray(order.items) && order.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                              <span>{item.name} × <strong>{item.quantity}</strong></span>
                              <span style={{ fontWeight: '600', color: '#1c1917' }}>₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Delivery Info */}
                        <div style={{ background: '#fafaf9', padding: '14px', borderRadius: '12px', border: '1px solid #f5f5f4' }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#78716c', marginBottom: '6px' }}>
                            DELIVERY ADDRESS:
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#1c1917' }}>
                            {order.customer_name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#57534e', marginTop: '2px' }}>
                            {order.address}, {order.city} — {order.pincode}
                          </div>
                          <div style={{ fontSize: '12px', color: '#78716c', marginTop: '4px' }}>
                            📞 {order.customer_phone}
                          </div>
                        </div>

                      </div>

                      {/* Summary footer */}
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f5f5f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '13px' }}>
                          Payment: <span style={{ fontWeight: '700', textTransform: 'uppercase', color: order.payment_status === 'paid' ? '#166534' : '#b45309' }}>{order.payment_status}</span>
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: '#b91c1c' }}>
                          Total: ₹{order.total_amount}
                        </div>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
      <Footer />
    </div>
  );
}
