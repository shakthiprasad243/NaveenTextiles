import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if admin client is properly configured
export function isAdminClientConfigured(): boolean {
  return Boolean(supabaseServiceRoleKey && supabaseServiceRoleKey.length > 10);
}

// Admin client with service role key - bypasses RLS
// ONLY use this on the server side (API routes)
// Falls back to anon key if service role key is not configured
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl, 
  isAdminClientConfigured() ? supabaseServiceRoleKey : supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
