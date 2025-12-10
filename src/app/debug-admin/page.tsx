'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useAuth } from '@/context/AuthContext';
import { Shield, Database, CheckCircle, XCircle, AlertTriangle, RefreshCw, User } from 'lucide-react';

export default function DebugAdminPage() {
  const { user: clerkUser, isLoaded } = useUser();
  const { user: authUser, isLoading: authLoading, refreshUser } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDebug = async () => {
    setLoading(true);
    try {
      // Get debug info from API
      const response = await fetch('/api/admin/debug-auth');
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Debug failed:', error);
      setDebugInfo({ error: 'Failed to get debug info' });
    } finally {
      setLoading(false);
    }
  };

  const forceAdminSync = async () => {
    setLoading(true);
    try {
      // Force admin creation/update
      const response = await fetch('/api/admin/force-admin', {
        method: 'POST'
      });
      const result = await response.json();
      setSyncResult(result);
      
      // Refresh auth context
      await refreshUser();
      
      // Re-run debug
      await runDebug();
    } catch (error) {
      console.error('Force admin failed:', error);
      setSyncResult({ error: 'Failed to force admin status' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && clerkUser) {
      runDebug();
    }
  }, [isLoaded, clerkUser]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-white mb-4">Admin Access Debug Tool</h1>
        <p className="text-dark-400">
          Public tool to diagnose and fix admin access issues
        </p>
      </div>

      {/* Current Status Overview */}
      <div className="glass-card-gold rounded-xl p-6 mb-6">
        <h2 className="text-white font-medium mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Current Status
        </h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 glass-card rounded-lg">
            <h3 className="text-primary font-medium mb-2">Clerk User</h3>
            {isLoaded ? (
              clerkUser ? (
                <div>
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-green-400 text-sm">Signed In</p>
                  <p className="text-dark-400 text-xs">{clerkUser.primaryEmailAddress?.emailAddress}</p>
                </div>
              ) : (
                <div>
                  <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-red-400 text-sm">Not Signed In</p>
                </div>
              )
            ) : (
              <div>
                <RefreshCw className="w-8 h-8 text-yellow-400 mx-auto mb-2 animate-spin" />
                <p className="text-yellow-400 text-sm">Loading...</p>
              </div>
            )}
          </div>

          <div className="text-center p-4 glass-card rounded-lg">
            <h3 className="text-primary font-medium mb-2">Auth Context</h3>
            {authLoading ? (
              <div>
                <RefreshCw className="w-8 h-8 text-yellow-400 mx-auto mb-2 animate-spin" />
                <p className="text-yellow-400 text-sm">Loading...</p>
              </div>
            ) : authUser ? (
              <div>
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 text-sm">User Found</p>
                <p className="text-dark-400 text-xs">{authUser.email}</p>
              </div>
            ) : (
              <div>
                <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-red-400 text-sm">No User</p>
              </div>
            )}
          </div>

          <div className="text-center p-4 glass-card rounded-lg">
            <h3 className="text-primary font-medium mb-2">Admin Status</h3>
            {authUser?.isAdmin ? (
              <div>
                <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 text-sm">Admin Access</p>
                <p className="text-green-300 text-xs">Panel should be visible</p>
              </div>
            ) : (
              <div>
                <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-red-400 text-sm">No Admin Access</p>
                <p className="text-red-300 text-xs">Panel not visible</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card-gold rounded-xl p-6 mb-6">
        <h2 className="text-white font-medium mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={runDebug}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 glass-card rounded-lg text-dark-200 hover:text-primary transition"
          >
            <Database className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Checking...' : 'Check Status'}
          </button>
          
          <button
            onClick={forceAdminSync}
            disabled={loading || !clerkUser}
            className="flex items-center justify-center gap-2 px-6 py-3 btn-glossy rounded-lg text-dark-900 font-medium"
          >
            <Shield className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Syncing...' : 'Force Admin Access'}
          </button>
        </div>
      </div>

      {/* Detailed Debug Info */}
      {debugInfo && (
        <div className="glass-card-gold rounded-xl p-6 mb-6">
          <h2 className="text-white font-medium mb-4">Debug Information</h2>
          
          <div className="space-y-4">
            {/* Clerk Info */}
            <div className="p-4 glass-card rounded-lg">
              <h3 className="text-primary font-medium mb-2">Clerk User Details</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-dark-300">User ID: <span className="text-white font-mono text-xs">{debugInfo.userId || 'Not found'}</span></p>
                  <p className="text-dark-300">Email: <span className="text-white">{debugInfo.email || 'Not found'}</span></p>
                </div>
                <div>
                  <p className="text-dark-300">Should be Admin: 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                      debugInfo.clerk?.shouldBeAdmin ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {debugInfo.clerk?.shouldBeAdmin ? 'YES' : 'NO'}
                    </span>
                  </p>
                  <p className="text-dark-300">Public Metadata: 
                    <span className="text-white text-xs ml-2">
                      {JSON.stringify(debugInfo.clerk?.publicMetadata || {})}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Supabase Info */}
            <div className="p-4 glass-card rounded-lg">
              <h3 className="text-primary font-medium mb-2">Supabase Database Status</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
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
                </div>
                <div>
                  {debugInfo.supabase?.customUserByEmail && (
                    <>
                      <p className="text-dark-300">Is Admin in DB: 
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                          debugInfo.supabase.customUserByEmail.is_admin ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {debugInfo.supabase.customUserByEmail.is_admin ? 'YES' : 'NO'}
                        </span>
                      </p>
                      <p className="text-dark-300">Clerk ID in DB: 
                        <span className="text-white text-xs ml-2 font-mono">
                          {debugInfo.supabase.customUserByEmail.clerk_user_id || 'NULL'}
                        </span>
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Issue Detection */}
            <div className="p-4 glass-card rounded-lg">
              <h3 className="text-primary font-medium mb-2">Issue Analysis</h3>
              <div className="space-y-2">
                {!debugInfo.supabase?.customUserByClerkId && debugInfo.supabase?.customUserByEmail && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                    <div className="text-yellow-300 text-sm">
                      <p className="font-medium">Clerk ID Mismatch</p>
                      <p>User exists in database but with different/missing Clerk ID. Click "Force Admin Access" to fix.</p>
                    </div>
                  </div>
                )}

                {!debugInfo.supabase?.customUserByEmail && (
                  <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                    <div className="text-red-300 text-sm">
                      <p className="font-medium">User Not Found</p>
                      <p>No user record found in database. Click "Force Admin Access" to create one.</p>
                    </div>
                  </div>
                )}

                {debugInfo.supabase?.customUserByEmail && !debugInfo.supabase.customUserByEmail.is_admin && (
                  <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                    <div className="text-red-300 text-sm">
                      <p className="font-medium">Not Admin in Database</p>
                      <p>User exists but doesn't have admin privileges. Click "Force Admin Access" to fix.</p>
                    </div>
                  </div>
                )}

                {debugInfo.supabase?.customUserByClerkId && debugInfo.supabase.customUserByClerkId.is_admin && (
                  <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                    <div className="text-green-300 text-sm">
                      <p className="font-medium">Everything Looks Good!</p>
                      <p>User is properly linked and has admin privileges. Admin panel should be visible.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
                {syncResult.success ? 'Admin Access Granted!' : 'Sync Failed'}
              </span>
            </div>
            <p className="text-sm">{syncResult.message || syncResult.error}</p>
            
            {syncResult.success && (
              <div className="mt-3 p-3 bg-dark-800 rounded-lg">
                <p className="text-green-400 text-sm font-medium mb-2">Success! Next Steps:</p>
                <ol className="text-green-300 text-sm space-y-1 list-decimal list-inside">
                  <li>Refresh this page to see updated status</li>
                  <li>Go back to the main site</li>
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
        <h2 className="text-white font-medium mb-4">How to Use This Tool</h2>
        <div className="space-y-3 text-sm text-dark-300">
          <p>1. <strong>Sign in</strong> with your admin account first</p>
          <p>2. <strong>Check Status</strong> to see what's wrong</p>
          <p>3. <strong>Force Admin Access</strong> to fix the issue</p>
          <p>4. <strong>Refresh</strong> and check if admin panel appears</p>
          
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 font-medium">Note:</p>
            <p className="text-blue-300">This tool is publicly accessible and doesn't require existing admin access. It's designed to bootstrap admin access when you're locked out.</p>
          </div>
        </div>
      </div>
    </div>
  );
}