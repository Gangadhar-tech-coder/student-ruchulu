import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="dark-footer" style={{ background: '#1c1917', color: '#e7e5e4', padding: '48px 0 24px', borderTop: '1px solid #292524' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <img src="/logo.png" alt="Student Ruchulu" style={{ height: '40px', objectFit: 'contain' }} />
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#f59e0b' }}>Student Ruchulu</span>
            </div>
            <p style={{ fontSize: '13px', color: '#a8a29e', lineHeight: '1.6', marginBottom: '16px' }}>
              Authentic Andhra homemade pickles and crispy traditional snacks. Prepared in small batches with cold-pressed oils, pure ingredients, and timeless home-style recipes.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ background: '#27272a', color: '#fbbf24', fontSize: '11px', padding: '4px 10px', borderRadius: '20px', border: '1px solid #3f3f46' }}>
                🌱 100% Natural
              </span>
              <span style={{ background: '#27272a', color: '#fbbf24', fontSize: '11px', padding: '4px 10px', borderRadius: '20px', border: '1px solid #3f3f46' }}>
                🏡 Homemade Taste
              </span>
              <span style={{ background: '#27272a', color: '#fbbf24', fontSize: '11px', padding: '4px 10px', borderRadius: '20px', border: '1px solid #3f3f46' }}>
                🚫 No Artificial Additives
              </span>
            </div>
          </div>

          {/* Founders */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#fafaf9', marginBottom: '16px', borderBottom: '2px solid #d97706', paddingBottom: '6px', display: 'inline-block' }}>
              Founders
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#27272a', padding: '12px', borderRadius: '12px', border: '1px solid #3f3f46' }}>
                <div style={{ fontSize: '20px', background: '#451a03', padding: '8px', borderRadius: '50%' }}>👑</div>
                <div>
                  <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '14px' }}>Parne Abhinav</div>
                  <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '800', letterSpacing: '0.5px' }}>FOUNDER</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#27272a', padding: '12px', borderRadius: '12px', border: '1px solid #3f3f46' }}>
                <div style={{ fontSize: '20px', background: '#451a03', padding: '8px', borderRadius: '50%' }}>🚀</div>
                <div>
                  <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '14px' }}>Bollam Shivaraj</div>
                  <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '800', letterSpacing: '0.5px' }}>CO-FOUNDER</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Kitchen Details */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#fafaf9', marginBottom: '16px', borderBottom: '2px solid #d97706', paddingBottom: '6px', display: 'inline-block' }}>
              Contact & Kitchen Details
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px', color: '#d6d3d1' }}>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ background: '#451a03', color: '#f59e0b', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyCenter: 'center', justifyContent: 'center', flexShrink: 0 }}>📞</div>
                <div>
                  <div style={{ fontSize: '11px', color: '#a8a29e', fontWeight: '700', textTransform: 'uppercase' }}>PHONE SUPPORT:</div>
                  <div style={{ fontWeight: '700', color: '#ffffff' }}>
                    <a href="tel:7997654596" style={{ color: '#ffffff', textDecoration: 'none' }}>+91 7997654596</a> | <a href="tel:7893416596" style={{ color: '#ffffff', textDecoration: 'none' }}>+91 7893416596</a>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ background: '#451a03', color: '#f59e0b', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✉️</div>
                <div>
                  <div style={{ fontSize: '11px', color: '#a8a29e', fontWeight: '700', textTransform: 'uppercase' }}>EMAIL SUPPORT:</div>
                  <div style={{ fontWeight: '600', color: '#ffffff' }}>
                    <a href="mailto:studentruchulu@gmail.com" style={{ color: '#ffffff', textDecoration: 'none' }}>studentruchulu@gmail.com</a>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ background: '#451a03', color: '#f59e0b', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>📍</div>
                <div>
                  <div style={{ fontSize: '11px', color: '#a8a29e', fontWeight: '700', textTransform: 'uppercase' }}>KITCHEN LOCATION:</div>
                  <div style={{ fontWeight: '600', color: '#ffffff', lineHeight: '1.4' }}>
                    MAISAMMAGUDA, DULAPALLY, HYDERABAD, TELANGANA — 500043
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid #292524', paddingTop: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#78716c' }}>
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} Student Ruchulu. All rights reserved.</p>
          <p style={{ margin: 0 }}>
            Crafted with <span style={{ color: '#ef4444' }}>❤️</span> for food lovers across Hyderabad & beyond
          </p>
        </div>
      </div>
    </footer>
  );
}
