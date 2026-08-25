export default function CategoryCards({ activeCategory, onSelectCategory }) {
  const categories = [
    {
      id: 'pickles',
      name: 'Pickles',
      emoji: '🥒',
      image: '/images/gongura.jpg',
      fallback: 'https://images.pexels.com/photos/7812134/pexels-photo-7812134.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      id: 'snacks',
      name: 'Snacks',
      emoji: '🍿',
      image: '/images/murukku.jpg',
      fallback: 'https://images.pexels.com/photos/34347890/pexels-photo-34347890.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
  ];

  return (
    <section className="categories container">
      <div className="categories-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-card ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat.id === activeCategory ? 'all' : cat.id)}
          >
            <img
              src={cat.image}
              alt={cat.name}
              onError={(e) => {
                e.target.src = cat.fallback;
              }}
            />
            <div className="overlay"></div>
            <div className="content">
              <div className="emoji">{cat.emoji}</div>
              <div className="name">{cat.name}</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
