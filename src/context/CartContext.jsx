import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

const STORAGE_KEY = 'pizza_hut_cart';

export const CartProvider = ({ children }) => {
  const [cart, setCartState] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCartState(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      setCartState([]);
    }
  }, []);

  const persistCart = (items) => {
    setCartState(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  };

  const addToCart = (product, quantity = 1) => {
    setCartState((prev) => {
      const existing = prev.find((item) => item.product?._id === product?._id);
      let next;
      if (existing) {
        next = prev.map((item) =>
          item.product?._id === product?._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        next = [...prev, { product, quantity }];
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const updateQuantity = (productId, delta) => {
    setCartState((prev) => {
      const next = prev
        .map((item) => {
          if (item.product?._id !== productId) return item;
          const q = item.quantity + delta;
          return q <= 0 ? null : { ...item, quantity: q };
        })
        .filter(Boolean);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const removeFromCart = (productId) => {
    setCartState((prev) => {
      const next = prev.filter((item) => item.product?._id !== productId);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const clearCart = () => {
    setCartState([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const cartTotal = cart.reduce((sum, c) => sum + (c.product?.price ?? 0) * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        persistCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
