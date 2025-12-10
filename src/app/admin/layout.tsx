'use client';

import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingCart, Users, Shield, ArrowLeft, TrendingUp, Tag } from 'lucide-react';
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
    { href: '/admin/offers', icon: Tag, label: 'Offers' },
    { href: '/admin/sales', icon: TrendingUp, label: 'Sales' },
    { href: '/admin/users', icon: Users, label: 'Users' }
  ];

  return (
    <div className="min-h-screen">
      {/* Enhanced Admin Header - Better mobile layout */}
      <header className="glass-card-enhanced border-b border-primary/30 px-3 md:px-4 py-3 md:py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-primary/20 to-gold-600/20 flex items-center justify-center">
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <Link href="/admin" className="font-bold text-base md:text-xl text-transparent bg-clip-text bg-gradient-to-r from-primary via-gold-400 to-primary hover:from-gold-400 hover:to-primary transition-all">
              Admin Panel
            </Link>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:flex items-center gap-2 glass-card px-3 md:px-4 py-2 rounded-xl">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-primary to-gold-500 flex items-center justify-center text-dark-900 text-xs md:text-sm font-bold">
                {user.name.charAt(0)}
              </div>
              <span className="text-dark-300 text-xs md:text-sm">
                <span className="text-primary font-medium">{user.name}</span>
              </span>
            </div>
            <Link href="/" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-dark-300 hover:text-primary transition-all glass-card px-3 md:px-4 py-2 rounded-xl hover:bg-primary/10 group min-h-[40px] md:min-h-[44px]">
              <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 group-hover:-translate-x-1 transition-transform" /> 
              <span className="hidden sm:inline">Back to Store</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Enhanced Sidebar */}
        <aside className="w-64 glass-card border-r border-primary/10 min-h-[calc(100vh-72px)] hidden md:block">
          <nav className="p-4 space-y-2">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group animate-fadeIn ${
                    isActive 
                      ? 'bg-gradient-to-r from-primary/20 to-gold-600/20 text-primary border border-primary/30 shadow-lg' 
                      : 'text-dark-300 hover:bg-primary/10 hover:text-primary hover:border hover:border-primary/20'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-primary/20' 
                      : 'bg-dark-700 group-hover:bg-primary/10'
                  }`}>
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-dark-400 group-hover:text-primary'} transition`} />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Enhanced Mobile Nav - Better touch targets */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 glass-card-enhanced border-t border-primary/30 z-50 backdrop-blur-xl safe-area-bottom">
          <nav className="flex justify-around py-2 px-1">
            {navItems.map(item => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all min-w-[60px] min-h-[56px] justify-center ${
                    isActive ? 'text-primary bg-primary/10' : 'text-dark-400 hover:text-primary'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                  <span className="text-[10px] font-medium leading-tight text-center">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content - Better mobile padding */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">{children}</main>
      </div>
    </div>
  );
}
