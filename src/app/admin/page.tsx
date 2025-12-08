'use client';

import { useState, useEffect } from 'react';
import { supabase, DbProductVariant } from '@/lib/supabase';
import { Package, ShoppingCart, AlertTriangle, TrendingUp, ArrowUpRight, Clock, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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
      <div className="mb-6">
        <h1 className="text-2xl font-serif text-white">Dashboard</h1>
        <p className="text-primary/70 text-sm">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <Link key={stat.label} href={stat.href} className="glossy-card p-5 rounded-xl shine-effect group hover:scale-[1.02] transition-transform">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-dark-500 group-hover:text-primary transition" />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-dark-200">{stat.label}</p>
            <p className="text-xs text-primary/60 mt-1">{stat.subValue}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="glass-card-gold rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-white">Recent Orders</h2>
            <Link href="/admin/orders" className="text-primary text-sm hover:text-primary-light transition flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 glass-card rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-dark-200 text-sm font-medium">{order.order_number || order.id.slice(0, 8)}</p>
                    <p className="text-dark-300 text-xs">{order.customer_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-primary font-medium text-sm">₹{(order.total || 0).toLocaleString()}</p>
                  <span className={`text-xs px-2 py-0.5 rounded capitalize ${order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
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
              <p className="text-dark-500 text-center py-8">No orders yet</p>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="glass-card-gold rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" /> Low Stock Alert
            </h2>
            <Link href="/admin/products" className="text-primary text-sm hover:text-primary-light transition flex items-center gap-1">
              Manage <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {lowStockProducts.map(product => {
              const lowestStock = Math.min(...product.variations.map(v => v.stock));
              return (
                <div key={product.id} className="flex items-center justify-between p-3 glass-card rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-dark-700 overflow-hidden">
                      {product.images[0] ? (
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-dark-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-dark-200 text-sm font-medium truncate max-w-[150px]">{product.name}</p>
                      <p className="text-primary/70 text-xs">{product.category}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                    {lowestStock} left
                  </span>
                </div>
              );
            })}
            {lowStockProducts.length === 0 && (
              <div className="text-center py-8">
                <Package className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="text-primary/70 text-sm">All products are well stocked!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 glass-card-gold rounded-xl p-5">
        <h2 className="font-medium text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/admin/products" className="p-4 glass-card rounded-lg text-center hover:bg-primary/10 transition group">
            <Package className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition" />
            <p className="text-dark-300 text-sm">Add Product</p>
          </Link>
          <Link href="/admin/orders" className="p-4 glass-card rounded-lg text-center hover:bg-primary/10 transition group">
            <ShoppingCart className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition" />
            <p className="text-dark-300 text-sm">View Orders</p>
          </Link>
          <Link href="/admin/users" className="p-4 glass-card rounded-lg text-center hover:bg-primary/10 transition group">
            <Clock className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition" />
            <p className="text-dark-300 text-sm">Manage Users</p>
          </Link>
          <Link href="/" className="p-4 glass-card rounded-lg text-center hover:bg-primary/10 transition group">
            <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition" />
            <p className="text-dark-300 text-sm">View Store</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
