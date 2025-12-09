'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Package, MapPin, Phone, Mail, Edit2, LogOut, Shield, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  product_name: string;
  qty: number;
  unit_price: number;
}

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

export default function AccountPage() {
  const { user, isLoading, logout, updateProfile } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '', address: '' });
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    if (user) {
      setEditData({ name: user.name, phone: user.phone, address: user.address || '' });
      fetchUserOrders();
    }
  }, [user, isLoading, router]);

  async function fetchUserOrders() {
    if (!user) return;
    
    try {
      setOrdersLoading(true);
      const allOrders: Order[] = [];
      const existingIds = new Set<string>();
      
      // Fetch by email
      if (user.email) {
        try {
          const response = await fetch(`/api/orders?email=${encodeURIComponent(user.email)}`);
          const data = await response.json();
          if (data.orders) {
            data.orders.forEach((order: Order) => {
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
      
      // Also fetch by phone
      if (user.phone) {
        try {
          const normalizedPhone = user.phone.replace(/\D/g, '').slice(-10);
          const response = await fetch(`/api/orders?phone=${encodeURIComponent(normalizedPhone)}`);
          const data = await response.json();
          if (data.orders) {
            data.orders.forEach((order: Order) => {
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
      
      // Sort by date
      allOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setUserOrders(allOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const handleSaveProfile = () => {
    updateProfile(editData);
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gold-400 text-sm uppercase tracking-wider font-medium">
            My Account
          </p>
          <h1 className="text-3xl font-serif text-white mt-1">Welcome, {user.name.split(' ')[0]}!</h1>
        </div>
        {user.isAdmin && (
          <Link href="/admin" className="btn-glossy px-4 py-2 rounded-lg text-sm font-medium text-dark-900 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Admin Panel
          </Link>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="glass-card-gold rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-primary font-medium">Profile</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-dark-400 hover:text-primary transition"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-gold-600 flex items-center justify-center text-dark-900 text-2xl font-bold mb-3">
                {user.name.charAt(0)}
              </div>
              {!isEditing ? (
                <>
                  <h4 className="text-dark-200 font-medium">{user.name}</h4>
                  <p className="text-dark-500 text-sm">{user.isAdmin ? 'Administrator' : 'Customer'}</p>
                </>
              ) : (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="mt-2 px-3 py-2 glass-card rounded-lg text-dark-200 text-sm text-center outline-none focus:ring-1 focus:ring-primary/50 w-full"
                />
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-dark-400 text-sm">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                {!isEditing ? (
                  <span className="text-dark-400 text-sm">{user.phone}</span>
                ) : (
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="flex-1 px-3 py-1.5 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50"
                  />
                )}
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                {!isEditing ? (
                  <span className="text-dark-400 text-sm">{user.address || 'No address saved'}</span>
                ) : (
                  <textarea
                    value={editData.address}
                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                    rows={2}
                    className="flex-1 px-3 py-1.5 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                    placeholder="Enter your address"
                  />
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 rounded-lg text-sm text-dark-400 border border-dark-600 hover:border-dark-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 btn-glossy py-2 rounded-lg text-sm font-medium text-dark-900"
                >
                  Save
                </button>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="w-full mt-6 py-3 rounded-lg text-sm text-red-400 border border-red-400/30 hover:bg-red-400/10 transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Orders & Quick Links */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Links */}
          <div className="glass-card-gold rounded-xl p-6">
            <h3 className="text-primary font-medium mb-4">Quick Links</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: Package, label: 'My Orders', href: '/account/orders', desc: 'Track your orders' },
                { icon: MapPin, label: 'Addresses', href: '/account/addresses', desc: 'Manage addresses' },
                { icon: User, label: 'Profile Settings', href: '#', desc: 'Update your info', onClick: () => setIsEditing(true) },
                { icon: Shield, label: 'Privacy', href: '/privacy', desc: 'Privacy settings' },
              ].map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  onClick={item.onClick}
                  className="flex items-center gap-4 p-4 glass-card rounded-lg hover:border-primary/30 transition group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-dark-200 text-sm font-medium group-hover:text-primary transition">{item.label}</p>
                    <p className="text-dark-500 text-xs">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-dark-500 group-hover:text-primary transition" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="glass-card-gold rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-primary font-medium">Recent Orders</h3>
              <Link href="/account/orders" className="text-dark-400 hover:text-primary text-sm transition">
                View All
              </Link>
            </div>

            {ordersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : userOrders.length > 0 ? (
              <div className="space-y-3">
                {userOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 glass-card rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-dark-200 text-sm font-medium">{order.order_number || order.id.slice(0, 8)}</p>
                        <p className="text-dark-500 text-xs">{order.order_items?.length || 0} item(s) • ₹{order.total?.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.status?.toUpperCase() === 'DELIVERED' ? 'bg-green-500/20 text-green-400' :
                        order.status?.toUpperCase() === 'SHIPPED' ? 'bg-blue-500/20 text-blue-400' :
                        order.status?.toUpperCase() === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                        'bg-primary/20 text-primary'
                      }`}>
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1).toLowerCase()}
                      </span>
                      <p className="text-dark-500 text-xs mt-1 flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400 text-sm">No orders yet</p>
                <Link href="/products" className="text-primary hover:text-primary-light text-sm mt-2 inline-block">
                  Start Shopping
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
