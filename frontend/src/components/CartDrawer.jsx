import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalAmount } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const fallbackImages = {
    pickles: 'https://images.pexels.com/photos/7812134/pexels-photo-7812134.jpeg?auto=compress&cs=tinysrgb&w=600',
    snacks: 'https://images.pexels.com/photos/34347890/pexels-photo-34347890.jpeg?auto=compress&cs=tinysrgb&w=600',
    sweets: 'https://images.pexels.com/photos/38524183/pexels-photo-38524183.jpeg?auto=compress&cs=tinysrgb&w=600',
  };

  return (
    <>
      <div className="cart-overlay" onClick={closeCart}></div>
      <div className="cart-drawer">
        <div className="cart-drawer-header">
          <h3 className="cart-drawer-title">
            <span>🛒 Your Cart</span>
          </h3>
          <button className="cart-close-btn" onClick={closeCart}>
            ✕
          </button>
        </div>

        <div className="cart-drawer-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="icon">🛍️</div>
              <p>Your cart is empty</p>
              <button className="btn btn-primary btn-sm" onClick={closeCart}>
                Browse Products
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="cart-item-image"
                  onError={(e) => {
                    e.target.src = fallbackImages[item.category] || fallbackImages.pickles;
                  }}
                />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-weight">{item.weight || '250g'}</div>
                  <div className="cart-item-controls">
                    <div className="qty-controls">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <div className="cart-item-price">₹{item.price * item.quantity}</div>
                  </div>
                </div>
                <button
                  className="cart-item-remove"
                  onClick={() => removeItem(item.id)}
                  title="Remove item"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-subtotal">
              <span>Total Amount</span>
              <span>₹{totalAmount}</span>
            </div>
            {totalAmount < 999 ? (
              <div className="cart-free-delivery">
                Add ₹{999 - totalAmount} more for FREE delivery! 🚚
              </div>
            ) : (
              <div className="cart-free-delivery">
                🎉 You unlocked FREE delivery!
              </div>
            )}
            <button className="checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout ➔
            </button>
          </div>
        )}
      </div>
    </>
  );
}
