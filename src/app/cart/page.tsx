'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { Minus, Plus, Trash2, ShoppingBag, AlertCircle } from 'lucide-react';
import GoogleDriveImage from '@/components/GoogleDriveImage';

export default function CartPage() {
  const { items, updateQuantity, removeItem, total } = useCart();
  const [stockError, setStockError] = useState<string | null>(null);

  const handleIncrement = (productId: string, size: string, color: string, currentQty: number, maxStock?: number) => {
    if (maxStock && currentQty >= maxStock) {
      setStockError(`Maximum ${maxStock} items available for this variant`);
      setTimeout(() => setStockError(null), 3000);
      return;
    }
    updateQuantity(productId, size, color, currentQty + 1);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 text-center">
        <div className="glass-card-enhanced w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto mb-6 md:mb-8 flex items-center justify-center animate-float">
          <ShoppingBag className="w-12 h-12 md:w-16 md:h-16 text-dark-400" />
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-white mb-3">Your cart is empty</h1>
        <p className="text-dark-400 mb-8 md:mb-10 text-base md:text-lg">Discover amazing products and start shopping</p>
        <Link href="/products" className="btn-glossy inline-flex items-center gap-2 text-dark-900 px-6 md:px-10 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:scale-105 transition-transform min-h-[48px]">
          <ShoppingBag className="w-5 h-5" />
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Enhanced Header - Better mobile sizing */}
      <div className="mb-6 md:mb-10">
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gold-400 text-xs md:text-sm uppercase tracking-wider font-bold">
          Your Cart
        </p>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-white mt-2">
          {items.length} {items.length === 1 ? 'Item' : 'Items'}
        </h1>
      </div>

      <div className="space-y-3 md:space-y-4 lg:space-y-5 mb-6 md:mb-8">
        {items.map((item, index) => (
          <div 
            key={`${item.productId}-${item.size}-${item.color}`} 
            className="glass-card-enhanced rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 hover:gold-glow transition-all animate-fadeIn"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex gap-3 md:gap-4 lg:gap-6">
              {/* Product Image */}
              <div className="relative w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 flex-shrink-0 bg-dark-500 rounded-lg md:rounded-xl overflow-hidden group">
                <GoogleDriveImage src={item.image} alt={item.name} fill sizes="112px" className="object-cover group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />
              </div>
              
              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-dark-100 text-base md:text-lg mb-2 line-clamp-2">{item.name}</h3>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2 md:mb-3">
                  <span className="text-xs md:text-sm text-dark-400 px-2 md:px-3 py-1 glass-card rounded-lg">
                    Size: <span className="text-dark-200 font-medium">{item.size}</span>
                  </span>
                  <span className="text-xs md:text-sm text-dark-400 px-2 md:px-3 py-1 glass-card rounded-lg">
                    Color: <span className="text-dark-200 font-medium">{item.color}</span>
                  </span>
                </div>
                <p className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-primary">{formatPrice(item.price)}</p>
              </div>
              
              {/* Actions */}
              <div className="flex flex-col items-end justify-between gap-4">
                <button 
                  onClick={() => removeItem(item.productId, item.size, item.color)} 
                  className="text-dark-400 hover:text-red-500 transition-all p-2 hover:bg-red-500/10 rounded-lg group"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                
                {/* Quantity Controls */}
                <div className="flex items-center gap-3 glass-card px-3 py-2 rounded-xl">
                  <button 
                    onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)} 
                    className="p-1.5 hover:bg-primary/10 rounded-lg transition-all hover:scale-110"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4 text-dark-300 hover:text-primary transition" />
                  </button>
                  <span className="w-10 text-center text-base text-dark-100 font-bold">{item.quantity}</span>
                  <button 
                    onClick={() => handleIncrement(item.productId, item.size, item.color, item.quantity, item.maxStock)} 
                    className={`p-1.5 hover:bg-primary/10 rounded-lg transition-all hover:scale-110 ${item.maxStock && item.quantity >= item.maxStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={item.maxStock ? item.quantity >= item.maxStock : false}
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4 text-dark-300 hover:text-primary transition" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stock Error Message */}
      {stockError && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {stockError}
        </div>
      )}

      {/* Enhanced Summary */}
      <div className="glass-card-enhanced p-8 rounded-2xl mb-6 gold-glow-strong">
        <div className="space-y-4">
          <div className="flex justify-between text-dark-400">
            <span>Subtotal</span>
            <span className="text-dark-200 font-medium">{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between text-dark-400">
            <span>Shipping</span>
            <span className="text-green-500 font-medium">FREE</span>
          </div>
          <div className="divider-gold my-4" />
          <div className="flex justify-between text-2xl font-bold">
            <span className="text-white">Total</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-primary to-gold-400">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <Link href="/checkout" className="btn-glossy block w-full text-dark-900 text-center py-4 md:py-5 rounded-xl md:rounded-2xl font-bold text-base md:text-lg hover:scale-105 transition-transform shadow-2xl min-h-[52px] md:min-h-[60px] flex items-center justify-center">
        Proceed to Checkout →
      </Link>
    </div>
  );
}
