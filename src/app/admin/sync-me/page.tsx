'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle, XCircle, User } from 'lucide-react';

export default function SyncMePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/check-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to sync user');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/check-user');
      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to check user');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-white mb-4">Admin Role Sync</h1>
        <p className="text-dark-400">
          Use this page to sync your admin role from Clerk to Supabase
        </p>
      </div>

      <div className="glass-card-gold rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={handleCheck}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 glass-card rounded-lg text-dark-200 hover:text-primary transition"
          >
            <User className="w-5 h-5" />
            {loading ? 'Checking...' : 'Check Status'}
          </button>
          
          <button
            onClick={handleSync}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 btn-glossy rounded-lg text-dark-900 font-medium"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Syncing...' : 'Force Sync'}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 mb-4">
            <XCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {result.success ? (
              <div className="flex items-center gap-2 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span>{result.message} - Admin Status: {result.isAdmin ? 'YES' : 'NO'}</span>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-white font-medium">User Status:</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="glass-card p-4 rounded-lg">
                    <h4 className="text-primary font-medium mb-2">Clerk Status</h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-dark-300">Email: {result.email}</p>
                      <p className="text-dark-300">Should be Admin: {result.clerk?.shouldBeAdmin ? 'YES' : 'NO'}</p>
                      <p className="text-dark-300">Detected Role: {result.clerk?.detectedRole || 'None'}</p>
                      <p className="text-dark-300">Detected isAdmin: {result.clerk?.detectedIsAdmin ? 'YES' : 'NO'}</p>
                    </div>
                  </div>
                  
                  <div className="glass-card p-4 rounded-lg">
                    <h4 className="text-primary font-medium mb-2">Supabase Status</h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-dark-300">User Exists: {result.supabase?.exists ? 'YES' : 'NO'}</p>
                      <p className="text-dark-300">Is Admin: {result.supabase?.isAdmin ? 'YES' : 'NO'}</p>
                    </div>
                  </div>
                </div>

                {result.clerk?.shouldBeAdmin && !result.supabase?.exists && (
                  <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400">
                    <p className="font-medium">Action Required:</p>
                    <p className="text-sm">You should be admin in Clerk but don't exist in Supabase. Click "Force Sync" to fix this.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="glass-card-gold rounded-xl p-6">
        <h3 className="text-white font-medium mb-4">Instructions:</h3>
        <div className="space-y-2 text-sm text-dark-300">
          <p>1. <strong>Check Status</strong> - See your current admin status in both Clerk and Supabase</p>
          <p>2. <strong>Force Sync</strong> - Create/update your user record in Supabase with admin privileges</p>
          <p>3. <strong>Refresh Page</strong> - After syncing, refresh the main site to see admin panel</p>
        </div>
      </div>
    </div>
  );
}