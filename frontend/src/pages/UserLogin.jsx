import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useUserAuth } from '../context/UserAuthContext';
import { useToast } from '../context/ToastContext';
import { loginUserWithPassword, registerUser } from '../utils/api';

export default function UserLogin() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser } = useUserAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      addToast('Please enter both Email and Password', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await loginUserWithPassword({ email: email.trim(), password: password.trim() });
      loginUser(data.token, data.user);
      addToast('Login successful! Welcome back 👋', 'success');
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 100);
    } catch (err) {
      addToast(err.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      addToast('Please enter Email and Password', 'error');
      return;
    }
    if (password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser({
        email: email.trim(),
        password: password.trim(),
        name: name.trim(),
        phone: phone.trim(),
      });
      loginUser(data.token, data.user);
      addToast('Account created successfully! Welcome to Student Ruchulu 🎉', 'success');
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 100);
    } catch (err) {
      addToast(err.message || 'Registration failed. Email might already be registered.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Navbar />
        <div className="admin-login-page" style={{ background: 'var(--bg-primary)' }}>
          <div className="admin-login-card" style={{ maxWidth: '440px' }}>
            <div className="admin-login-logo">
              <img
                src="/logo.png"
                alt="Student Ruchulu Logo"
                style={{ margin: '0 auto 12px', height: '64px', objectFit: 'contain', display: 'block' }}
              />
              <h1 className="admin-login-title">Customer Account</h1>
              <p className="admin-login-subtitle">
                {isRegister ? 'Create a new account' : 'Sign in with Email & Password'}
              </p>
            </div>

            {/* Mode Switch Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: '#f5f5f4', padding: '4px', borderRadius: '10px' }}>
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: !isRegister ? 'white' : 'transparent',
                  fontWeight: !isRegister ? '700' : '500',
                  boxShadow: !isRegister ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: !isRegister ? '#1c1917' : '#78716c',
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isRegister ? 'white' : 'transparent',
                  fontWeight: isRegister ? '700' : '500',
                  boxShadow: isRegister ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: isRegister ? '#1c1917' : '#78716c',
                }}
              >
                Create Account
              </button>
            </div>

            {!isRegister ? (
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginTop: '12px' }}
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In 🔑'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Phone Number (Optional)</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Choose a strong password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginTop: '12px' }}
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account ✨'}
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
