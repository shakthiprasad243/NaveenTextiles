'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Database, Shield, Users, Settings } from 'lucide-react';

export default function DiagnosePage() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/diagnose-supabase');
      const data = await response.json();
      setDiagnostics(data);
    } catch (error) {
      console.error('Diagnostics failed:', error);
      setDiagnostics({ error: 'Failed to run diagnostics' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'no_user':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const StatusBadge = ({ condition, trueText = 'OK', falseText = 'MISSING' }: { condition: boolean; trueText?: string; falseText?: string }) => (
    <span className={`px-2 py-1 rounded text-xs font-bold ${
      condition ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
    }`}>
      {condition ? trueText : falseText}
    </span>
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <h1 className="text-2xl text-white mb-2">Running Diagnostics...</h1>
          <p className="text-dark-400">Checking Supabase and Clerk integration</p>
        </div>
      </div>
    );
  }

  if (!diagnostics) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">
          <button 
            onClick={runDiagnostics}
            className="px-6 py-3 btn-glossy rounded-lg text-dark-900 font-medium"
          >
            Run Diagnostics
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-white mb-4">Supabase & Clerk Diagnostics</h1>
        <p className="text-dark-400">
          Comprehensive check of database structure, policies, and authentication integration
        </p>
        <button 
          onClick={runDiagnostics}
          disabled={loading}
          className="mt-4 px-4 py-2 glass-card rounded-lg text-dark-200 hover:text-primary transition"
        >
          <RefreshCw className={`w-4 h-4 inline mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Diagnostics
        </button>
      </div>

      {diagnostics.error && (
        <div className="glass-card-gold rounded-xl p-6 mb-6 border-red-500/30 bg-red-500/10">
          <div className="flex items-center gap-2 text-red-400">
            <XCircle className="w-5 h-5" />
            <span className="font-medium">Diagnostics Failed</span>
          </div>
          <p className="text-red-300 mt-2">{diagnostics.error}</p>
        </div>
      )}

      {/* Environment Check */}
      <div className="glass-card-gold rounded-xl p-6 mb-6">
        <h2 className="text-white font-medium mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Environment Configuration
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-primary font-medium mb-2">Supabase</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-300">URL:</span>
                <StatusBadge condition={!!diagnostics.environment?.supabaseUrl} />
              </div>
              <div className="flex justify-between">
                <span className="text-dark-300">Service Key:</span>
                <StatusBadge condition={diagnostics.environment?.hasServiceKey} />
              </div>
              {diagnostics.environment?.supabaseUrl && (
                <p className="text-xs text-dark-400 font-mono break-all">
                  {diagnostics.environment.supabaseUrl}
                </p>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-primary font-medium mb-2">Clerk</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-300">Secret Key:</span>
                <StatusBadge condition={diagnostics.environment?.hasClerkKey} />
              </div>
              <div className="flex justify-between">
                <span className="text-dark-300">Webhook Secret:</span>
                <StatusBadge condition={diagnostics.environment?.hasWebhookSecret} />
              </div>
              {diagnostics.clerk?.webhookUrl && (
                <p className="text-xs text-dark-400 font-mono break-all">
                  Webhook: {diagnostics.clerk.webhookUrl}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Database Connection */}
      <div className="glass-card-gold rounded-xl p-6 mb-6">
        <h2 className="text-white font-medium mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          Database Connection & Structure
        </h2>
        
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-3 glass-card rounded-lg">
            <span className="text-dark-300">Supabase Connection</span>
            <div className="flex items-center gap-2">
              <StatusIcon status={diagnostics.database?.connection?.status} />
              <span className="text-sm text-dark-200">
                {diagnostics.database?.connection?.status || 'Unknown'}
              </span>
            </div>
          </div>

          {diagnostics.database?.connection?.error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{diagnostics.database.connection.error}</p>
            </div>
          )}

          {/* Users Table */}
          <div>
            <h3 className="text-primary font-medium mb-2">Users Table</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 glass-card rounded-lg">
                <span className="text-dark-300">Table Exists</span>
                <StatusBadge condition={diagnostics.database?.tables?.users?.exists} />
              </div>
              
              {diagnostics.database?.tables?.users?.sampleData && (
                <div className="p-3 glass-card rounded-lg">
                  <p className="text-dark-300 text-sm mb-2">Sample Record Structure:</p>
                  <pre className="text-xs text-dark-400 overflow-auto">
                    {JSON.stringify(diagnostics.database.tables.users.sampleData, null, 2)}
                  </pre>
                </div>
              )}

              {diagnostics.database?.tables?.users?.error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{diagnostics.database.tables.users.error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Users */}
      <div className="glass-card-gold rounded-xl p-6 mb-6">
        <h2 className="text-white font-medium mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Admin Users
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 glass-card rounded-lg">
            <span className="text-dark-300">Total Admin Users</span>
            <span className="text-primary font-bold">
              {diagnostics.database?.users?.admins?.count || 0}
            </span>
          </div>

          {diagnostics.database?.users?.specificAdmin && (
            <div className="p-4 glass-card rounded-lg">
              <h3 className="text-primary font-medium mb-2">Admin User: admin@naveentextiles.com</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-dark-300">ID: <span className="text-white font-mono text-xs">{diagnostics.database.users.specificAdmin.id}</span></p>
                  <p className="text-dark-300">Name: <span className="text-white">{diagnostics.database.users.specificAdmin.name}</span></p>
                  <p className="text-dark-300">Email: <span className="text-white">{diagnostics.database.users.specificAdmin.email}</span></p>
                </div>
                <div>
                  <p className="text-dark-300">Is Admin: <StatusBadge condition={diagnostics.database.users.specificAdmin.is_admin} /></p>
                  <p className="text-dark-300">Clerk ID: 
                    <span className={`ml-2 ${diagnostics.database.users.specificAdmin.clerk_user_id ? 'text-green-400' : 'text-red-400'}`}>
                      {diagnostics.database.users.specificAdmin.clerk_user_id || 'NOT LINKED'}
                    </span>
                  </p>
                  <p className="text-dark-300">Created: <span className="text-white text-xs">{new Date(diagnostics.database.users.specificAdmin.created_at).toLocaleString()}</span></p>
                </div>
              </div>
            </div>
          )}

          {diagnostics.database?.users?.admins?.users?.length > 0 && (
            <div className="p-4 glass-card rounded-lg">
              <h3 className="text-primary font-medium mb-2">All Admin Users</h3>
              <div className="space-y-2">
                {diagnostics.database.users.admins.users.map((admin: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-dark-800 rounded">
                    <div>
                      <p className="text-white text-sm">{admin.name}</p>
                      <p className="text-dark-400 text-xs">{admin.email}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge condition={!!admin.clerk_user_id} trueText="LINKED" falseText="NOT LINKED" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clerk Integration */}
      <div className="glass-card-gold rounded-xl p-6 mb-6">
        <h2 className="text-white font-medium mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Clerk Integration
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 glass-card rounded-lg">
            <span className="text-dark-300">Clerk Connection</span>
            <div className="flex items-center gap-2">
              <StatusIcon status={diagnostics.clerk?.connection?.status} />
              <span className="text-sm text-dark-200">
                {diagnostics.clerk?.connection?.status || 'Unknown'}
              </span>
            </div>
          </div>

          {diagnostics.clerk?.currentUser && (
            <div className="p-4 glass-card rounded-lg">
              <h3 className="text-primary font-medium mb-2">Current Clerk User</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-dark-300">ID: <span className="text-white font-mono text-xs">{diagnostics.clerk.currentUser.id}</span></p>
                  <p className="text-dark-300">Email: <span className="text-white">{diagnostics.clerk.currentUser.email}</span></p>
                </div>
                <div>
                  <p className="text-dark-300">Is Admin (Clerk): <StatusBadge condition={diagnostics.clerk.currentUser.isAdmin} /></p>
                  <p className="text-dark-300">Public Metadata: 
                    <span className="text-white text-xs ml-2">
                      {JSON.stringify(diagnostics.clerk.currentUser.publicMetadata)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {diagnostics.clerk?.connection?.error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{diagnostics.clerk.connection.error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="glass-card-gold rounded-xl p-6">
        <h2 className="text-white font-medium mb-4">Recommendations</h2>
        <div className="space-y-3 text-sm">
          {!diagnostics.database?.connection?.status === 'success' && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium">Database Connection Failed</p>
                <p className="text-red-300">Check your Supabase URL and service role key in .env.local</p>
              </div>
            </div>
          )}

          {!diagnostics.database?.users?.specificAdmin?.clerk_user_id && (
            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-medium">Admin User Not Linked</p>
                <p className="text-yellow-300">The admin user exists but is not linked to a Clerk user ID. Use the force refresh page to link it.</p>
              </div>
            </div>
          )}

          {diagnostics.clerk?.connection?.status === 'no_user' && (
            <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-blue-400 mt-0.5" />
              <div>
                <p className="text-blue-400 font-medium">No Clerk User Authenticated</p>
                <p className="text-blue-300">Sign in with your admin account to test the full integration.</p>
              </div>
            </div>
          )}

          {diagnostics.database?.connection?.status === 'success' && 
           diagnostics.database?.users?.specificAdmin?.clerk_user_id &&
           diagnostics.clerk?.currentUser?.isAdmin && (
            <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
              <div>
                <p className="text-green-400 font-medium">Integration Looks Good!</p>
                <p className="text-green-300">Database is connected, admin user exists and is linked, and Clerk integration is working.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Raw Data */}
      <details className="mt-6">
        <summary className="text-dark-400 cursor-pointer hover:text-primary">Raw Diagnostic Data</summary>
        <pre className="mt-2 p-4 bg-dark-800 rounded-lg text-xs text-dark-300 overflow-auto">
          {JSON.stringify(diagnostics, null, 2)}
        </pre>
      </details>
    </div>
  );
}