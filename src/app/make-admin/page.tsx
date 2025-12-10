'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function MakeAdminPage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const makeAdmin = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/make-me-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setResult({ success: true, message: data.message });
        // Refresh user data to update admin status
        await refreshUser();
      } else {
        setResult({ success: false, message: data.error || 'Failed to make admin' });
      }
    } catch (error) {
      setResult({ success: false, message: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center glass-card-gold rounded-xl p-8 max-w-md">
          <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-medium text-white mb-2">Please Sign In</h2>
          <p className="text-dark-300 text-sm">You need to be signed in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card-gold rounded-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-dark-300 text-sm">
            Grant admin privileges to your account
          </p>
        </div>

        <div className="mb-6 p-4 glass-card rounded-lg">
          <h3 className="text-white font-medium mb-2">Current User</h3>
          <p className="text-dark-300 text-sm">Name: {user.name}</p>
          <p className="text-dark-300 text-sm">Email: {user.email}</p>
          <p className="text-dark-300 text-sm">
            Admin Status: {user.isAdmin ? (
              <span className="text-green-400">✓ Admin</span>
            ) : (
              <span className="text-red-400">✗ Regular User</span>
            )}
          </p>
        </div>

        {result && (
          <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
            result.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {result.success ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <p className="text-sm">{result.message}</p>
          </div>
        )}

        {user.isAdmin ? (
          <div className="text-center">
            <div className="mb-4 p-4 bg-green-500/20 text-green-400 rounded-lg">
              <CheckCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">You already have admin access!</p>
            </div>
            <a 
              href="/admin" 
              className="btn-glossy px-6 py-3 rounded-lg text-dark-900 font-medium inline-block"
            >
              Go to Admin Panel
            </a>
          </div>
        ) : (
          <button
            onClick={makeAdmin}
            disabled={loading}
            className="w-full btn-glossy px-6 py-3 rounded-lg text-dark-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Making Admin...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Make Me Admin
              </>
            )}
          </button>
        )}

        <div className="mt-6 text-center">
          <a href="/" className="text-primary text-sm hover:text-primary-light transition">
            ← Back to Store
          </a>
        </div>
      </div>
    </div>
  );
}