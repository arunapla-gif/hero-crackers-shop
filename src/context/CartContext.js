'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({}); // { [productId]: quantity }
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    const savedCart = localStorage.getItem('hero_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart');
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('hero_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  // cart item structure: { quantity, name, price, id }
  const updateQuantity = (product, delta) => {
    setCart(prev => {
      const productId = product.id;
      const currentItem = prev[productId] || { quantity: 0, ...product };
      const newQty = Math.max(0, currentItem.quantity + delta);
      
      const newCart = { ...prev };
      if (newQty === 0) {
        delete newCart[productId];
      } else {
        newCart[productId] = { ...currentItem, quantity: newQty };
      }
      return newCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[productId];
      return newCart;
    });
  };

  const clearCart = () => {
    setCart({});
  };

  const cartItemsCount = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        updateQuantity, 
        removeFromCart, 
        clearCart, 
        cartItemsCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
