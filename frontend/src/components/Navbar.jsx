import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUserAuth } from '../context/UserAuthContext';

export default function Navbar({ search, setSearch }) {
  const { totalItems, toggleCart } = useCart();
  const { user, logoutUser } = useUserAuth();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="Student Ruchulu Logo" className="logo-img" />
          <div className="logo-text">
            <span className="logo-text-main">Student Ruchulu</span>
          </div>
        </Link>

        {setSearch && (
          <div className="navbar-search">
            <span className="navbar-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search pickles, snacks..."
              value={search || ''}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}

        <div className="navbar-actions">
          {user ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1c1917' }}>
                👤 {user.name || user.email}
              </span>
              <button
                className="admin-link"
                onClick={logoutUser}
                title="Logout"
                style={{ cursor: 'pointer', border: 'none', background: 'none' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="admin-link" style={{ fontWeight: '600', color: '#b91c1c' }}>
              👤 Login
            </Link>
          )}

          <button className="cart-btn" onClick={toggleCart} aria-label="Shopping Cart">
            <span>🛒 Cart</span>
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
