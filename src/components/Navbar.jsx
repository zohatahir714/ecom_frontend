import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../context/CartContext';

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

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = location.pathname === '/';
  const isMenuPage = location.pathname === '/menu';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const activeHash = location.hash.slice(1) || (isMenuPage ? 'pizzas' : '');

  const handleCategoryClick = (id) => {
    setMenuOpen(false);
    if (isMenuPage) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      navigate(`/menu#${id}`, { replace: true });
    } else {
      navigate(`/menu#${id}`);
    }
  };

  const renderCategories = () => (
    <nav className="navbar-categories">
      {CATEGORIES.map((c) => (
        <button
          key={c.id}
          type="button"
          className={`navbar-cat-link ${activeHash === c.id ? 'navbar-cat-link-active' : ''}`}
          onClick={() => handleCategoryClick(c.id)}
        >
          {c.name}
        </button>
      ))}
    </nav>
  );

  return (
    <header className="main-navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          Pizza Hut
        </Link>

        {renderCategories()}

        {!isAuthPage && (
          <div className="navbar-right">
            {user ? (
              <>
                {user.role !== 'admin' && (
                  <Link to="/dashboard" className="navbar-link">
                    My Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="navbar-link">
                    Admin Panel
                  </Link>
                )}
                {user.role !== 'admin' && cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
                <button className="btn-nav-logout" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar-link">Login</Link>
                <Link to="/signup" className="btn-nav-signup">Sign Up</Link>
              </>
            )}
          </div>
        )}

        <button
          className="navbar-toggle"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {menuOpen && (
        <div className="navbar-mobile-menu">
          <div className="mobile-categories">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`mobile-cat-link ${activeHash === c.id ? 'navbar-cat-link-active' : ''}`}
                onClick={() => handleCategoryClick(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
          {!isAuthPage && (
            user ? (
              <div className="mobile-links">
                {user.role !== 'admin' && (
                  <Link to="/dashboard" className="mobile-link" onClick={() => setMenuOpen(false)}>
                    My Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="mobile-link" onClick={() => setMenuOpen(false)}>
                    Admin Panel
                  </Link>
                )}
                <button className="mobile-link" onClick={() => { logout(); setMenuOpen(false); }}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="mobile-links">
                <Link to="/login" className="mobile-link" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/signup" className="mobile-link" onClick={() => setMenuOpen(false)}>
                  Sign Up
                </Link>
              </div>
            )
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
