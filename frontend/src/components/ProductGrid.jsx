import ProductCard from './ProductCard';

export default function ProductGrid({
  products,
  loading,
  activeCategory,
  setActiveCategory,
}) {
  const categories = [
    { id: 'all', label: 'All ✨' },
    { id: 'pickles', label: 'Pickles 🥒' },
    { id: 'snacks', label: 'Snacks 🍿' },
  ];

  return (
    <section id="shop" className="shop-section container">
      <div className="shop-header">
        <h2 className="shop-title">Our Kitchen Menu</h2>
        <div className="filter-pills">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`filter-pill ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="product-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="skeleton skeleton-card"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="no-products">
          <div className="icon">🍲</div>
          <h3>No items found</h3>
          <p>Try clearing filters or searching for something else.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
