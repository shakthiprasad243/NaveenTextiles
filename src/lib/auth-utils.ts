import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getCurrentUser() {
  const { userId } = auth();
  
  if (!userId) {
    return null;
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return user;
}

export async function getCurrentUserClient(clerkUserId: string) {
  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: user, error } = await supabaseClient
    .from('users')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return user;
}

export async function isUserAdmin(clerkUserId: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select('is_admin')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (error) {
    console.error('Error checking admin status:', error);
    return false;
  }

  return user?.is_admin || false;
}