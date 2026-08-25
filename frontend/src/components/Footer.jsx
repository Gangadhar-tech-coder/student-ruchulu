import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="dark-footer">
      <div className="container">
        <div className="dark-footer-grid">
          {/* Brand Col */}
          <div className="dark-footer-brand">
            <Link to="/" className="dark-footer-logo">
              <img src="/logo.png" alt="Student Ruchulu Logo" className="dark-footer-logo-img" />
              <span className="dark-footer-logo-text">Student Ruchulu</span>
            </Link>
            <p className="dark-footer-desc">
              Authentic Andhra-style homemade pickles and crunchy traditional snacks, crafted with pure ingredients and traditional recipes in Hyderabad.
            </p>
            <div className="dark-footer-badges">
              <span className="footer-tag">🥒 100% Homemade</span>
              <span className="footer-tag">✨ Fresh Small Batches</span>
              <span className="footer-tag">🚚 Doorstep Delivery</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="dark-footer-col">
            <h4 className="dark-footer-title">Quick Links</h4>
            <ul className="dark-footer-links">
              <li><Link to="/">Home</Link></li>
              <li><a href="#shop">Pickles & Snacks Menu</a></li>
              <li><Link to="/login">Customer Login / Signup</Link></li>
              <li><Link to="/checkout">View Cart & Checkout</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="dark-footer-col">
            <h4 className="dark-footer-title">Contact & Orders</h4>
            <ul className="dark-footer-contact">
              <li>
                <span className="contact-icon">📞</span>
                <div>
                  <div className="contact-label">Phone / WhatsApp</div>
                  <div className="contact-val">
                    <a href="tel:7893416596">+91 78934 16596</a> / <a href="tel:7997654596">+91 79976 54596</a>
                  </div>
                </div>
              </li>
              <li>
                <span className="contact-icon">✉️</span>
                <div>
                  <div className="contact-label">Email Support</div>
                  <div className="contact-val">
                    <a href="mailto:studentruchulu@gmail.com">studentruchulu@gmail.com</a>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* Kitchen Location */}
          <div className="dark-footer-col">
            <h4 className="dark-footer-title">Kitchen Location</h4>
            <div className="dark-footer-location">
              <span className="location-icon">📍</span>
              <div>
                <p className="location-text">
                  <strong>Student Ruchulu Kitchen</strong><br />
                  MAISAMMAGUDA, DULAPALLY,<br />
                  HYDERABAD, TELANGANA — 500043
                </p>
                <span className="service-badge">🟢 Delivering Across Hyderabad & Pan India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="dark-footer-bottom">
          <p>© {new Date().getFullYear()} Student Ruchulu. All rights reserved. Made with love for traditional flavors ❤️</p>
          <div className="dark-footer-bottom-links">
            <span>Fresh & Hygienic</span>
            <span>•</span>
            <span>Zero Preservatives</span>
            <span>•</span>
            <span>Authentic Andhra Taste</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
