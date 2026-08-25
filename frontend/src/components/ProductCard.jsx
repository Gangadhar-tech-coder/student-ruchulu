import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem(product);
    setAdded(true);
    addToast(`Added ${product.name} to cart! 🛒`, 'success');
    setTimeout(() => setAdded(false), 1500);
  };

  const renderSpiceLevel = (level) => {
    if (!level || level === 0) return null;
    return (
      <span className="spice-level" title={`Spice level: ${level}/5`}>
        {'🌶️'.repeat(level)}
      </span>
    );
  };

  const fallbackImages = {
    pickles: 'https://images.pexels.com/photos/7812134/pexels-photo-7812134.jpeg?auto=compress&cs=tinysrgb&w=600',
    snacks: 'https://images.pexels.com/photos/34347890/pexels-photo-34347890.jpeg?auto=compress&cs=tinysrgb&w=600',
    sweets: 'https://images.pexels.com/photos/38524183/pexels-photo-38524183.jpeg?auto=compress&cs=tinysrgb&w=600',
  };

  return (
    <div className="product-card">
      <div className="product-card-image">
        <img
          src={product.image_url}
          alt={product.name}
          onError={(e) => {
            e.target.src = fallbackImages[product.category] || fallbackImages.pickles;
          }}
        />
        {product.is_bestseller === 1 && (
          <span className="product-badge">🔥 Bestseller</span>
        )}
      </div>

      <div className="product-card-body">
        <div className="product-card-category">{product.category}</div>
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-desc">{product.description}</p>

        <div className="product-card-meta">
          <span>📦 {product.weight || '250g'}</span>
          {renderSpiceLevel(product.spice_level)}
        </div>

        <div className="product-card-footer">
          <div className="product-price">
            <span>₹</span>{product.price}
          </div>
          <button
            className={`add-to-cart-btn ${added ? 'added' : ''}`}
            onClick={handleAddToCart}
          >
            {added ? '✓ Added' : '+ Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
