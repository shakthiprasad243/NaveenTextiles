import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if admin client is properly configured
export function isAdminClientConfigured(): boolean {
  const hasKey = Boolean(supabaseServiceRoleKey && supabaseServiceRoleKey.length > 20);
  return hasKey;
}

// Admin client with service role key - bypasses RLS
// ONLY use this on the server side (API routes)
// Falls back to anon key if service role key is not configured
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl, 
  supabaseServiceRoleKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Helper to get a fresh admin client (useful for ensuring latest env vars)
export function getAdminClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    serviceKey || anonKey || '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
