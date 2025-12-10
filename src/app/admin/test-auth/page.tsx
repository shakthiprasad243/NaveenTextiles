'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { RefreshCw, CheckCircle, XCircle, User, Shield } from 'lucide-react';

export default function TestAuthPage() {
  const { user, isLoading, refreshUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUser();
      // Also fetch debug info
      const response = await fetch('/api/admin/debug-auth');
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLink = async () => {
    try {
      const response = await fetch('/api/admin/link-user', {
        method: 'POST',
      });
      const result = await response.json();
      console.log('Link result:', result);
      
      // Refresh after linking
      await handleRefresh();
    } catch (error) {
      console.error('Error linking:', error);
    }
  };

  useEffect(() => {
    // Auto-fetch debug info on load
    handleRefresh();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-white mb-4">Auth Debug & Test</h1>
        <p className="text-dark-400">
          Test and debug your authentication and admin status
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Current Auth State */}
        <div className="glass-card-gold rounded-xl p-6">
          <h2 className="text-white font-medium mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Current Auth State
          </h2>
          
          {isLoading ? (
            <div className="flex items-center gap-2 text-dark-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading...
            </div>
          ) : user ? (
            <div className="space-y-2 text-sm">
              <p className="text-dark-300">Name: <span className="text-white">{user.name}</span></p>
              <p className="text-dark-300">Email: <span className="text-white">{user.email}</span></p>
              <p className="text-dark-300">Admin: 
                <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                  user.isAdmin ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {user.isAdmin ? 'YES' : 'NO'}
                </span>
              </p>
              {user.isAdmin && (
                <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 mt-4">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">You should see the admin panel in the header!</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-red-400">No user found</p>
          )}
        </div>

        {/* Actions */}
        <div className="glass-card-gold rounded-xl p-6">
          <h2 className="text-white font-medium mb-4">Actions</h2>
          <div className="space-y-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 glass-card rounded-lg text-dark-200 hover:text-primary transition"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Auth State'}
            </button>
            
            <button
              onClick={handleLink}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 btn-glossy rounded-lg text-dark-900 font-medium"
            >
              <User className="w-4 h-4" />
              Link Clerk to Supabase
            </button>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      {debugInfo && (
        <div className="glass-card-gold rounded-xl p-6">
          <h2 className="text-white font-medium mb-4">Debug Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-primary font-medium mb-2">Clerk Status</h3>
              <div className="space-y-1 text-sm">
                <p className="text-dark-300">User ID: <span className="text-white font-mono text-xs">{debugInfo.userId}</span></p>
                <p className="text-dark-300">Email: <span className="text-white">{debugInfo.email}</span></p>
                <p className="text-dark-300">Should be Admin: 
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                    debugInfo.clerk?.shouldBeAdmin ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {debugInfo.clerk?.shouldBeAdmin ? 'YES' : 'NO'}
                  </span>
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-primary font-medium mb-2">Supabase Status</h3>
              <div className="space-y-1 text-sm">
                <p className="text-dark-300">Found by Clerk ID: 
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                    debugInfo.supabase?.customUserByClerkId ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {debugInfo.supabase?.customUserByClerkId ? 'YES' : 'NO'}
                  </span>
                </p>
                <p className="text-dark-300">Found by Email: 
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                    debugInfo.supabase?.customUserByEmail ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {debugInfo.supabase?.customUserByEmail ? 'YES' : 'NO'}
                  </span>
                </p>
                {debugInfo.supabase?.customUserByEmail && (
                  <p className="text-dark-300">Is Admin: 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                      debugInfo.supabase.customUserByEmail.is_admin ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {debugInfo.supabase.customUserByEmail.is_admin ? 'YES' : 'NO'}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Raw Debug Data */}
          <details className="mt-4">
            <summary className="text-dark-400 cursor-pointer hover:text-primary">Raw Debug Data</summary>
            <pre className="mt-2 p-4 bg-dark-800 rounded-lg text-xs text-dark-300 overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}