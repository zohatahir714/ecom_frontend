import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CategoryNav = () => {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    axios
      .get('/api/categories')
      .then((res) => {
        if (mounted) setCategories(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to load categories', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleClick = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setOpen(false);
  };

  return (
    <nav className="category-nav">
      <div className="category-nav-inner">
        <div className="category-nav-brand">Explore Menu</div>
        <button
          type="button"
          className="category-nav-toggle"
          aria-label="Toggle menu"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
        <ul className={`category-nav-list ${open ? 'open' : ''}`}>
          {categories.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className="category-nav-link"
                onClick={() => handleClick(c.id)}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default CategoryNav;

