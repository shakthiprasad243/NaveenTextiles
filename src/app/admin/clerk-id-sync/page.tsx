'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Shield, Database, CheckCircle, XCircle, AlertTriangle, Copy, RefreshCw } from 'lucide-react';

export default function ClerkIdSyncPage() {
  const { user: clerkUser } = useUser();
  const [email, setEmail] = useState('admin@naveentextiles.com');
  const [currentClerkId, setCurrentClerkId] = useState('');
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clerkUser?.id) {
      setCurrentClerkId(clerkUser.id);
      setEmail(clerkUser.primaryEmailAddress?.emailAddress || 'admin@naveentextiles.com');
    }
  }, [clerkUser]);

  const checkSupabaseStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/sync-production-admin?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      setSupabaseStatus(data);
    } catch (error) {
      console.error('Error checking Supabase status:', error);
      setSupabaseStatus({ error: 'Failed to check status' });
    } finally {
      setLoading(false);
    }
  };

  const syncClerkId = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/sync-production-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          clerkUserId: currentClerkId,
          isAdmin: true
        })
      });

      const data = await response.json();
      setSyncResult(data);
      
      // Refresh Supabase status
      await checkSupabaseStatus();
    } catch (error) {
      console.error('Error syncing Clerk ID:', error);
      setSyncResult({ error: 'Failed to sync Clerk ID' });
    } finally {
      setLoading(false);
    }
  };

  const copyClerkId = () => {
    navigator.clipboard.writeText(currentClerkId);
  };

  useEffect(() => {
    if (email) {
      checkSupabaseStatus();
    }
  }, [email]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-white mb-4">Clerk ID Synchronization</h1>
        <p className="text-dark-400">
          Fix admin access by linking your current Clerk user ID to Supabase
        </p>
      </div>

      {/* Current Clerk User Info */}
      <div className="glass-card-gold rounded-xl p-6 mb-6">
        <h2 className="text-white font-medium mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Current Clerk User
        </h2>
        
        <div className="space-y-4">
          {clerkUser ? (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-primary font-medium mb-2">User Information</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-dark-300">Email: <span className="text-white">{clerkUser.primaryEmailAddress?.emailAddress}</span></p>
                  <p className="text-dark-300">Name: <span className="text-white">{clerkUser.fullName || 'Not set'}</span></p>
                  <p className="text-dark-300">Admin in Metadata: 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                      clerkUser.publicMetadata?.isAdmin ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {clerkUser.publicMetadata?.isAdmin ? 'YES' : 'NO'}
                    </span>
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-primary font-medium mb-2">Clerk User ID</h3>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-dark-800 rounded text-xs text-dark-300 font-mono break-all">
                    {currentClerkId}
                  </code>
                  <button
                    onClick={copyClerkId}
                    className="p-2 glass-card rounded hover:bg-primary/10 transition"
                    title="Copy Clerk ID"
                  >
                    <Copy className="w-4 h-4 text-primary" />
                  </button>
                </div>
                <p className="text-dark-400 text-xs mt-2">
                  This is your current Clerk user ID that needs to be linked to Supabase
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <p className="text-yellow-400 font-medium">No Clerk user detected</p>
              <p className="text-dark-400 text-sm">Please sign in to see your Clerk user information</p>
            </div>
          )}
        </div>
      </div>

      {/* Supabase Status */}
      <div className="glass-card-gold rounded-xl p-6 mb-6">
        <h2 className="text-white font-medium mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          Supabase Status
        </h2>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-4 py-2 glass-card rounded-lg text-dark-200 placeholder-dark-500 outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={checkSupabaseStatus}
              disabled={loading}
              className="px-6 py-2 glass-card rounded-lg text-dark-200 hover:text-primary transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {supabaseStatus && (
            <div className="p-4 glass-card rounded-lg">
              <h3 className="text-primary font-medium mb-3">Database Record Status</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-dark-300">User Exists: 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                      supabaseStatus.exists ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {supabaseStatus.exists ? 'YES' : 'NO'}
                    </span>
                  </p>
                  <p className="text-dark-300">Is Admin: 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                      supabaseStatus.isAdmin ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {supabaseStatus.isAdmin ? 'YES' : 'NO'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-dark-300">Has Clerk ID: 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                      supabaseStatus.hasClerkId ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {supabaseStatus.hasClerkId ? 'YES' : 'NO'}
                    </span>
                  </p>
                  {supabaseStatus.user?.clerk_user_id && (
                    <div className="mt-2">
                      <p className="text-dark-400 text-xs">Current Clerk ID in DB:</p>
                      <code className="text-xs text-dark-300 font-mono break-all">
                        {supabaseStatus.user.clerk_user_id}
                      </code>
                    </div>
                  )}
                </div>
              </div>

              {/* ID Mismatch Warning */}
              {supabaseStatus.user?.clerk_user_id && 
               currentClerkId && 
               supabaseStatus.user.clerk_user_id !== currentClerkId && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                    <div className="text-yellow-300 text-sm">
                      <p className="font-medium">Clerk ID Mismatch Detected!</p>
                      <p>Your current Clerk ID doesn't match the one stored in Supabase.</p>
                      <p className="mt-1">
                        <strong>Current:</strong> <code className="text-xs">{currentClerkId}</code><br/>
                        <strong>In DB:</strong> <code className="text-xs">{supabaseStatus.user.clerk_user_id}</code>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success State */}
              {supabaseStatus.user?.clerk_user_id && 
               currentClerkId && 
               supabaseStatus.user.clerk_user_id === currentClerkId && 
               supabaseStatus.isAdmin && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                    <div className="text-green-300 text-sm">
                      <p className="font-medium">Perfect! Everything is properly linked.</p>
                      <p>Your Clerk ID matches the database record and you have admin privileges.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sync Action */}
      <div className="glass-card-gold rounded-xl p-6 mb-6">
        <h2 className="text-white font-medium mb-4">Sync Current Clerk ID</h2>
        
        <div className="space-y-4">
          <p className="text-dark-300 text-sm">
            This will update your Supabase record to use your current Clerk user ID, ensuring admin access works properly.
          </p>
          
          <button
            onClick={syncClerkId}
            disabled={loading || !currentClerkId || !email}
            className="w-full px-6 py-3 btn-glossy rounded-lg text-dark-900 font-medium"
          >
            {loading ? 'Syncing...' : 'Sync Current Clerk ID to Supabase'}
          </button>
        </div>
      </div>

      {/* Sync Result */}
      {syncResult && (
        <div className="glass-card-gold rounded-xl p-6 mb-6">
          <h2 className="text-white font-medium mb-4">Sync Result</h2>
          <div className={`p-4 rounded-lg border ${
            syncResult.success 
              ? 'border-green-500/30 bg-green-500/20 text-green-400' 
              : 'border-red-500/30 bg-red-500/20 text-red-400'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {syncResult.success ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              <span className="font-medium">
                {syncResult.success ? 'Sync Successful!' : 'Sync Failed'}
              </span>
            </div>
            <p className="text-sm">{syncResult.message || syncResult.error}</p>
            
            {syncResult.success && (
              <div className="mt-3 p-3 bg-dark-800 rounded-lg">
                <p className="text-green-400 text-sm font-medium mb-2">Next Steps:</p>
                <ol className="text-green-300 text-sm space-y-1 list-decimal list-inside">
                  <li>Refresh this page or go back to the main site</li>
                  <li>The admin panel should now appear in the header</li>
                  <li>If not, try signing out and signing back in</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="glass-card-gold rounded-xl p-6">
        <h2 className="text-white font-medium mb-4">Understanding the Issue</h2>
        <div className="space-y-4 text-sm text-dark-300">
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h3 className="text-blue-400 font-medium mb-2">Why This Happens</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>Development and Production Clerk environments have separate user databases</li>
              <li>Same email can have different Clerk user IDs in each environment</li>
              <li>Your Supabase record was linked to the development Clerk ID</li>
              <li>When switching to production, the Clerk ID doesn't match</li>
            </ul>
          </div>

          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <h3 className="text-green-400 font-medium mb-2">The Solution</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>Update your Supabase record with the current (production) Clerk ID</li>
              <li>This ensures the AuthContext can find your admin record</li>
              <li>Admin panel will then appear correctly in production</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}