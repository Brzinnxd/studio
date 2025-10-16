'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Sweet } from '@/lib/data';
import { useRouter } from 'next/navigation';

export interface CartItem extends Sweet {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCartAndGoToCart: (item: Sweet) => void;
  cartItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const router = useRouter();

  const addToCartAndGoToCart = (item: Sweet) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
    router.push('/cart');
  };

  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <CartContext.Provider value={{ cartItems, addToCartAndGoToCart, cartItemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
