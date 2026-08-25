import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CategoryCards from '../components/CategoryCards';
import ProductGrid from '../components/ProductGrid';
import CartDrawer from '../components/CartDrawer';
import Footer from '../components/Footer';
import { fetchProducts } from '../utils/api';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCategory && activeCategory !== 'all') params.category = activeCategory;
    if (search) params.search = search;

    fetchProducts(params)
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, [activeCategory, search]);

  const handleOrderNowClick = () => {
    const shopEl = document.getElementById('shop');
    if (shopEl) shopEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBestsellersClick = () => {
    setLoading(true);
    fetchProducts({ bestsellers: 'true' })
      .then((data) => {
        setProducts(data);
        setLoading(false);
        const shopEl = document.getElementById('shop');
        if (shopEl) shopEl.scrollIntoView({ behavior: 'smooth' });
      })
      .catch(() => setLoading(false));
  };

  return (
    <div className="min-h-screen">
      <Navbar search={search} setSearch={setSearch} />
      <Hero
        onOrderNowClick={handleOrderNowClick}
        onBestsellersClick={handleBestsellersClick}
      />
      <CategoryCards
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />
      <ProductGrid
        products={products}
        loading={loading}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
      <CartDrawer />
      <Footer />
    </div>
  );
}
