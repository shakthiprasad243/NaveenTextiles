'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@clerk/nextjs';

export default function SimpleTestPage() {
  const { user: authUser, refreshUser } = useAuth();
  const { user: clerkUser } = useUser();
  const [result, setResult] = useState<any>(null);

  const runTest = async () => {
    try {
      console.log('=== ADMIN ACCESS TEST ===');
      
      // 1. Check Clerk user
      console.log('1. Clerk User:', {
        id: clerkUser?.id,
        email: clerkUser?.primaryEmailAddress?.emailAddress,
        isAdmin: clerkUser?.publicMetadata?.isAdmin
      });

      // 2. Check Auth Context user
      console.log('2. Auth Context User:', {
        id: authUser?.id,
        email: authUser?.email,
        isAdmin: authUser?.isAdmin
      });

      // 3. Test debug API
      const debugResponse = await fetch('/api/admin/debug-auth');
      const debugData = await debugResponse.json();
      console.log('3. Debug API Response:', debugData);

      // 4. Test force admin API
      const forceResponse = await fetch('/api/admin/force-admin', {
        method: 'POST'
      });
      const forceData = await forceResponse.json();
      console.log('4. Force Admin Response:', forceData);

      // 5. Refresh auth context
      await refreshUser();
      console.log('5. Auth refreshed');

      setResult({
        clerk: {
          id: clerkUser?.id,
          email: clerkUser?.primaryEmailAddress?.emailAddress,
          isAdmin: clerkUser?.publicMetadata?.isAdmin
        },
        authContext: {
          id: authUser?.id,
          email: authUser?.email,
          isAdmin: authUser?.isAdmin
        },
        debug: debugData,
        force: forceData
      });

    } catch (error) {
      console.error('Test failed:', error);
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl text-white mb-6">Simple Admin Test</h1>
      
      <button 
        onClick={runTest}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg mb-6"
      >
        Run Test
      </button>

      <div className="space-y-4">
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-white mb-2">Clerk User:</h3>
          <p className="text-gray-300">ID: {clerkUser?.id || 'Not loaded'}</p>
          <p className="text-gray-300">Email: {clerkUser?.primaryEmailAddress?.emailAddress || 'Not loaded'}</p>
          <p className="text-gray-300">Admin: {clerkUser?.publicMetadata?.isAdmin ? 'YES' : 'NO'}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-white mb-2">Auth Context User:</h3>
          <p className="text-gray-300">ID: {authUser?.id || 'Not loaded'}</p>
          <p className="text-gray-300">Email: {authUser?.email || 'Not loaded'}</p>
          <p className="text-gray-300">Admin: {authUser?.isAdmin ? 'YES' : 'NO'}</p>
        </div>

        {result && (
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-white mb-2">Test Results:</h3>
            <pre className="text-gray-300 text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-yellow-900 rounded">
        <h3 className="text-yellow-200 mb-2">What to check:</h3>
        <ul className="text-yellow-100 text-sm space-y-1">
          <li>1. Open browser console (F12) and click "Run Test"</li>
          <li>2. Check if Clerk user shows isAdmin: true</li>
          <li>3. Check if Auth Context user shows isAdmin: true</li>
          <li>4. Look for any errors in the console</li>
          <li>5. After test, go back to home page and check header for Admin button</li>
        </ul>
      </div>
    </div>
  );
}