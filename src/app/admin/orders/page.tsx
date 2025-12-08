'use client';

import { useState, useEffect } from 'react';
import { supabase, DbOrderItem } from '@/lib/supabase';
import { Search, ChevronDown, Eye, Package, Phone, MapPin, Clock, X, Truck, Loader2 } from 'lucide-react';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
  } | null;
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  created_at: string;
  order_items: DbOrderItem[];
}

const statusOptions: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  CONFIRMED: 'bg-cyan-500/20 text-cyan-400',
  PACKED: 'bg-purple-500/20 text-purple-400',
  SHIPPED: 'bg-blue-500/20 text-blue-400',
  DELIVERED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400'
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`*, order_items (*)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order.order_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery);
    const matchesStatus = !filterStatus || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
    }
  };

  const getStatusStats = () => {
    return statusOptions.reduce((acc, status) => {
      acc[status] = orders.filter(o => o.status === status).length;
      return acc;
    }, {} as Record<string, number>);
  };

  const stats = getStatusStats();

  const formatAddress = (address: Order['shipping_address']) => {
    if (!address) return 'Not provided';
    const parts = [address.line1, address.line2, address.city, address.state, address.postal_code].filter(Boolean);
    return parts.join(', ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-serif text-white">Orders</h1>
        <p className="text-primary/70 text-sm">{orders.length} total orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
        {statusOptions.map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(filterStatus === status ? '' : status)}
            className={`glass-card rounded-xl p-3 text-center transition ${filterStatus === status ? 'ring-1 ring-primary' : ''}`}
          >
            <p className="text-xl font-bold text-dark-200">{stats[status]}</p>
            <p className={`text-xs capitalize ${statusColors[status].split(' ')[1]}`}>{status.toLowerCase()}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card-gold rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              placeholder="Search by Order ID, Name, or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer min-w-[150px]"
            >
              <option value="">All Status</option>
              {statusOptions.map(status => (
                <option key={status} value={status} className="capitalize">{status.toLowerCase()}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card-gold rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary/20 bg-dark-800/50">
                <th className="text-left py-4 px-4 text-dark-400 font-medium">Order ID</th>
                <th className="text-left py-4 px-4 text-dark-400 font-medium">Customer</th>
                <th className="text-left py-4 px-4 text-dark-400 font-medium hidden md:table-cell">Items</th>
                <th className="text-left py-4 px-4 text-dark-400 font-medium">Total</th>
                <th className="text-left py-4 px-4 text-dark-400 font-medium">Status</th>
                <th className="text-right py-4 px-4 text-dark-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition">
                  <td className="py-4 px-4">
                    <p className="text-dark-200 font-mono font-medium">{order.order_number || order.id.slice(0, 8)}</p>
                    <p className="text-dark-300 text-xs flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-white">{order.customer_name}</p>
                    <p className="text-dark-300 text-xs">{order.customer_phone}</p>
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell">
                    <p className="text-dark-300">{order.order_items?.length || 0} item(s)</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-primary font-medium">₹{(order.total || 0).toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer outline-none ${statusColors[order.status]}`}
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status} className="bg-dark-800 text-dark-200">{status.toLowerCase()}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-dark-400 hover:text-primary hover:bg-primary/10 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <a
                        href={`https://wa.me/91${order.customer_phone.replace(/\D/g, '')}?text=Hi ${order.customer_name}, regarding your order ${order.order_number}...`}
                        target="_blank"
                        className="p-2 text-dark-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition"
                        title="WhatsApp"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-dark-500 mx-auto mb-3" />
            <p className="text-primary/70">No orders found</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="glass-card-gold rounded-xl w-full max-w-2xl my-8 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-primary/20">
              <div>
                <h3 className="text-primary font-medium text-lg">{selectedOrder.order_number || selectedOrder.id.slice(0, 8)}</h3>
                <p className="text-primary/60 text-xs">
                  {new Date(selectedOrder.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-dark-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              {/* Customer Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="glass-card rounded-lg p-4">
                  <p className="text-primary/70 text-xs uppercase tracking-wider mb-2">Customer</p>
                  <p className="text-dark-200 font-medium">{selectedOrder.customer_name}</p>
                  <p className="text-dark-400 text-sm flex items-center gap-2 mt-1">
                    <Phone className="w-3 h-3" /> {selectedOrder.customer_phone}
                  </p>
                  {selectedOrder.customer_email && (
                    <p className="text-dark-400 text-sm mt-1">{selectedOrder.customer_email}</p>
                  )}
                </div>
                <div className="glass-card rounded-lg p-4">
                  <p className="text-primary/70 text-xs uppercase tracking-wider mb-2">Delivery Address</p>
                  <p className="text-dark-300 text-sm flex items-start gap-2">
                    <MapPin className="w-3 h-3 mt-1 flex-shrink-0" /> {formatAddress(selectedOrder.shipping_address)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <p className="text-primary/70 text-xs uppercase tracking-wider mb-3">Order Items</p>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between glass-card rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-dark-700 flex items-center justify-center">
                          <Package className="w-5 h-5 text-dark-500" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{item.product_name}</p>
                          <p className="text-dark-300 text-xs">Size: {item.size} • Color: {item.color} • Qty: {item.qty}</p>
                        </div>
                      </div>
                      <p className="text-primary font-medium">₹{((item.unit_price || 0) * (item.qty || 1)).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="glass-card rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-dark-400">Subtotal</span>
                  <span className="text-dark-200">₹{(selectedOrder.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-dark-400">Shipping</span>
                  <span className={selectedOrder.shipping === 0 ? 'text-green-400' : 'text-dark-200'}>
                    {selectedOrder.shipping === 0 ? 'FREE' : `₹${selectedOrder.shipping}`}
                  </span>
                </div>
                <div className="h-px bg-dark-600 my-3" />
                <div className="flex justify-between items-center">
                  <span className="text-dark-200 font-medium">Total</span>
                  <span className="text-primary font-bold text-lg">₹{(selectedOrder.total || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Status Update */}
              <div className="glass-card rounded-lg p-4">
                <p className="text-primary/70 text-xs uppercase tracking-wider mb-3">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map(status => (
                    <button
                      key={status}
                      onClick={() => updateOrderStatus(selectedOrder.id, status)}
                      className={`px-4 py-2 rounded-lg text-xs font-medium capitalize transition ${selectedOrder.status === status
                          ? statusColors[status]
                          : 'glass-card text-dark-400 hover:text-dark-200'
                        }`}
                    >
                      {status.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tracking Number */}
              {(selectedOrder.status === 'SHIPPED' || selectedOrder.status === 'DELIVERED') && (
                <div className="glass-card rounded-lg p-4">
                  <p className="text-primary/70 text-xs uppercase tracking-wider mb-3">Tracking Information</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number"
                      className="flex-1 px-4 py-2.5 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50"
                    />
                    <button className="btn-glossy px-4 py-2.5 rounded-lg text-sm font-medium text-dark-900 flex items-center gap-2">
                      <Truck className="w-4 h-4" /> Save
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-5 border-t border-primary/20">
              <a
                href={`https://wa.me/91${selectedOrder.customer_phone.replace(/\D/g, '')}?text=Hi ${selectedOrder.customer_name}, your order ${selectedOrder.order_number} status: ${selectedOrder.status}`}
                target="_blank"
                className="flex-1 py-3 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" /> Contact on WhatsApp
              </a>
              <button onClick={() => setSelectedOrder(null)} className="flex-1 py-3 rounded-lg text-sm text-dark-300 border border-dark-600 hover:border-dark-500">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
