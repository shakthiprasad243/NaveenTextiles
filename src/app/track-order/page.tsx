'use client';

import { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle, Phone, Mail, Hash } from 'lucide-react';

interface OrderItem {
  id: string;
  product_name: string;
  size: string;
  color: string;
  qty: number;
  unit_price: number;
  line_total: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shipping_address: { line1?: string; line2?: string; city?: string; state?: string; pincode?: string } | string;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
  order_items: OrderItem[];
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  PENDING: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/20', label: 'Order Pending' },
  CONFIRMED: { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-500/20', label: 'Order Confirmed' },
  PROCESSING: { icon: Package, color: 'text-purple-500', bg: 'bg-purple-500/20', label: 'Processing' },
  SHIPPED: { icon: Truck, color: 'text-orange-500', bg: 'bg-orange-500/20', label: 'Shipped' },
  DELIVERED: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/20', label: 'Delivered' },
  CANCELLED: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/20', label: 'Cancelled' },
};

export default function TrackOrderPage() {
  const [searchType, setSearchType] = useState<'order_number' | 'phone' | 'email'>('order_number');
  const [searchValue, setSearchValue] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const response = await fetch(`/api/orders?${searchType}=${encodeURIComponent(searchValue.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch order');
      }

      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = (address: Order['shipping_address']) => {
    if (typeof address === 'string') return address;
    const parts = [address.line1, address.line2, address.city, address.state, address.pincode].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gold-400 text-sm uppercase tracking-wider font-medium">
          Order Status
        </p>
        <h1 className="text-4xl font-serif text-white mt-2">Track Your Order</h1>
        <p className="text-gray-400 mt-3">Enter your order number, phone, or email to check your order status</p>
      </div>

      {/* Search Form */}
      <div className="glass-card-gold rounded-xl p-6 mb-8">
        <div className="flex gap-2 mb-4">
          {[
            { type: 'order_number' as const, icon: Hash, label: 'Order Number' },
            { type: 'phone' as const, icon: Phone, label: 'Phone' },
            { type: 'email' as const, icon: Mail, label: 'Email' },
          ].map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => { setSearchType(type); setSearchValue(''); setOrders([]); setSearched(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
                searchType === type
                  ? 'bg-primary text-dark-900 font-medium'
                  : 'glass-card text-dark-300 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type={searchType === 'email' ? 'email' : 'text'}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={
                searchType === 'order_number'
                  ? 'Enter order number (e.g., NT-20241209-XXXX)'
                  : searchType === 'phone'
                  ? 'Enter phone number'
                  : 'Enter email address'
              }
              className="w-full pl-12 pr-4 py-3 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50 placeholder-dark-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !searchValue.trim()}
            className="btn-glossy px-6 py-3 rounded-lg text-sm font-medium text-dark-900 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="glass-card rounded-xl p-4 mb-6 border border-red-500/30 bg-red-500/10">
          <p className="text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        </div>
      )}

      {/* No Results */}
      {searched && !loading && orders.length === 0 && !error && (
        <div className="glass-card-gold rounded-xl p-8 text-center">
          <Package className="w-12 h-12 text-dark-400 mx-auto mb-4" />
          <h3 className="text-dark-200 font-medium">No orders found</h3>
          <p className="text-dark-400 text-sm mt-2">
            We couldn&apos;t find any orders matching your search. Please check your details and try again.
          </p>
        </div>
      )}

      {/* Orders List */}
      {orders.length > 0 && (
        <div className="space-y-6">
          {orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.PENDING;
            const StatusIcon = status.icon;

            return (
              <div key={order.id} className="glass-card-gold rounded-xl overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-dark-700/50">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-dark-400 text-sm">Order Number</p>
                      <p className="text-white font-medium text-lg">{order.order_number}</p>
                      <p className="text-dark-400 text-sm mt-1">{formatDate(order.created_at)}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${status.bg}`}>
                      <StatusIcon className={`w-4 h-4 ${status.color}`} />
                      <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6 border-b border-dark-700/50">
                  <h4 className="text-dark-300 text-sm font-medium mb-4">Items</h4>
                  <div className="space-y-3">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <p className="text-dark-200">{item.product_name}</p>
                          <p className="text-dark-400 text-sm">
                            {[item.size, item.color].filter(Boolean).join(' • ')} • Qty: {item.qty}
                          </p>
                        </div>
                        <p className="text-dark-200">₹{item.line_total?.toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="p-6 grid sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-dark-300 text-sm font-medium mb-2">Shipping Address</h4>
                    <p className="text-dark-200 text-sm">{order.customer_name}</p>
                    <p className="text-dark-400 text-sm">{formatAddress(order.shipping_address)}</p>
                    <p className="text-dark-400 text-sm">{order.customer_phone}</p>
                  </div>
                  <div className="text-right">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-400">Subtotal</span>
                        <span className="text-dark-200">₹{order.subtotal?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-400">Shipping</span>
                        <span className="text-dark-200">{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
                      </div>
                      <div className="flex justify-between text-base font-medium pt-2 border-t border-dark-700/50">
                        <span className="text-dark-300">Total</span>
                        <span className="text-primary">₹{order.total?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <p className="text-dark-400 text-xs mt-2">Payment: {order.payment_method}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
