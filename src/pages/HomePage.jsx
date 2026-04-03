import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

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

const FLAVOR_BY_CATEGORY = {
  pizzas: 'Smoky • Cheesy • Bold',
  burgers: 'Savory • Juicy • Bold',
  'fries-sides': 'Crispy • Golden • Irresistible',
  'sandwiches-platters': 'Hearty • Flavorful • Fresh',
  pastas: 'Creamy • Authentic • Comforting',
  drinks: 'Refreshing • Cold • Classic',
  addons: 'Extra • Delicious • Tasty',
  deals: 'Value • Savvy • Amazing',
};

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x300/1f2937/9ca3af?text=Pizza';

const HomePage = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/products').then((res) => setProducts(res.data)).catch(console.error);
  }, []);

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

  const pizzas = productsByCategory.pizzas || [];
  const wowDeals = productsByCategory.deals || [];
  const favorites = useMemo(() => {
    const all = [];
    for (const id of ['pizzas', 'burgers', 'pastas', 'drinks']) {
      (productsByCategory[id] || []).slice(0, 2).forEach((p) => all.push(p));
    }
    return all.slice(0, 8);
  }, [productsByCategory]);

  const getFlavorTag = (product) => {
    const cat = product?.category || 'Pizzas';
    const id = CATEGORY_MAP[cat] || 'pizzas';
    return FLAVOR_BY_CATEGORY[id] || 'Cheesy • Bold • Fresh';
  };

  const scrollRef = useRef(null);
  const scrollStep = 240;
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollStep, behavior: 'smooth' });
    }
  };
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollStep, behavior: 'smooth' });
    }
  };

  return (
    <div className="homepage">
      <section className="hero-banner hero-banner-home">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-tagline">Serving cheesy happiness to your table</h1>
          <Link to="/menu" className="hero-cta hero-cta-link">
            Order Now
          </Link>
        </div>
      </section>

      <section className="explore-menu-section">
        <div className="explore-menu-header">
          <h2 className="explore-menu-title">Explore Menu</h2>
          <Link to="/menu" className="explore-menu-view-all">View All Menu →</Link>
        </div>
        <div className="explore-menu-scroll-wrap">
          <button
            type="button"
            className="explore-menu-arrow explore-menu-arrow-left"
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            className="explore-menu-arrow explore-menu-arrow-right"
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <div className="explore-menu-scroll" ref={scrollRef}>
          {pizzas.map((p) => (
            <div key={p._id} className="explore-menu-card">
              <div className="explore-menu-card-image-wrap">
                <img
                  src={p.image || p.imageUrl || PLACEHOLDER_IMAGE}
                  alt={p.name}
                  loading="lazy"
                  onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                />
              </div>
              <h4 className="explore-menu-card-title">{p.name}</h4>
              {user && (
                <button
                  type="button"
                  className="explore-menu-add-btn"
                  onClick={() => addToCart(p)}
                >
                  Add to Cart
                </button>
              )}
            </div>
          ))}
          <Link to="/menu" className="explore-menu-view-all-end">View All Menu →</Link>
          </div>
        </div>
      </section>

      {wowDeals.length > 0 && (
        <section className="wow-deals-section">
          <h2 className="section-title">WOW Deals</h2>
          <div className="wow-deals-cards">
            {wowDeals.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                onAddToCart={user ? addToCart : null}
              />
            ))}
          </div>
        </section>
      )}

      <section className="promotions-section">
        <h2 className="section-title">Current Deals & Seasonal Offers</h2>
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

      {favorites.length > 0 && (
        <section className="customer-favorites-section">
          <h2 className="section-title">Customer Favorites</h2>
          <div className="customer-favorites-grid">
            {favorites.map((p) => {
              const imageUrl = p.image || p.imageUrl || PLACEHOLDER_IMAGE;
              return (
                <div key={p._id} className="favorite-card">
                  <div className="favorite-card-image-wrap">
                    <img
                      src={imageUrl}
                      alt={p.name}
                      loading="lazy"
                      onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                    />
                  </div>
                  <div className="favorite-card-body">
                    <h4 className="favorite-card-title">{p.name}</h4>
                    <p className="favorite-card-flavor">{getFlavorTag(p)}</p>
                    {p.description && (
                      <p className="favorite-card-desc">{p.description}</p>
                    )}
                    <p className="price">${(p.price ?? 0).toFixed(2)}</p>
                    {user && (
                      <button
                        type="button"
                        className="btn-primary product-card-btn"
                        onClick={() => addToCart(p)}
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

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

export default HomePage;
