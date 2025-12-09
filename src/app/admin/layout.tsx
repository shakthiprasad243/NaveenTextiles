'use client';

import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingCart, Users, Shield, ArrowLeft, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center glass-card-gold rounded-xl p-8 max-w-md">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-dark-200 mb-2">Access Denied</h2>
          <p className="text-dark-400 text-sm mb-6">You need admin privileges to access this area.</p>
          <Link href="/login" className="btn-glossy px-6 py-3 rounded-lg text-sm font-medium text-dark-900 inline-block">
            Sign In as Admin
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/products', icon: Package, label: 'Products' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { href: '/admin/sales', icon: TrendingUp, label: 'Sales' },
    { href: '/admin/users', icon: Users, label: 'Users' }
  ];

  return (
    <div className="min-h-screen">
      {/* Admin Header */}
      <header className="glass-card-gold border-b border-primary/20 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <Link href="/admin" className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-primary to-gold-400">
              Admin Panel
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-dark-400 text-sm hidden sm:inline">
              Welcome, <span className="text-primary">{user.name}</span>
            </span>
            <Link href="/" className="flex items-center gap-2 text-sm text-dark-400 hover:text-primary transition">
              <ArrowLeft className="w-4 h-4" /> Back to Store
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto flex">
        {/* Sidebar */}
        <aside className="w-56 glass-card border-r border-primary/10 min-h-[calc(100vh-56px)] hidden md:block">
          <nav className="p-4 space-y-1">
            {navItems.map(item => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition group ${
                    isActive 
                      ? 'bg-primary/20 text-primary' 
                      : 'text-dark-300 hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'group-hover:text-primary'} transition`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 glass-card-gold border-t border-primary/20 z-50">
          <nav className="flex justify-around py-2">
            {navItems.map(item => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition ${
                    isActive ? 'text-primary' : 'text-dark-400'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 pb-24 md:pb-6">{children}</main>
      </div>
    </div>
  );
}
