'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, User, Shield, ShieldOff, Eye, Mail, Phone, Calendar, Package, X, Loader2 } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  isBlocked: boolean;
  createdAt: Date;
  totalOrders: number;
  totalSpent: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'admin' | 'blocked'>('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch admin users
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('user_id');

      const adminUserIds = new Set((adminData || []).map(a => a.user_id));

      // Fetch order stats for each user
      const { data: ordersData } = await supabase
        .from('orders')
        .select('user_id, total');

      const orderStats: Record<string, { count: number; total: number }> = {};
      (ordersData || []).forEach(order => {
        if (order.user_id) {
          if (!orderStats[order.user_id]) {
            orderStats[order.user_id] = { count: 0, total: 0 };
          }
          orderStats[order.user_id].count++;
          orderStats[order.user_id].total += order.total || 0;
        }
      });

      const transformedUsers: UserData[] = (usersData || []).map(user => ({
        id: user.id,
        name: user.name,
        email: user.email || '',
        phone: user.phone,
        isAdmin: user.is_admin || adminUserIds.has(user.id),
        isBlocked: false, // We don't have a blocked field yet
        createdAt: new Date(user.created_at),
        totalOrders: orderStats[user.id]?.count || 0,
        totalSpent: orderStats[user.id]?.total || 0
      }));

      setUsers(transformedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);
    const matchesFilter = filterType === 'all' ||
      (filterType === 'admin' && user.isAdmin) ||
      (filterType === 'blocked' && user.isBlocked);
    return matchesSearch && matchesFilter;
  });

  const toggleBlock = (userId: string) => {
    // For now, just update local state (would need a blocked field in DB)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u));
    if (selectedUser?.id === userId) {
      setSelectedUser(prev => prev ? { ...prev, isBlocked: !prev.isBlocked } : null);
    }
  };

  const toggleAdmin = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    try {
      if (user.isAdmin) {
        // Remove admin
        await supabase.from('admin_users').delete().eq('user_id', userId);
        await supabase.from('users').update({ is_admin: false }).eq('id', userId);
      } else {
        // Make admin
        await supabase.from('admin_users').insert({ user_id: userId, role: 'admin' });
        await supabase.from('users').update({ is_admin: true }).eq('id', userId);
      }

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isAdmin: !u.isAdmin } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, isAdmin: !prev.isAdmin } : null);
      }
    } catch (err) {
      console.error('Error toggling admin:', err);
      alert('Failed to update user role');
    }
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.isAdmin).length,
    blocked: users.filter(u => u.isBlocked).length,
    active: users.filter(u => !u.isBlocked && !u.isAdmin).length
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
        <h1 className="text-2xl font-serif text-white">Users</h1>
        <p className="text-dark-400 text-sm">{users.length} registered users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: stats.total, color: 'text-primary' },
          { label: 'Admins', value: stats.admins, color: 'text-blue-400' },
          { label: 'Active', value: stats.active, color: 'text-green-400' },
          { label: 'Blocked', value: stats.blocked, color: 'text-red-400' }
        ].map((stat, i) => (
          <div key={i} className="glass-card-gold rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-dark-400 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card-gold rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'admin', 'blocked'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2.5 rounded-lg text-sm capitalize transition ${filterType === type
                    ? 'bg-primary/20 text-primary'
                    : 'glass-card text-dark-400 hover:text-dark-200'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card-gold rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary/20 bg-dark-800/50">
                <th className="text-left py-4 px-4 text-dark-400 font-medium">User</th>
                <th className="text-left py-4 px-4 text-dark-400 font-medium hidden md:table-cell">Contact</th>
                <th className="text-left py-4 px-4 text-dark-400 font-medium hidden sm:table-cell">Orders</th>
                <th className="text-left py-4 px-4 text-dark-400 font-medium">Role</th>
                <th className="text-left py-4 px-4 text-dark-400 font-medium">Status</th>
                <th className="text-right py-4 px-4 text-dark-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-gold-600 flex items-center justify-center text-dark-900 font-bold flex-shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-dark-300 text-xs md:hidden">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell">
                    <p className="text-white text-sm">{user.email}</p>
                    <p className="text-dark-300 text-xs">{user.phone}</p>
                  </td>
                  <td className="py-4 px-4 hidden sm:table-cell">
                    <p className="text-dark-200">{user.totalOrders} orders</p>
                    <p className="text-primary text-xs">₹{user.totalSpent.toLocaleString()}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.isAdmin ? 'bg-blue-500/20 text-blue-400' : 'bg-dark-600 text-dark-300'
                      }`}>
                      {user.isAdmin ? 'Admin' : 'Customer'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.isBlocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 text-dark-400 hover:text-primary hover:bg-primary/10 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleBlock(user.id)}
                        className={`p-2 rounded-lg transition ${user.isBlocked
                            ? 'text-green-400 hover:bg-green-500/10'
                            : 'text-red-400 hover:bg-red-500/10'
                          }`}
                        title={user.isBlocked ? 'Unblock' : 'Block'}
                      >
                        {user.isBlocked ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-dark-500 mx-auto mb-3" />
            <p className="text-dark-400">No users found</p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="glass-card-gold rounded-xl w-full max-w-lg animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-primary/20">
              <h3 className="text-primary font-medium text-lg">User Details</h3>
              <button onClick={() => setSelectedUser(null)} className="p-2 text-dark-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              {/* Profile */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-gold-600 flex items-center justify-center text-dark-900 text-2xl font-bold">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-dark-200 font-medium text-lg">{selectedUser.name}</h4>
                  <div className="flex gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs ${selectedUser.isAdmin ? 'bg-blue-500/20 text-blue-400' : 'bg-dark-600 text-dark-300'
                      }`}>
                      {selectedUser.isAdmin ? 'Admin' : 'Customer'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${selectedUser.isBlocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                      {selectedUser.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-dark-300">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-sm">{selectedUser.email || 'No email'}</span>
                </div>
                <div className="flex items-center gap-3 text-dark-300">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="text-sm">{selectedUser.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-dark-300">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm">Joined {selectedUser.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card rounded-lg p-4 text-center">
                  <Package className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-dark-200">{selectedUser.totalOrders}</p>
                  <p className="text-dark-500 text-xs">Total Orders</p>
                </div>
                <div className="glass-card rounded-lg p-4 text-center">
                  <p className="text-primary text-lg mb-2">₹</p>
                  <p className="text-2xl font-bold text-dark-200">{selectedUser.totalSpent.toLocaleString()}</p>
                  <p className="text-dark-500 text-xs">Total Spent</p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => toggleAdmin(selectedUser.id)}
                  className={`w-full py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition ${selectedUser.isAdmin
                      ? 'bg-dark-600 text-dark-300 hover:bg-dark-500'
                      : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                    }`}
                >
                  <Shield className="w-4 h-4" />
                  {selectedUser.isAdmin ? 'Remove Admin Access' : 'Make Admin'}
                </button>
                <button
                  onClick={() => toggleBlock(selectedUser.id)}
                  className={`w-full py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition ${selectedUser.isBlocked
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    }`}
                >
                  {selectedUser.isBlocked ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                  {selectedUser.isBlocked ? 'Unblock User' : 'Block User'}
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-primary/20">
              <button onClick={() => setSelectedUser(null)} className="w-full py-3 rounded-lg text-sm text-dark-300 border border-dark-600 hover:border-dark-500">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
