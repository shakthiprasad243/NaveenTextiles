'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeItem, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="glass-card w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center">
          <ShoppingBag className="w-12 h-12 text-dark-400" />
        </div>
        <h1 className="text-2xl font-serif text-dark-100 mb-2">Your cart is empty</h1>
        <p className="text-dark-400 mb-8">Add some products to get started</p>
        <Link href="/products" className="btn-glossy inline-block text-dark-900 px-8 py-3 rounded-lg font-medium">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif text-dark-100 mb-8">Shopping Cart</h1>

      <div className="space-y-4 mb-8">
        {items.map(item => (
          <div key={`${item.productId}-${item.size}-${item.color}`} className="glossy-card flex gap-4 p-4 rounded-xl shine-effect">
            <div className="relative w-24 h-24 flex-shrink-0 bg-dark-500 rounded-lg overflow-hidden">
              <Image src={item.image} alt={item.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900/50 to-transparent" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-dark-100 truncate">{item.name}</h3>
              <p className="text-sm text-dark-400 mt-1">{item.size} / {item.color}</p>
              <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-primary mt-2">{formatPrice(item.price)}</p>
            </div>
            <div className="flex flex-col items-end justify-between">
              <button onClick={() => removeItem(item.productId, item.size, item.color)} className="text-dark-400 hover:text-red-500 transition p-1">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)} className="p-1.5 glass-card rounded hover:bg-white/10 transition">
                  <Minus className="w-3 h-3 text-dark-300" />
                </button>
                <span className="w-8 text-center text-sm text-dark-200 font-medium">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)} className="p-1.5 glass-card rounded hover:bg-white/10 transition">
                  <Plus className="w-3 h-3 text-dark-300" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="glass-card p-6 rounded-xl mb-6 gold-glow">
        <div className="flex justify-between text-xl font-bold">
          <span className="text-dark-200">Total</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-primary to-gold-400">{formatPrice(total)}</span>
        </div>
      </div>

      <Link href="/checkout" className="btn-glossy block w-full text-dark-900 text-center py-4 rounded-xl font-semibold">
        Proceed to Checkout
      </Link>
    </div>
  );
}
