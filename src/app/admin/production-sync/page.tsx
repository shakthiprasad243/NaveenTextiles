'use client';

import { useState } from 'react';
import { Shield, Database, CheckCircle, XCircle, AlertTriangle, Copy } from 'lucide-react';

export default function ProductionSyncPage() {
  const [email, setEmail] = useState('admin@naveentextiles.com');
  const [clerkUserId, setClerkUserId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [userStatus, setUserStatus] = useState<any>(null);

  const checkUserStatus = async () => {
    setChecking(true);
    try {
      const response = await fetch(`/api/admin/sync-production-admin?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      setUserStatus(data);
    } catch (error) {
      console.error('Error checking user status:', error);
      setUserStatus({ error: 'Failed to check user status' });
    } finally {
      setChecking(false);
    }
  };

  const syncAdmin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/sync-production-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          clerkUserId: clerkUserId || undefined,
          isAdmin: true
        })
      });

      const data = await response.json();
      setResult(data);
      
      // Refresh user status
      await checkUserStatus();
    } catch (error) {
      console.error('Error syncing admin:', error);
      setResult({ error: 'Failed to sync admin user' });
    } finally {
      setLoading(false);
    }
  };

  const copyWebhookUrl = () => {
    const webhookUrl = `${window.location.origin}/api/webhooks/clerk`;
    navigator.clipboard.writeText(webhookUrl);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-white mb-4">Production Admin Sync</h1>
        <p className="text-dark-400">
          Manually sync admin users for production Clerk integration
        </p>
      </div>

      {/* Webhook Configuration */}
      <div className="glass-card-gold rounded-xl p-6 mb-6">
        <h2 className="text-white font-medium mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Webhook Configuration
        </h2>
        
        <div className="space-y-4">
          <div className="p-4 glass-card rounded-lg">
            <h3 className="text-primary font-medium mb-2">Clerk Webhook URL</h3>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-dark-800 rounded text-xs text-dark-300 font-mono">
                https://naveentextiles.online/api/webhooks/clerk
              </code>
              <button
                onClick={copyWebhookUrl}
                className="p-2 glass-card rounded hover:bg-primary/10 transition"
                title="Copy webhook URL"
              >
                <Copy className="w-4 h-4 text-primary" />
              </button>
            </div>
          </div>

          <div className="p-4 glass-card rounded-lg">
            <h3 className="text-primary font-medium mb-2">Webhook Secret</h3>
            <code className="block p-2 bg-dark-800 rounded text-xs text-dark-300 font-mono">
              whsec_utYLo/0nQPOscpY11l328LJwF2B4/W7l
            </code>
          </div>

          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-400 mt-0.5" />
              <div className="text-blue-300 text-sm">
                <p className="font-medium">Webhook Setup Instructions:</p>
                <ol className="mt-2 space-y-1 list-decimal list-inside">
                  <li>Go to Clerk Dashboard → Webhooks</li>
                  <li>Add the webhook URL above</li>
                  <li>Select events: user.created, user.updated</li>
                  <li>Use the webhook secret above</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Status Check */}
      <div className="glass-card-gold rounded-xl p-6 mb-6">
        <h2 className="text-white font-medium mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          Check User Status
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
              onClick={checkUserStatus}
              disabled={checking}
              className="px-6 py-2 btn-glossy rounded-lg text-dark-900 font-medium"
            >
              {checking ? 'Checking...' : 'Check Status'}
            </button>
          </div>

          {userStatus && (
            <div className="p-4 glass-card rounded-lg">
              <h3 className="text-primary font-medium mb-2">User Status</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-dark-300">Email: <span className="text-white">{userStatus.email}</span></p>
                  <p className="text-dark-300">Exists in DB: 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                      userStatus.exists ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {userStatus.exists ? 'YES' : 'NO'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-dark-300">Is Admin: 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                      userStatus.isAdmin ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {userStatus.isAdmin ? 'YES' : 'NO'}
                    </span>
                  </p>
                  <p className="text-dark-300">Has Clerk ID: 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                      userStatus.hasClerkId ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {userStatus.hasClerkId ? 'YES' : 'NO'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual Sync */}
      <div className="glass-card-gold rounded-xl p-6 mb-6">
        <h2 className="text-white font-medium mb-4">Manual Admin Sync</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-dark-300 text-sm mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 glass-card rounded-lg text-dark-200 placeholder-dark-500 outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-dark-300 text-sm mb-2">Clerk User ID (Optional)</label>
            <input
              type="text"
              value={clerkUserId}
              onChange={(e) => setClerkUserId(e.target.value)}
              placeholder="user_xxxxxxxxxxxxx"
              className="w-full px-4 py-2 glass-card rounded-lg text-dark-200 placeholder-dark-500 outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-dark-400 text-xs mt-1">
              Optional: If you know the Clerk user ID, it will be linked automatically
            </p>
          </div>

          <button
            onClick={syncAdmin}
            disabled={loading || !email}
            className="w-full px-6 py-3 btn-glossy rounded-lg text-dark-900 font-medium"
          >
            {loading ? 'Syncing...' : 'Sync Admin User'}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="glass-card-gold rounded-xl p-6 mb-6">
          <h2 className="text-white font-medium mb-4">Sync Result</h2>
          <div className={`p-4 rounded-lg border ${
            result.success 
              ? 'border-green-500/30 bg-green-500/20 text-green-400' 
              : 'border-red-500/30 bg-red-500/20 text-red-400'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {result.success ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              <span className="font-medium">
                {result.success ? 'Success!' : 'Failed'}
              </span>
            </div>
            <p className="text-sm">{result.message || result.error}</p>
            {result.user && (
              <div className="mt-3 p-3 bg-dark-800 rounded text-xs">
                <pre>{JSON.stringify(result.user, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="glass-card-gold rounded-xl p-6">
        <h2 className="text-white font-medium mb-4">How to Fix Production Admin Access</h2>
        <div className="space-y-4 text-sm text-dark-300">
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h3 className="text-blue-400 font-medium mb-2">Option 1: Automatic (Recommended)</h3>
            <ol className="space-y-1 list-decimal list-inside">
              <li>Set up the webhook in Clerk Dashboard (see configuration above)</li>
              <li>In Clerk, go to your user profile</li>
              <li>Set public metadata: <code className="bg-dark-800 px-1 rounded">{"{ \"isAdmin\": true }"}</code></li>
              <li>The webhook will automatically sync to Supabase</li>
            </ol>
          </div>

          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <h3 className="text-yellow-400 font-medium mb-2">Option 2: Manual Sync</h3>
            <ol className="space-y-1 list-decimal list-inside">
              <li>Use the "Check User Status" above to verify current state</li>
              <li>Use "Manual Admin Sync" to create/update the admin user</li>
              <li>If you have the Clerk User ID, include it for automatic linking</li>
              <li>Test admin access on production</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}