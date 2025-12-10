'use client';

// Force dynamic rendering to avoid Clerk prerendering issues
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase, DbProductVariant } from '@/lib/supabase';
import { Package, ShoppingCart, AlertTriangle, TrendingUp, ArrowUpRight, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import GoogleDriveImage from '@/components/GoogleDriveImage';

interface Product {
  id: string;
  name: string;
  category: string;
  images: string[];
  active: boolean;
  variations: { stock: number }[];
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch products
        const { data: productsData } = await supabase
          .from('products')
          .select(`*, product_variants (stock_qty, reserved_qty, images)`)
          .order('created_at', { ascending: false });

        const transformedProducts: Product[] = (productsData || []).map(p => ({
          id: p.id,
          name: p.name,
          category: p.category || '',
          images: p.product_variants?.[0]?.images || [],
          active: p.active,
          variations: (p.product_variants || []).map((v: DbProductVariant) => ({
            stock: v.stock_qty - v.reserved_qty
          }))
        }));
        setProducts(transformedProducts);

        // Fetch orders
        const { data: ordersData } = await supabase
          .from('orders')
          .select('id, order_number, customer_name, total, status')
          .order('created_at', { ascending: false })
          .limit(10);

        setOrders(ordersData || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const lowStockItems = products.filter(p => p.variations.some(v => v.stock < 5)).length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const activeProducts = products.filter(p => p.active).length;

  const stats = [
    { label: 'Total Products', value: products.length, subValue: `${activeProducts} active`, icon: Package, gradient: 'from-blue-600 to-blue-400', href: '/admin/products' },
    { label: 'Pending Orders', value: pendingOrders, subValue: `${orders.length} total`, icon: ShoppingCart, gradient: 'from-primary to-gold-400', href: '/admin/orders' },
    { label: 'Low Stock Items', value: lowStockItems, subValue: 'Need attention', icon: AlertTriangle, gradient: 'from-red-600 to-red-400', href: '/admin/products' },
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, subValue: 'All time', icon: TrendingUp, gradient: 'from-green-600 to-green-400', href: '/admin/orders' }
  ];

  const recentOrders = orders.slice(0, 5);
  const lowStockProducts = products.filter(p => p.variations.some(v => v.stock < 5)).slice(0, 5);

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gold-400 text-xs md:text-sm uppercase tracking-wider font-bold">Admin Dashboard</p>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-white mt-2">Welcome Back!</h1>
        <p className="text-dark-400 text-xs md:text-sm mt-1">Here&apos;s what&apos;s happening with your store today.</p>
      </div>

      {/* Enhanced Stats Grid - Better mobile layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
        {stats.map((stat, index) => (
          <Link 
            key={stat.label} 
            href={stat.href} 
            className="glass-card-enhanced p-4 md:p-5 lg:p-6 rounded-xl md:rounded-2xl group hover-lift hover:gold-glow-strong transition-all animate-fadeIn"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className={`w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg md:rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-dark-400 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </div>
            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-xs md:text-sm text-dark-300 font-medium">{stat.label}</p>
            <p className="text-xs text-primary/70 mt-1 md:mt-2">{stat.subValue}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Orders */}
        <div className="glass-card-enhanced rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Recent Orders
            </h2>
            <Link href="/admin/orders" className="text-primary text-sm hover:text-primary-light transition flex items-center gap-1 group">
              View All <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order, index) => (
              <div 
                key={order.id} 
                className="flex items-center justify-between p-4 glass-card rounded-xl hover:bg-primary/5 transition-all group animate-fadeIn"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-gold-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-dark-100 font-semibold">{order.order_number || order.id.slice(0, 8)}</p>
                    <p className="text-dark-400 text-sm">{order.customer_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-primary font-bold text-lg mb-1">₹{(order.total || 0).toLocaleString()}</p>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${
                    order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                    order.status === 'SHIPPED' ? 'bg-blue-500/20 text-blue-400' :
                    order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' :
                    'bg-dark-600 text-dark-300'
                  }`}>
                    {order.status.toLowerCase()}
                  </span>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-dark-400 mx-auto mb-3" />
                <p className="text-dark-300">No orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="glass-card-enhanced rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" /> Low Stock Alert
            </h2>
            <Link href="/admin/products" className="text-primary text-sm hover:text-primary-light transition flex items-center gap-1 group">
              Manage <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
          <div className="space-y-3">
            {lowStockProducts.map((product, index) => {
              const lowestStock = Math.min(...product.variations.map(v => v.stock));
              return (
                <div 
                  key={product.id} 
                  className="flex items-center justify-between p-4 glass-card rounded-xl hover:bg-red-500/5 transition-all group animate-fadeIn"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-dark-700 overflow-hidden relative group-hover:scale-110 transition-transform">
                      {product.images[0] ? (
                        <GoogleDriveImage src={product.images[0]} alt={product.name} fill sizes="48px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-dark-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-dark-100 font-semibold truncate">{product.name}</p>
                      <p className="text-dark-400 text-sm">{product.category}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 bg-red-500/20 text-red-400 text-sm font-bold rounded-lg whitespace-nowrap">
                    {lowestStock} left
                  </span>
                </div>
              );
            })}
            {lowStockProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                  <Package className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-dark-300 font-medium">All products are well stocked!</p>
                <p className="text-dark-400 text-sm mt-1">No items need restocking</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions - Better mobile grid */}
      <div className="mt-6 md:mt-8 glass-card-enhanced rounded-xl md:rounded-2xl p-4 md:p-6">
        <h2 className="text-base md:text-lg font-bold text-white mb-4 md:mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {[
            { href: '/admin/products', icon: Package, label: 'Add Product', gradient: 'from-blue-500/20 to-blue-600/20' },
            { href: '/admin/orders', icon: ShoppingCart, label: 'View Orders', gradient: 'from-primary/20 to-gold-600/20' },
            { href: '/admin/users', icon: Clock, label: 'Manage Users', gradient: 'from-purple-500/20 to-purple-600/20' },
            { href: '/', icon: TrendingUp, label: 'View Store', gradient: 'from-green-500/20 to-green-600/20' }
          ].map((action, index) => (
            <Link 
              key={action.href}
              href={action.href} 
              className="p-6 glass-card rounded-xl text-center hover:bg-primary/10 transition-all group hover-lift animate-fadeIn"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-7 h-7 text-primary" />
              </div>
              <p className="text-dark-200 font-medium group-hover:text-white transition">{action.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
