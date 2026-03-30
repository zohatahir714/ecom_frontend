import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { id: 'pizzas', name: 'Pizzas' },
  { id: 'burgers', name: 'Burgers' },
  { id: 'fries-sides', name: 'Fries & Sides' },
  { id: 'sandwiches-platters', name: 'Sandwiches & Platters' },
  { id: 'pastas', name: 'Pastas' },
  { id: 'drinks', name: 'Drinks' },
  { id: 'addons', name: 'Add-ons' },
  { id: 'deals', name: 'Deals' },
];

const CATEGORY_MAP = {
  Pizzas: 'pizzas',
  Burgers: 'burgers',
  'Fries & Sides': 'fries-sides',
  'Sandwiches & Platters': 'sandwiches-platters',
  Pastas: 'pastas',
  Drinks: 'drinks',
  'Add-ons': 'addons',
  Deals: 'deals',
};

const SECTION_ORDER = [
  'pizzas',
  'burgers',
  'fries-sides',
  'sandwiches-platters',
  'pastas',
  'drinks',
  'addons',
  'deals',
];

const MenuPage = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('/api/products').then((res) => setProducts(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    const hash = location.hash.slice(1) || 'pizzas';
    const el = document.getElementById(hash);
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [location.hash, products.length]);

  const productsByCategory = useMemo(() => {
    const map = {};
    for (const p of products) {
      const cat = p.category || 'Pizzas';
      const id = CATEGORY_MAP[cat] || 'pizzas';
      if (!map[id]) map[id] = [];
      map[id].push(p);
    }
    return map;
  }, [products]);

  const sectionTitles = {
    pizzas: 'Pizzas',
    burgers: 'Burgers',
    'fries-sides': 'Fries & Sides',
    'sandwiches-platters': 'Sandwiches & Platters',
    pastas: 'Pastas',
    drinks: 'Drinks',
    addons: 'Add-ons',
    deals: 'Deals',
  };

  return (
    <div className="menu-page">
      {SECTION_ORDER.map((sectionId) => {
        const items = productsByCategory[sectionId] || [];
        const title = sectionTitles[sectionId];
        const isDeals = sectionId === 'deals';

        return (
          <section key={sectionId} id={sectionId} className="menu-section menu-section-full">
            <h2 className="menu-section-title">{title}</h2>
            {isDeals && items.length > 0 ? (
              <div className="product-grid wow-deals-grid">
                {items.map((p) => (
                  <ProductCard
                    key={p._id}
                    product={p}
                    onAddToCart={user ? addToCart : null}
                  />
                ))}
              </div>
            ) : !isDeals ? (
              <div className="product-grid">
                {items.map((p) => (
                  <ProductCard
                    key={p._id}
                    product={p}
                    onAddToCart={user ? addToCart : null}
                  />
                ))}
              </div>
            ) : null}
            {items.length === 0 && (
              <p className="empty-section">No items in this category yet.</p>
            )}
          </section>
        );
      })}

      <section id="wow-seasonal" className="promotions-section menu-page-promos">
        <h2 className="section-title">WOW Deals & Seasonal Offers</h2>
        <div className="promo-cards">
          <div className="promo-card promo-limited">
            <span className="promo-label">Limited Time</span>
            <h3>2 Large Pizzas at 50% Off</h3>
            <p>Grab this deal before it&apos;s gone!</p>
          </div>
          <div className="promo-card">
            <span className="promo-label">Limited Time</span>
            <h3>Free Fries with Any Burger</h3>
            <p>Add a side of happiness to your order.</p>
          </div>
          <div className="promo-card">
            <span className="promo-label">Seasonal</span>
            <h3>Family Feast Combo</h3>
            <p>Pizza + Pasta + Drinks at one great price.</p>
          </div>
        </div>
      </section>

      <footer className="page-footer">
        <div className="footer-inner">
          <p className="brand-story-text">
            At Pizza Hut, we believe in fresh ingredients, authentic flavors, and making every meal unforgettable.
          </p>
          <span className="brand-badge">Global Favorite Since 1958</span>
        </div>
      </footer>
    </div>
  );
};

export default MenuPage;
