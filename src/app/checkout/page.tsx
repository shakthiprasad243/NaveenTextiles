'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { generateOrderNumber, generateWhatsAppMessage, getWhatsAppOrderUrl } from '@/lib/supabase';
import { MessageCircle, CheckCircle, Sparkles, Loader2, MapPin, User, Phone } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [form, setForm] = useState({ 
    name: '', 
    phone: '', 
    email: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');

  if (items.length === 0 && !submitted) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-dark-400 mb-4">Your cart is empty</p>
        <Link href="/products" className="text-primary hover:text-primary-light">Continue Shopping</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare order data
      const orderData = {
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email || undefined,
        shipping_address: {
          line1: form.line1,
          line2: form.line2,
          city: form.city,
          state: form.state,
          postal_code: form.postal_code,
          country: 'India'
        },
        items: items.map(item => ({
          product_variant_id: item.productId, // This should be variant ID in real implementation
          product_name: item.name,
          size: item.size,
          color: item.color,
          qty: item.quantity,
          unit_price: item.price
        })),
        payment_method: 'COD'
      };

      // Create order via API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create order');
      }

      setOrderId(result.order.order_number);

      // Open WhatsApp with order details
      if (result.whatsapp_url) {
        window.open(result.whatsapp_url, '_blank');
      }

      clearCart();
      setSubmitted(true);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      
      // Fallback: Generate order locally and open WhatsApp
      const fallbackOrderId = generateOrderNumber();
      setOrderId(fallbackOrderId);
      
      const message = generateWhatsAppMessage(
        fallbackOrderId,
        form.name,
        form.phone,
        { line1: form.line1, line2: form.line2, city: form.city, state: form.state, postal_code: form.postal_code },
        items.map(i => ({ product_name: i.name, size: i.size, color: i.color, qty: i.quantity, unit_price: i.price })),
        total
      );
      
      const whatsappUrl = getWhatsAppOrderUrl('9876543210', message);
      window.open(whatsappUrl, '_blank');
      
      clearCart();
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="glass-card w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center gold-glow">
          <CheckCircle className="w-12 h-12 text-green-400" />
        </div>
        <h1 className="text-2xl font-serif text-white mb-2">Order Placed!</h1>
        <p className="text-dark-300 mb-2">
          Order ID: <span className="font-mono text-transparent bg-clip-text bg-gradient-to-r from-primary to-gold-400">{orderId}</span>
        </p>
        <p className="text-dark-400 mb-8">Complete your order on WhatsApp. We'll confirm shortly.</p>
        <Link href="/products" className="btn-glossy inline-block text-dark-900 px-8 py-3 rounded-lg font-medium">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const shipping = total >= 1000 ? 0 : 50;
  const grandTotal = total + shipping;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <Sparkles className="w-6 h-6 text-primary" />
        <h1 className="text-3xl font-serif text-white">Checkout</h1>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Form */}
        <div className="md:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Contact Info */}
            <div className="glass-card-gold rounded-xl p-5">
              <h2 className="font-medium text-primary mb-4 flex items-center gap-2">
                <User className="w-4 h-4" /> Contact Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 glass-card rounded-lg text-dark-100 placeholder-dark-500 focus:ring-1 focus:ring-primary/50 outline-none"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-dark-300 mb-2">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-3 glass-card rounded-lg text-dark-100 placeholder-dark-500 focus:ring-1 focus:ring-primary/50 outline-none"
                      placeholder="10-digit number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-dark-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 glass-card rounded-lg text-dark-100 placeholder-dark-500 focus:ring-1 focus:ring-primary/50 outline-none"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="glass-card-gold rounded-xl p-5">
              <h2 className="font-medium text-primary mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Delivery Address
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Address Line 1 *</label>
                  <input
                    type="text"
                    required
                    value={form.line1}
                    onChange={e => setForm({ ...form, line1: e.target.value })}
                    className="w-full px-4 py-3 glass-card rounded-lg text-dark-100 placeholder-dark-500 focus:ring-1 focus:ring-primary/50 outline-none"
                    placeholder="House/Flat No., Building Name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Address Line 2</label>
                  <input
                    type="text"
                    value={form.line2}
                    onChange={e => setForm({ ...form, line2: e.target.value })}
                    className="w-full px-4 py-3 glass-card rounded-lg text-dark-100 placeholder-dark-500 focus:ring-1 focus:ring-primary/50 outline-none"
                    placeholder="Street, Area, Landmark"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-dark-300 mb-2">City *</label>
                    <input
                      type="text"
                      required
                      value={form.city}
                      onChange={e => setForm({ ...form, city: e.target.value })}
                      className="w-full px-4 py-3 glass-card rounded-lg text-dark-100 placeholder-dark-500 focus:ring-1 focus:ring-primary/50 outline-none"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-dark-300 mb-2">State *</label>
                    <input
                      type="text"
                      required
                      value={form.state}
                      onChange={e => setForm({ ...form, state: e.target.value })}
                      className="w-full px-4 py-3 glass-card rounded-lg text-dark-100 placeholder-dark-500 focus:ring-1 focus:ring-primary/50 outline-none"
                      placeholder="State"
                    />
                  </div>
                </div>
                <div className="w-1/2">
                  <label className="block text-sm text-dark-300 mb-2">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={form.postal_code}
                    onChange={e => setForm({ ...form, postal_code: e.target.value })}
                    className="w-full px-4 py-3 glass-card rounded-lg text-dark-100 placeholder-dark-500 focus:ring-1 focus:ring-primary/50 outline-none"
                    placeholder="6-digit pincode"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-green-500 hover:to-green-400 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <MessageCircle className="w-5 h-5" />
                  Order via WhatsApp
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-2">
          <div className="glass-card-gold rounded-xl p-5 sticky top-24">
            <h2 className="font-medium text-primary mb-4">Order Summary</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {items.map(item => (
                <div key={`${item.productId}-${item.size}-${item.color}`} className="flex justify-between text-sm py-2 border-b border-dark-700/50">
                  <div>
                    <p className="text-dark-200">{item.name}</p>
                    <p className="text-dark-500 text-xs">{item.size} • {item.color} • Qty: {item.quantity}</p>
                  </div>
                  <span className="text-dark-200">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-dark-700/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-dark-400">Subtotal</span>
                <span className="text-dark-200">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-dark-400">Shipping</span>
                <span className={shipping === 0 ? 'text-green-400' : 'text-dark-200'}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-dark-500">Free shipping on orders above ₹1,000</p>
              )}
              <div className="flex justify-between font-bold pt-2 border-t border-dark-700/50">
                <span className="text-dark-200">Total</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-gold-400 text-lg">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-primary/10 rounded-lg">
              <p className="text-primary text-xs flex items-center gap-2">
                <Phone className="w-3 h-3" />
                Payment: Cash on Delivery
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
