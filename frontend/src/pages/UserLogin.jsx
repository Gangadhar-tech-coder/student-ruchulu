import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useUserAuth } from '../context/UserAuthContext';
import { useToast } from '../context/ToastContext';
import { sendOtp, verifyOtp } from '../utils/api';

export default function UserLogin() {
  const [step, setStep] = useState('input'); // 'input' | 'otp'
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser } = useUserAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || '/';

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !identifier.includes('@')) {
      addToast('Please enter a valid Email Address', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await sendOtp(identifier.trim());
      addToast(data.message || 'OTP code sent to your email inbox! 📩', 'success');
      if (data.dev_otp) {
        addToast(`🔑 Verification Code: ${data.dev_otp}`, 'info');
      }
      setStep('otp');
    } catch (err) {
      addToast(err.message || 'Failed to send OTP to email', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.length < 4) {
      addToast('Please enter valid verification code', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await verifyOtp(identifier.trim(), otp.trim(), name.trim());
      loginUser(data.token, data.user);
      addToast('Login successful! Welcome back 👋', 'success');
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 100);
    } catch (err) {
      addToast(err.message || 'Invalid OTP code', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Navbar />
        <div className="admin-login-page" style={{ background: 'var(--bg-primary)' }}>
          <div className="admin-login-card">
            <div className="admin-login-logo">
              <img
                src="/logo.png"
                alt="Student Ruchulu Logo"
                style={{ margin: '0 auto 12px', height: '64px', objectFit: 'contain', display: 'block' }}
              />
              <h1 className="admin-login-title">Customer Login</h1>
              <p className="admin-login-subtitle">Email OTP Verification</p>
            </div>

            {step === 'input' ? (
              <form onSubmit={handleSendOtp}>
                <div className="form-group">
                  <label className="form-label">Registered Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. name@example.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Your Name (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginTop: '12px' }}
                  disabled={loading}
                >
                  {loading ? 'Sending OTP to Email...' : 'Send Email OTP 📩'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div className="form-group">
                  <label className="form-label">Enter 6-Digit Verification Code</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="123456"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    style={{ letterSpacing: '6px', fontSize: '20px', textAlign: 'center' }}
                    required
                  />
                  <div style={{ fontSize: '12px', color: '#78716c', marginTop: '6px' }}>
                    Verification code sent to <strong>{identifier}</strong>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginTop: '8px' }}
                  disabled={loading}
                >
                  {loading ? 'Verifying Code...' : 'Verify & Continue ➔'}
                </button>

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%', marginTop: '12px' }}
                  onClick={() => setStep('input')}
                >
                  ← Change Email Address
                </button>
              </form>
            )}

            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px' }}>
              <Link to="/" style={{ color: '#57534e' }}>
                ← Back to Shop
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
