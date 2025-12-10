'use client';

import { useState, useEffect } from 'react';
import { Shield, Database, Users, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function LocalAdminAccessPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runQuickCheck = async () => {
    setLoading(true);
    try {
      // Check Supabase connection
      const supabaseResponse = await fetch('/api/admin/diagnose-supabase');
      const supabaseData = await supabaseResponse.json();
      
      // Check if admin user exists
      const adminCheckResponse = await fetch('/api/admin/check-user');
      const adminData = await adminCheckResponse.json();

      setDiagnostics({
        supabase: supabaseData,
        admin: adminData,
        environment: {
          skipAuth: process.env.SKIP_AUTH === 'true',
          hasClerkKeys: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
                       !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('YOUR_DEVELOPMENT')
        }
      });
    } catch (error) {
      console.error('Quick check failed:', error);
      setDiagnostics({ error: 'Failed to run diagnostics' });
    } finally {
      setLoading(false);
    }
  };

  const createAdminUser = async () => {
    try {
      const response = await fetch('/api/admin/force-admin', {
        method: 'POST'
      });
      const result = await response.json();
      console.log('Admin creation result:', result);
      
      // Refresh diagnostics
      await runQuickCheck();
    } catch (error) {
      console.error('Failed to create admin user:', error);
    }
  };

  useEffect(() => {
    runQuickCheck();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-white mb-4">Local Admin Access</h1>
        <p className="text-dark-400">
          Development mode admin access (SKIP_AUTH enabled)
        </p>
      </div>

      {/* Environment Status */}
      <div className="glass-card-gold rounded-xl p-6 mb-6">
        <h2 className="text-white font-medium mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Development Environment
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-dark-300">Skip Auth Mode:</span>
              <span className="px-2 py-1 rounded text-xs font-bold bg-green-500/20 text-green-400">
                ENABLED
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-dark-300">Clerk Keys:</span>
              <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500/20 text-yellow-400">
                DISABLED
              </span>
            </div>
          </div>
          <div className="text-sm text-dark-400">
            <p>✅ Authentication is bypassed for local development</p>
            <p>✅ Admin access is available without Clerk</p>
            <p>⚠️ Production keys are commented out</p>
          </div>
        </div>
      </div>

      {/* Database Status */}
      {diagnostics && (
        <div className="glass-card-gold rounded-xl p-6 mb-6">
          <h2 className="text-white font-medium mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Database Status
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 glass-card rounded-lg">
              <span className="text-dark-300">Supabase Connection</span>
              <div className="flex items-center gap-2">
                {diagnostics.supabase?.database?.connection?.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="text-sm text-dark-200">
                  {diagnostics.supabase?.database?.connection?.status || 'Unknown'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 glass-card rounded-lg">
              <span className="text-dark-300">Admin Users Count</span>
              <span className="text-primary font-bold">
                {diagnostics.supabase?.database?.users?.admins?.count || 0}
              </span>
            </div>

            {diagnostics.supabase?.database?.users?.specificAdmin && (
              <div className="p-3 glass-card rounded-lg">
                <h3 className="text-primary font-medium mb-2">Admin User Found</h3>
                <div className="text-sm space-y-1">
                  <p className="text-dark-300">
                    Email: <span className="text-white">{diagnostics.supabase.database.users.specificAdmin.email}</span>
                  </p>
                  <p className="text-dark-300">
                    Name: <span className="text-white">{diagnostics.supabase.database.users.specificAdmin.name}</span>
                  </p>
                  <p className="text-dark-300">
                    Admin Status: 
                    <span className="ml-2 px-2 py-1 rounded text-xs font-bold bg-green-500/20 text-green-400">
                      {diagnostics.supabase.database.users.specificAdmin.is_admin ? 'YES' : 'NO'}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="glass-card-gold rounded-xl p-6 mb-6">
        <h2 className="text-white font-medium mb-4">Actions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={runQuickCheck}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 glass-card rounded-lg text-dark-200 hover:text-primary transition"
          >
            <Database className="w-5 h-5" />
            {loading ? 'Checking...' : 'Check Database'}
          </button>
          
          <button
            onClick={createAdminUser}
            className="flex items-center justify-center gap-2 px-6 py-3 btn-glossy rounded-lg text-dark-900 font-medium"
          >
            <Users className="w-5 h-5" />
            Create/Update Admin User
          </button>
        </div>
      </div>

      {/* Admin Panel Access */}
      <div className="glass-card-gold rounded-xl p-6">
        <h2 className="text-white font-medium mb-4">Admin Panel Access</h2>
        <div className="space-y-4">
          <p className="text-dark-300 text-sm">
            Since authentication is bypassed in development mode, you can access the admin panel directly:
          </p>
          
          <div className="grid md:grid-cols-2 gap-3">
            <Link
              href="/admin"
              className="flex items-center justify-center gap-2 px-4 py-3 btn-glossy rounded-lg text-dark-900 font-medium"
            >
              <Shield className="w-5 h-5" />
              Admin Dashboard
            </Link>
            
            <Link
              href="/admin/diagnose"
              className="flex items-center justify-center gap-2 px-4 py-3 glass-card rounded-lg text-dark-200 hover:text-primary transition"
            >
              <Database className="w-5 h-5" />
              Full Diagnostics
            </Link>
          </div>

          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-400 mt-0.5" />
              <div className="text-blue-300 text-sm">
                <p className="font-medium">Development Mode Active</p>
                <p>Authentication is bypassed. In production, proper Clerk authentication will be required.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Raw Data */}
      {diagnostics && (
        <details className="mt-6">
          <summary className="text-dark-400 cursor-pointer hover:text-primary">Raw Diagnostic Data</summary>
          <pre className="mt-2 p-4 bg-dark-800 rounded-lg text-xs text-dark-300 overflow-auto">
            {JSON.stringify(diagnostics, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}