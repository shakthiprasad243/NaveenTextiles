'use client';

// Force dynamic rendering to avoid Clerk prerendering issues
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Download, Calendar, TrendingUp, Package, DollarSign, ShoppingCart, Loader2, FileText } from 'lucide-react';

interface SalesData {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total: number;
  status: string;
  created_at: string;
  order_items: {
    product_name: string;
    qty: number;
    unit_price: number;
  }[];
}

export default function SalesReportPage() {
  const [orders, setOrders] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    // Set default dates (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setToDate(today.toISOString().split('T')[0]);
    setFromDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!fromDate || !toDate) return;
      
      try {
        setLoading(true);
        let query = supabase
          .from('orders')
          .select(`*, order_items (product_name, qty, unit_price)`)
          .gte('created_at', `${fromDate}T00:00:00`)
          .lte('created_at', `${toDate}T23:59:59`)
          .order('created_at', { ascending: false });

        if (statusFilter) {
          query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;
        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error('Error fetching sales data:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [fromDate, toDate, statusFilter]);

  const filteredOrders = orders;

  // Calculate statistics
  const totalSales = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = filteredOrders.length;
  const deliveredOrders = filteredOrders.filter(o => o.status === 'DELIVERED').length;
  const pendingOrders = filteredOrders.filter(o => o.status === 'PENDING').length;
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  const exportToCSV = () => {
    setExporting(true);
    try {
      const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'Status', 'Items', 'Total'];
      const rows = filteredOrders.map(order => [
        order.order_number || order.id.slice(0, 8),
        new Date(order.created_at).toLocaleDateString('en-IN'),
        order.customer_name,
        order.customer_phone,
        order.status,
        order.order_items?.length || 0,
        order.total
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `sales-report-${fromDate}-to-${toDate}.csv`;
      link.click();
    } catch (err) {
      console.error('Error exporting CSV:', err);
      alert('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const exportDetailedCSV = () => {
    setExporting(true);
    try {
      const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'Product', 'Quantity', 'Unit Price', 'Line Total', 'Order Total', 'Status'];
      const rows: (string | number)[][] = [];

      filteredOrders.forEach(order => {
        order.order_items?.forEach((item, idx) => {
          rows.push([
            order.order_number || order.id.slice(0, 8),
            new Date(order.created_at).toLocaleDateString('en-IN'),
            idx === 0 ? order.customer_name : '',
            idx === 0 ? order.customer_phone : '',
            item.product_name,
            item.qty,
            item.unit_price,
            item.qty * item.unit_price,
            idx === 0 ? order.total : '',
            idx === 0 ? order.status : ''
          ]);
        });
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `sales-detailed-${fromDate}-to-${toDate}.csv`;
      link.click();
    } catch (err) {
      console.error('Error exporting CSV:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif text-white">Sales Report</h1>
          <p className="text-primary/70 text-sm">View and export sales data</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card-gold rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="text-dark-400 text-xs mb-1 block">From Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>
          <div>
            <label className="text-dark-400 text-xs mb-1 block">To Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>
          <div>
            <label className="text-dark-400 text-xs mb-1 block">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PACKED">Packed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="text-dark-400 text-xs mb-1 block">Export Summary</label>
            <button
              onClick={exportToCSV}
              disabled={exporting || loading}
              className="w-full btn-glossy px-4 py-2.5 rounded-lg text-sm font-medium text-dark-900 flex items-center justify-center gap-2"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Summary CSV
            </button>
          </div>
          <div>
            <label className="text-dark-400 text-xs mb-1 block">Export Detailed</label>
            <button
              onClick={exportDetailedCSV}
              disabled={exporting || loading}
              className="w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-primary/20 text-primary hover:bg-primary/30 flex items-center justify-center gap-2 transition"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Detailed CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">₹{totalSales.toLocaleString()}</p>
          <p className="text-dark-400 text-xs">Total Sales</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{totalOrders}</p>
          <p className="text-dark-400 text-xs">Total Orders</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-gold-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-dark-900" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">₹{Math.round(avgOrderValue).toLocaleString()}</p>
          <p className="text-dark-400 text-xs">Avg Order Value</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-400">{deliveredOrders}</p>
          <p className="text-dark-400 text-xs">Delivered</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-600 to-yellow-400 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-yellow-400">{pendingOrders}</p>
          <p className="text-dark-400 text-xs">Pending</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card-gold rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary/20 bg-dark-800/50">
                  <th className="text-left py-4 px-4 text-dark-400 font-medium">Order</th>
                  <th className="text-left py-4 px-4 text-dark-400 font-medium">Date</th>
                  <th className="text-left py-4 px-4 text-dark-400 font-medium hidden md:table-cell">Customer</th>
                  <th className="text-left py-4 px-4 text-dark-400 font-medium hidden sm:table-cell">Items</th>
                  <th className="text-left py-4 px-4 text-dark-400 font-medium">Status</th>
                  <th className="text-right py-4 px-4 text-dark-400 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition">
                    <td className="py-4 px-4">
                      <p className="text-dark-200 font-mono font-medium">{order.order_number || order.id.slice(0, 8)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-dark-300">{new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      <p className="text-white">{order.customer_name}</p>
                      <p className="text-dark-300 text-xs">{order.customer_phone}</p>
                    </td>
                    <td className="py-4 px-4 hidden sm:table-cell">
                      <p className="text-dark-300">{order.order_items?.length || 0}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                        order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {order.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-primary font-medium">₹{(order.total || 0).toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              {filteredOrders.length > 0 && (
                <tfoot>
                  <tr className="bg-dark-800/50">
                    <td colSpan={5} className="py-4 px-4 text-right text-dark-200 font-medium">
                      Total ({filteredOrders.length} orders):
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-primary font-bold text-lg">₹{totalSales.toLocaleString()}</span>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          )}
        </div>

        {!loading && filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-dark-300 mx-auto mb-3" />
            <p className="text-primary/70">No orders found for selected period</p>
          </div>
        )}
      </div>
    </div>
  );
}
