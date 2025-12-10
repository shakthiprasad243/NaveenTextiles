import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    // Get current user
    const { userId } = await auth();
    
    if (!userId) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user from Clerk
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const clerkUser = await clerk.users.getUser(userId);

    // Check multiple possible user tables in Supabase
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    // Check custom users table
    const { data: customUser } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    // Check if user exists by email
    const { data: userByEmail } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    // Check auth.users table (Supabase built-in)
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    const authUser = authUsers?.users?.find(u => 
      u.email === email || 
      u.user_metadata?.email === email ||
      u.app_metadata?.provider_id === userId
    );

    // Check all users in custom table
    const { data: allUsers } = await supabase
      .from('users')
      .select('*')
      .limit(10);

    return Response.json({
      userId,
      email,
      clerk: {
        publicMetadata: clerkUser.publicMetadata,
        privateMetadata: clerkUser.privateMetadata,
        shouldBeAdmin: clerkUser.publicMetadata?.isAdmin === true || clerkUser.publicMetadata?.role === 'admin'
      },
      supabase: {
        customUserByClerkId: customUser,
        customUserByEmail: userByEmail,
        authUser: authUser ? {
          id: authUser.id,
          email: authUser.email,
          user_metadata: authUser.user_metadata,
          app_metadata: authUser.app_metadata
        } : null,
        authError: authError?.message,
        allCustomUsers: allUsers?.map(u => ({
          id: u.id,
          email: u.email,
          clerk_user_id: u.clerk_user_id,
          is_admin: u.is_admin
        }))
      }
    });

  } catch (error) {
    console.error('Error debugging auth:', error);
    return Response.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}