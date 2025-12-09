'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Package, ChevronLeft, Clock, MapPin, Phone, Truck, Trash2, AlertTriangle, Loader2, Search } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  product_name: string;
  size: string;
  color: string;
  qty: number;
  unit_price: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
  } | null;
  total: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

const statusSteps = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'];

export default function OrdersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Search for order by order number
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      setSearching(true);
      const response = await fetch(`/api/orders?order_number=${encodeURIComponent(searchQuery.trim())}`);
      const data = await response.json();
      if (data.order) {
        // Add to orders if not already present
        setOrders(prev => {
          const exists = prev.some(o => o.id === data.order.id);
          if (exists) return prev;
          return [data.order, ...prev];
        });
        setSearchQuery('');
      } else {
        alert('Order not found. Please check the order number.');
      }
    } catch (err) {
      console.error('Error searching order:', err);
      alert('Failed to search order');
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      
      try {
        setLoading(true);
        let allOrders: Order[] = [];
        const existingIds = new Set<string>();
        
        // Try fetching by email first (most reliable identifier)
        if (user.email) {
          try {
            const emailResponse = await fetch(`/api/orders?email=${encodeURIComponent(user.email)}`);
            const emailData = await emailResponse.json();
            if (emailData.orders && emailData.orders.length > 0) {
              emailData.orders.forEach((order: Order) => {
                if (!existingIds.has(order.id)) {
                  existingIds.add(order.id);
                  allOrders.push(order);
                }
              });
            }
          } catch (e) {
            console.error('Error fetching by email:', e);
          }
        }
        
        // Also try fetching by phone number if available
        if (user.phone) {
          try {
            // Normalize phone number - remove non-digits and get last 10 digits
            const normalizedPhone = user.phone.replace(/\D/g, '').slice(-10);
            const phoneResponse = await fetch(`/api/orders?phone=${encodeURIComponent(normalizedPhone)}`);
            const phoneData = await phoneResponse.json();
            if (phoneData.orders && phoneData.orders.length > 0) {
              phoneData.orders.forEach((order: Order) => {
                if (!existingIds.has(order.id)) {
                  existingIds.add(order.id);
                  allOrders.push(order);
                }
              });
            }
          } catch (e) {
            console.error('Error fetching by phone:', e);
          }
        }
        
        // Sort by created_at descending
        allOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setOrders(allOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrders();
  }, [user]);

  async function handleDeleteOrder(orderId: string) {
    try {
      setDeleting(true);
      const response = await fetch('/api/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId })
      });
      
      if (response.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        setDeleteConfirm(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete order');
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Failed to delete order');
    } finally {
      setDeleting(false);
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED': return 'bg-green-500/20 text-green-400';
      case 'SHIPPED': return 'bg-blue-500/20 text-blue-400';
      case 'CANCELLED': return 'bg-red-500/20 text-red-400';
      case 'PACKED': return 'bg-purple-500/20 text-purple-400';
      case 'CONFIRMED': return 'bg-cyan-500/20 text-cyan-400';
      default: return 'bg-primary/20 text-primary';
    }
  };

  const getStatusIndex = (status: string) => statusSteps.indexOf(status.toUpperCase());

  const formatAddress = (address: Order['shipping_address']) => {
    if (!address) return 'Not provided';
    const parts = [address.line1, address.line2, address.city, address.state, address.postal_code].filter(Boolean);
    return parts.join(', ') || 'Not provided';
  };

  const canDelete = (status: string) => {
    const s = status.toUpperCase();
    return s === 'PENDING' || s === 'CANCELLED' || s === 'DELIVERED';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/account" className="inline-flex items-center gap-2 text-dark-400 hover:text-primary text-sm mb-4 transition">
          <ChevronLeft className="w-4 h-4" /> Back to Account
        </Link>
        <h1 className="text-3xl font-serif text-white">My Orders</h1>
        <p className="text-dark-400 mt-1">Track and manage your orders</p>
        
        {/* Search by Order Number */}
        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order number (e.g., NT-ABC123)"
              className="w-full pl-10 pr-4 py-2.5 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <button
            type="submit"
            disabled={searching || !searchQuery.trim()}
            className="px-4 py-2.5 btn-glossy rounded-lg text-sm font-medium text-dark-900 disabled:opacity-50 flex items-center gap-2"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Find
          </button>
        </form>
      </div>

      {/* Debug info - shows what identifiers are being used */}
      {user && orders.length === 0 && !loading && (
        <div className="mb-4 p-3 glass-card rounded-lg text-xs text-dark-500">
          <p>Looking for orders with:</p>
          <p>• Email: {user.email || 'Not set'}</p>
          <p>• Phone: {user.phone || 'Not set'}</p>
          <p className="mt-2 text-dark-400">Tip: Use the search box above to find orders by order number (e.g., NT-ABC123)</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="glass-card-gold rounded-xl overflow-hidden">
              {/* Order Header */}
              <div className="p-4 border-b border-dark-700/50 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-dark-200 font-medium">{order.order_number || order.id.slice(0, 8)}</p>
                  <p className="text-dark-500 text-xs flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    Ordered on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()}
                  </span>
                  {canDelete(order.status) && (
                    <button
                      onClick={() => setDeleteConfirm(order.id)}
                      className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      title="Delete Order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Order Progress */}
              {order.status.toUpperCase() !== 'CANCELLED' && (
                <div className="p-4 border-b border-dark-700/50">
                  <div className="flex items-center justify-between relative">
                    {statusSteps.map((step, idx) => {
                      const isCompleted = getStatusIndex(order.status) >= idx;
                      const isCurrent = order.status.toUpperCase() === step;
                      return (
                        <div key={step} className="flex flex-col items-center relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            isCompleted ? 'bg-primary text-dark-900' : 'glass-card text-dark-500'
                          } ${isCurrent ? 'ring-2 ring-primary/50' : ''}`}>
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          <span className={`text-xs mt-2 capitalize ${isCompleted ? 'text-primary' : 'text-dark-500'}`}>
                            {step.toLowerCase()}
                          </span>
                        </div>
                      );
                    })}
                    {/* Progress Line */}
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-dark-700 -z-0">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(getStatusIndex(order.status) / (statusSteps.length - 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="p-4">
                <div className="space-y-3">
                  {order.order_items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-dark-700 flex items-center justify-center">
                        <Package className="w-6 h-6 text-dark-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-dark-200 text-sm font-medium">{item.product_name}</p>
                        <p className="text-dark-500 text-xs">Size: {item.size} • Color: {item.color} • Qty: {item.qty}</p>
                      </div>
                      <p className="text-primary font-medium">₹{(item.unit_price * item.qty).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="mt-4 pt-4 border-t border-dark-700/50 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-start gap-4 text-dark-400 text-xs">
                    <div className="flex items-start gap-1">
                      <MapPin className="w-3 h-3 mt-0.5" />
                      <span>{formatAddress(order.shipping_address)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>{order.customer_phone}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-dark-500 text-xs">Total Amount</p>
                    <p className="text-primary font-bold text-lg">₹{order.total.toLocaleString()}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-3">
                  {order.status.toUpperCase() === 'DELIVERED' && (
                    <button className="flex-1 py-2 rounded-lg text-sm text-dark-300 border border-dark-600 hover:border-primary hover:text-primary transition">
                      Write a Review
                    </button>
                  )}
                  {order.status.toUpperCase() !== 'CANCELLED' && order.status.toUpperCase() !== 'DELIVERED' && (
                    <a
                      href={`https://wa.me/919876543210?text=Hi, I need help with order ${order.order_number || order.id}`}
                      target="_blank"
                      className="flex-1 py-2 rounded-lg text-sm text-dark-300 border border-dark-600 hover:border-primary hover:text-primary transition text-center flex items-center justify-center gap-2"
                    >
                      <Truck className="w-4 h-4" /> Track Order
                    </a>
                  )}
                  <Link
                    href="/contact"
                    className="flex-1 py-2 rounded-lg text-sm text-dark-300 border border-dark-600 hover:border-primary hover:text-primary transition text-center"
                  >
                    Need Help?
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-card-gold rounded-xl">
          <Package className="w-16 h-16 text-dark-500 mx-auto mb-4" />
          <h3 className="text-dark-200 font-medium text-lg mb-2">No orders yet</h3>
          <p className="text-dark-500 text-sm mb-6">Start shopping to see your orders here</p>
          <Link href="/products" className="btn-glossy px-6 py-3 rounded-lg text-sm font-medium text-dark-900 inline-block">
            Browse Products
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="glass-card-gold rounded-xl p-6 max-w-sm w-full animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-dark-200 font-medium text-lg">Delete Order?</h3>
            </div>
            <p className="text-dark-300 text-sm mb-6">
              This action cannot be undone. The order will be permanently removed from your history.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirm(null)} 
                className="flex-1 py-2.5 rounded-lg text-sm text-dark-300 border border-dark-600 hover:border-dark-500"
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteOrder(deleteConfirm)} 
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
