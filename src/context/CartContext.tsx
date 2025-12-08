'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem } from '@/lib/types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(
        i => i.productId === item.productId && i.size === item.size && i.color === item.color
      );
      if (existing) {
        return prev.map(i =>
          i.productId === item.productId && i.size === item.size && i.color === item.color
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (productId: string, size: string, color: string) => {
    setItems(prev => prev.filter(
      i => !(i.productId === productId && i.size === size && i.color === color)
    ));
  };

  const updateQuantity = (productId: string, size: string, color: string, qty: number) => {
    if (qty < 1) return removeItem(productId, size, color);
    setItems(prev => prev.map(i =>
      i.productId === productId && i.size === size && i.color === color
        ? { ...i, quantity: qty }
        : i
    ));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
