'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@clerk/nextjs';
import { RefreshCw, CheckCircle, XCircle, Shield, AlertCircle } from 'lucide-react';

export default function ForceRefreshPage() {
  const { user, refreshUser, isLoading } = useAuth();
  const { user: clerkUser } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [linkResult, setLinkResult] = useState<any>(null);
  const [debugData, setDebugData] = useState<any>(null);

  const handleForceRefresh = async () => {
    setRefreshing(true);
    try {
      // First link the user
      const linkResponse = await fetch('/api/admin/link-user', {
        method: 'POST',
      });
      const linkData = await linkResponse.json();
      setLinkResult(linkData);

      // Then get debug info
      const debugResponse = await fetch('/api/admin/debug-auth');
      const debugInfo = await debugResponse.json();
      setDebugData(debugInfo);

      // Finally refresh the auth context
      await refreshUser();
      
      // Force a page reload to ensure all contexts are refreshed
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Error during force refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleForceAdmin = async () => {
    setRefreshing(true);
    try {
      // Force admin status
      const forceResponse = await fetch('/api/admin/force-admin', {
        method: 'POST',
      });
      const forceData = await forceResponse.json();
      setLinkResult(forceData);

      // Then get debug info
      const debugResponse = await fetch('/api/admin/debug-auth');
      const debugInfo = await debugResponse.json();
      setDebugData(debugInfo);

      // Finally refresh the auth context
      await refreshUser();
      
      // Force a page reload to ensure all contexts are refreshed
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Error during force admin:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Auto-run on page load
    handleForceRefresh();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-white mb-4">Force Admin Access Refresh</h1>
        <p className="text-dark-400">
          This page will force-link your Clerk account with Supabase and refresh your admin status
        </p>
      </div>

      {/* Current Status */}
      <div className="glass-card-gold rounded-xl p-6 mb-6">
        <h2 className="text-white font-medium mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Current Status
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-primary font-medium mb-2">Clerk User</h3>
            <div className="space-y-1 text-sm">
              <p className="text-dark-300">ID: <span className="text-white font-mono text-xs">{clerkUser?.id || 'Not loaded'}</span></p>
              <p className="text-dark-300">Email: <span className="text-white">{clerkUser?.primaryEmailAddress?.emailAddress || 'Not loaded'}</span></p>
              <p className="text-dark-300">Admin in Metadata: 
                <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                  clerkUser?.publicMetadata?.isAdmin ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {clerkUser?.publicMetadata?.isAdmin ? 'YES' : 'NO'}
                </span>
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-primary font-medium mb-2">Auth Context</h3>
            <div className="space-y-1 text-sm">
              {isLoading ? (
                <div className="flex items-center gap-2 text-dark-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Loading...
                </div>
              ) : user ? (
                <>
                  <p className="text-dark-300">Name: <span className="text-white">{user.name}</span></p>
                  <p className="text-dark-300">Email: <span className="text-white">{user.email}</span></p>
                  <p className="text-dark-300">Admin Status: 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                      user.isAdmin ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {user.isAdmin ? 'YES' : 'NO'}
                    </span>
                  </p>
                </>
              ) : (
                <p className="text-red-400">No user found</p>
              )}
            </div>
          </div>
        </div>

        {/* Admin Panel Status */}
        <div className="mt-4 p-4 rounded-lg border">
          {user?.isAdmin ? (
            <div className="flex items-center gap-2 text-green-400 border-green-500/30 bg-green-500/20">
              <CheckCircle className="w-5 h-5" />
              <span>✅ Admin panel should be visible in the header! Look for the "Admin" button.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-400 border-red-500/30 bg-red-500/20">
              <XCircle className="w-5 h-5" />
              <span>❌ Admin panel not accessible. Running refresh process...</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="glass-card-gold rounded-xl p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={handleForceRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-6 py-4 glass-card rounded-lg text-dark-200 hover:text-primary transition font-medium"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Processing...' : 'Link & Refresh'}
          </button>
          
          <button
            onClick={handleForceAdmin}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-6 py-4 btn-glossy rounded-lg text-dark-900 font-medium"
          >
            <Shield className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Processing...' : 'Force Admin Status'}
          </button>
        </div>
        
        <div className="mt-4 text-center text-sm text-dark-400">
          <p><strong>Link & Refresh:</strong> Links your existing account</p>
          <p><strong>Force Admin:</strong> Creates/updates your account with admin privileges</p>
        </div>
        
        {refreshing && (
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-2 text-primary">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Processing... Page will reload automatically.</span>
            </div>
          </div>
        )}
      </div>

      {/* Link Result */}
      {linkResult && (
        <div className="glass-card-gold rounded-xl p-6 mb-6">
          <h2 className="text-white font-medium mb-4">Link Result</h2>
          <div className={`p-4 rounded-lg border ${
            linkResult.success 
              ? 'border-green-500/30 bg-green-500/20 text-green-400' 
              : 'border-red-500/30 bg-red-500/20 text-red-400'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {linkResult.success ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              <span className="font-medium">
                {linkResult.success ? 'Successfully Linked!' : 'Link Failed'}
              </span>
            </div>
            <p className="text-sm">{linkResult.message || linkResult.error}</p>
            {linkResult.instructions && (
              <p className="text-sm mt-2 font-medium">{linkResult.instructions}</p>
            )}
          </div>
        </div>
      )}

      {/* Debug Data */}
      {debugData && (
        <div className="glass-card-gold rounded-xl p-6">
          <h2 className="text-white font-medium mb-4">Debug Information</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-primary font-medium mb-2">Supabase Status</h3>
              <div className="space-y-1 text-sm">
                <p className="text-dark-300">Found by Clerk ID: 
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                    debugData.supabase?.customUserByClerkId ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {debugData.supabase?.customUserByClerkId ? 'YES' : 'NO'}
                  </span>
                </p>
                <p className="text-dark-300">Found by Email: 
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                    debugData.supabase?.customUserByEmail ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {debugData.supabase?.customUserByEmail ? 'YES' : 'NO'}
                  </span>
                </p>
                {debugData.supabase?.customUserByEmail && (
                  <p className="text-dark-300">Is Admin: 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                      debugData.supabase.customUserByEmail.is_admin ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {debugData.supabase.customUserByEmail.is_admin ? 'YES' : 'NO'}
                    </span>
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-primary font-medium mb-2">Next Steps</h3>
              <div className="space-y-2 text-sm">
                {debugData.supabase?.customUserByClerkId ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Account is properly linked</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>Linking account...</span>
                  </div>
                )}
                
                {debugData.supabase?.customUserByEmail?.is_admin ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Admin flag is set in database</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-400">
                    <XCircle className="w-4 h-4" />
                    <span>Admin flag not set in database</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <details className="mt-4">
            <summary className="text-dark-400 cursor-pointer hover:text-primary">Raw Debug Data</summary>
            <pre className="mt-2 p-4 bg-dark-800 rounded-lg text-xs text-dark-300 overflow-auto">
              {JSON.stringify(debugData, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Instructions */}
      <div className="glass-card-gold rounded-xl p-6 mt-6">
        <h2 className="text-white font-medium mb-4">Instructions</h2>
        <div className="space-y-3 text-sm text-dark-300">
          <p>1. This page automatically links your Clerk account with your Supabase user record</p>
          <p>2. It refreshes your authentication context to pick up the admin status</p>
          <p>3. The page will reload automatically to ensure all contexts are fresh</p>
          <p>4. After reload, check the header for the "Admin" button (next to the search icon)</p>
          <p>5. If you still don't see it, your email might not have admin privileges in the database</p>
        </div>
      </div>
    </div>
  );
}