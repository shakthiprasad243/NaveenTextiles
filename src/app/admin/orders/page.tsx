'use client';

// Force dynamic rendering to avoid Clerk prerendering issues
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { DbOrderItem } from '@/lib/supabase';
import { Search, ChevronDown, Eye, Package, Phone, MapPin, Clock, X, Truck, Loader2, Trash2, AlertTriangle, CheckSquare, Square, FileText, Printer } from 'lucide-react';
import Invoice from '@/components/Invoice';

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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<'single' | 'bulk' | null>(null);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [bulkInvoice, setBulkInvoice] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      // Use admin API to bypass RLS
      const response = await fetch('/api/admin/orders');
      const data = await response.json();
      
      console.log('Admin orders API response:', { ok: response.ok, ordersCount: data.orders?.length, error: data.error });
      
      if (!response.ok) throw new Error(data.error);
      setOrders(data.orders || []);
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
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update');
      }

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
    }
  };

  const handleDeleteSingle = async (orderId: string) => {
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
        setDeleteOrderId(null);
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
        }
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
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      setDeleting(true);
      const response = await fetch('/api/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_ids: selectedIds })
      });
      
      if (response.ok) {
        setOrders(prev => prev.filter(o => !selectedIds.includes(o.id)));
        setSelectedIds([]);
        setDeleteConfirm(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete orders');
      }
    } catch (err) {
      console.error('Error deleting orders:', err);
      alert('Failed to delete orders');
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelectOrder = (orderId: string) => {
    setSelectedIds(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map(o => o.id));
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

  const handlePrintInvoice = () => {
    if (!invoiceRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print invoices');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${invoiceOrder?.order_number || 'Bulk'}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body { 
              font-family: Arial, sans-serif;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            @page {
              size: A4;
              margin: 15mm 10mm 15mm 10mm;
            }
            
            @media print {
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              
              .page-break {
                page-break-after: always;
                break-after: page;
              }
              
              .invoice-container {
                page-break-inside: avoid;
              }
              
              table {
                page-break-inside: auto;
              }
              
              tr {
                page-break-inside: avoid;
                page-break-after: auto;
              }
              
              thead {
                display: table-header-group;
              }
              
              tfoot {
                display: table-footer-group;
              }
            }
            
            @media screen {
              body {
                padding: 20px;
                background: #f5f5f5;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            ${invoiceRef.current.innerHTML}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const getSelectedOrders = () => orders.filter(o => selectedIds.includes(o.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gold-400 text-sm uppercase tracking-wider font-bold">Order Management</p>
          <h1 className="text-3xl md:text-4xl font-serif text-white mt-2">Orders</h1>
          <p className="text-dark-400 text-sm mt-1">{orders.length} total • {filteredOrders.length} showing</p>
        </div>
        {selectedIds.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => setBulkInvoice(true)}
              className="px-4 py-2.5 rounded-lg text-sm font-medium bg-primary/20 text-primary hover:bg-primary/30 flex items-center gap-2 transition"
            >
              <FileText className="w-4 h-4" /> Print Invoices ({selectedIds.length})
            </button>
            <button
              onClick={() => setDeleteConfirm('bulk')}
              className="px-4 py-2.5 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center gap-2 transition"
            >
              <Trash2 className="w-4 h-4" /> Delete ({selectedIds.length})
            </button>
          </div>
        )}
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
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
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card-gold rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary/20 bg-dark-800/50">
                <th className="py-4 px-4 text-left">
                  <button onClick={toggleSelectAll} className="text-dark-400 hover:text-primary transition">
                    {selectedIds.length === filteredOrders.length && filteredOrders.length > 0 ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
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
                <tr key={order.id} className={`border-b border-dark-700/50 hover:bg-dark-700/30 transition ${selectedIds.includes(order.id) ? 'bg-primary/5' : ''}`}>
                  <td className="py-4 px-4">
                    <button onClick={() => toggleSelectOrder(order.id)} className="text-dark-400 hover:text-primary transition">
                      {selectedIds.includes(order.id) ? (
                        <CheckSquare className="w-5 h-5 text-primary" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </td>
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
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-dark-400 hover:text-primary hover:bg-primary/10 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setInvoiceOrder(order)}
                        className="p-2 text-dark-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                        title="Invoice"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <a
                        href={`https://wa.me/91${order.customer_phone.replace(/\D/g, '')}?text=Hi ${order.customer_name}, regarding your order ${order.order_number}...`}
                        target="_blank"
                        className="p-2 text-dark-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition"
                        title="WhatsApp"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => { setDeleteOrderId(order.id); setDeleteConfirm('single'); }}
                        className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-dark-300 mx-auto mb-3" />
            <p className="text-primary/70">No orders found</p>
          </div>
        )}
      </div>


      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="glass-card-gold rounded-xl p-6 max-w-sm w-full animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-dark-200 font-medium text-lg">
                {deleteConfirm === 'bulk' ? `Delete ${selectedIds.length} Orders?` : 'Delete Order?'}
              </h3>
            </div>
            <p className="text-dark-300 text-sm mb-6">
              This action cannot be undone. {deleteConfirm === 'bulk' ? 'All selected orders' : 'This order'} will be permanently removed and inventory will be restored.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => { setDeleteConfirm(null); setDeleteOrderId(null); }} 
                className="flex-1 py-2.5 rounded-lg text-sm text-dark-300 border border-dark-600 hover:border-dark-500"
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                onClick={() => deleteConfirm === 'bulk' ? handleBulkDelete() : deleteOrderId && handleDeleteSingle(deleteOrderId)}
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
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setDeleteOrderId(selectedOrder.id); setDeleteConfirm('single'); }}
                  className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  title="Delete Order"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button onClick={() => setSelectedOrder(null)} className="p-2 text-dark-400 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
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
                          <Package className="w-5 h-5 text-dark-300" />
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
              <button
                onClick={() => { setInvoiceOrder(selectedOrder); setSelectedOrder(null); }}
                className="flex-1 py-3 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" /> Generate Invoice
              </button>
              <a
                href={`https://wa.me/91${selectedOrder.customer_phone.replace(/\D/g, '')}?text=Hi ${selectedOrder.customer_name}, your order ${selectedOrder.order_number} status: ${selectedOrder.status}`}
                target="_blank"
                className="flex-1 py-3 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal - Single */}
      {invoiceOrder && !bulkInvoice && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="glass-card-gold rounded-xl w-full max-w-[850px] my-8 animate-fadeIn overflow-hidden">
            {/* Invoice Header */}
            <div className="flex items-center justify-between p-4 border-b border-primary/20">
              <h3 className="text-primary font-medium">Invoice Preview</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintInvoice}
                  className="btn-glossy px-4 py-2 rounded-lg text-sm font-medium text-dark-900 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button 
                  onClick={() => setInvoiceOrder(null)} 
                  className="p-2 text-dark-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Invoice Content */}
            <div ref={invoiceRef} className="max-h-[70vh] overflow-y-auto">
              <Invoice order={invoiceOrder} />
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal - Bulk */}
      {bulkInvoice && selectedIds.length > 0 && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="glass-card-gold rounded-xl w-full max-w-[850px] my-8 animate-fadeIn overflow-hidden">
            {/* Invoice Header */}
            <div className="flex items-center justify-between p-4 border-b border-primary/20">
              <h3 className="text-primary font-medium">Bulk Invoice Preview ({selectedIds.length} orders)</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintInvoice}
                  className="btn-glossy px-4 py-2 rounded-lg text-sm font-medium text-dark-900 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Print All
                </button>
                <button 
                  onClick={() => setBulkInvoice(false)} 
                  className="p-2 text-dark-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Invoice Content */}
            <div ref={invoiceRef} className="max-h-[70vh] overflow-y-auto">
              {getSelectedOrders().map((order, idx) => (
                <div key={order.id} className={idx > 0 ? 'page-break' : ''}>
                  <Invoice order={order} />
                  {idx < selectedIds.length - 1 && (
                    <div className="border-t-2 border-dashed border-primary/30 my-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
