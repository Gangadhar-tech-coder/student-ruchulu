export default function Hero({ onOrderNowClick, onBestsellersClick }) {
  return (
    <section className="hero">
      <div className="container hero-inner">
        <div>
          <div className="hero-badge">
            <span>✨ Freshly made this week</span>
          </div>
          <h1 className="hero-title">
            Ammamma's <span className="highlight">Avakaya</span>.<br />
            Now a click away.
          </h1>
          <p className="hero-description">
            Small-batch homemade pickles and crispy traditional snacks — hand-made by home cooks, delivered straight to your door.
          </p>

          <div className="hero-buttons">
            <button className="btn btn-primary btn-lg" onClick={onOrderNowClick}>
              Order Now ➔
            </button>
            <button className="btn btn-outline btn-lg" onClick={onBestsellersClick}>
              🔥 Best-sellers
            </button>
          </div>

          <div className="hero-trust">
            <div className="hero-trust-item">
              <span className="hero-trust-icon">✅</span> 100% Homemade
            </div>
            <div className="hero-trust-item">
              <span className="hero-trust-icon">🚚</span> Free delivery over ₹999
            </div>
          </div>
        </div>

        <div className="hero-image-wrapper">
          <div className="hero-image-glow"></div>
          <img
            src="/images/avakaya.jpg"
            alt="Traditional Andhra Avakaya Pickle"
            className="hero-image"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1695568181747-f54dff1d4654?auto=format&fit=crop&q=80&w=800';
            }}
          />
          <div className="hero-floating-card">
            <span className="icon">✨</span>
            <div>
              <div className="label">2 Top Categories</div>
              <div className="sublabel">Pickles • Crispy Snacks</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
