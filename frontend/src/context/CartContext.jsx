import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('staynest_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('staynest_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (listing) => {
    setCartItems((prev) => {
      const exists = prev.some((item) => item._id === listing._id);
      if (exists) return prev;
      return [...prev, listing];
    });
  };

  const removeFromCart = (listingId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== listingId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
