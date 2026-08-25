import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminLogin } from '../utils/api';

export default function AdminLogin() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('studentruchulu2024');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await adminLogin({ username, password });
      login(data.token);
      addToast('Welcome back, Admin! 👋', 'success');
      navigate('/admin/dashboard');
    } catch (err) {
      addToast(err.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <img
            src="/logo.png"
            alt="Student Ruchulu Logo"
            style={{ margin: '0 auto 12px', height: '64px', objectFit: 'contain', display: 'block' }}
          />
          <h1 className="admin-login-title">Admin Portal</h1>
          <p className="admin-login-subtitle">Student Ruchulu Management</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
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
            {loading ? 'Logging in...' : 'Sign In ➔'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#a8a29e' }}>
          Default Username: <code>admin</code> | Password: <code>studentruchulu2024</code>
        </div>
      </div>
    </div>
  );
}
