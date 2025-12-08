'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Package, ChevronLeft, Clock, MapPin, Phone, Truck } from 'lucide-react';
import Link from 'next/link';
import { orders } from '@/lib/data';

const statusSteps = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];

export default function OrdersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Get user's orders (demo - in real app, filter by user ID)
  const userOrders = orders;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500/20 text-green-400';
      case 'shipped': return 'bg-blue-500/20 text-blue-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      case 'packed': return 'bg-purple-500/20 text-purple-400';
      case 'confirmed': return 'bg-cyan-500/20 text-cyan-400';
      default: return 'bg-primary/20 text-primary';
    }
  };

  const getStatusIndex = (status: string) => statusSteps.indexOf(status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/account" className="inline-flex items-center gap-2 text-dark-400 hover:text-primary text-sm mb-4 transition">
          <ChevronLeft className="w-4 h-4" /> Back to Account
        </Link>
        <h1 className="text-3xl font-serif text-white">My Orders</h1>
        <p className="text-dark-400 mt-1">Track and manage your orders</p>
      </div>

      {userOrders.length > 0 ? (
        <div className="space-y-6">
          {userOrders.map((order) => (
            <div key={order.id} className="glass-card-gold rounded-xl overflow-hidden">
              {/* Order Header */}
              <div className="p-4 border-b border-dark-700/50 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-dark-200 font-medium">{order.id}</p>
                  <p className="text-dark-500 text-xs flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              {/* Order Progress */}
              {order.status !== 'cancelled' && (
                <div className="p-4 border-b border-dark-700/50">
                  <div className="flex items-center justify-between relative">
                    {statusSteps.map((step, idx) => {
                      const isCompleted = getStatusIndex(order.status) >= idx;
                      const isCurrent = order.status === step;
                      return (
                        <div key={step} className="flex flex-col items-center relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            isCompleted ? 'bg-primary text-dark-900' : 'glass-card text-dark-500'
                          } ${isCurrent ? 'ring-2 ring-primary/50' : ''}`}>
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          <span className={`text-xs mt-2 capitalize ${isCompleted ? 'text-primary' : 'text-dark-500'}`}>
                            {step}
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
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-dark-700 flex items-center justify-center">
                        <Package className="w-6 h-6 text-dark-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-dark-200 text-sm font-medium">{item.productName}</p>
                        <p className="text-dark-500 text-xs">Size: {item.size} • Color: {item.color} • Qty: {item.quantity}</p>
                      </div>
                      <p className="text-primary font-medium">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="mt-4 pt-4 border-t border-dark-700/50 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-start gap-4 text-dark-400 text-xs">
                    <div className="flex items-start gap-1">
                      <MapPin className="w-3 h-3 mt-0.5" />
                      <span>{order.deliveryAddress}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>{order.customerPhone}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-dark-500 text-xs">Total Amount</p>
                    <p className="text-primary font-bold text-lg">₹{order.total}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-3">
                  {order.status === 'delivered' && (
                    <button className="flex-1 py-2 rounded-lg text-sm text-dark-300 border border-dark-600 hover:border-primary hover:text-primary transition">
                      Write a Review
                    </button>
                  )}
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <a
                      href={`https://wa.me/919876543210?text=Hi, I need help with order ${order.id}`}
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
    </div>
  );
}
