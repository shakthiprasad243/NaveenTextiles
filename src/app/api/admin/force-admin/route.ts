import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Get current user
    const { userId } = await auth();
    
    if (!userId) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user from Clerk
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const clerkUser = await clerk.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    // Check if user exists in Supabase
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      // Update existing user to be admin and link with Clerk
      const { data, error } = await supabase
        .from('users')
        .update({
          clerk_user_id: userId,
          is_admin: true,
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .select()
        .single();

      if (error) {
        return Response.json({ 
          error: 'Failed to update user', 
          details: error 
        }, { status: 500 });
      }

      return Response.json({
        success: true,
        message: 'User updated to admin and linked with Clerk',
        user: data,
        action: 'updated'
      });
    } else {
      // Create new user as admin
      const { data, error } = await supabase
        .from('users')
        .insert({
          clerk_user_id: userId,
          email: email,
          name: clerkUser.fullName || clerkUser.firstName || 'Admin User',
          phone: clerkUser.primaryPhoneNumber?.phoneNumber || '',
          is_admin: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return Response.json({ 
          error: 'Failed to create user', 
          details: error 
        }, { status: 500 });
      }

      return Response.json({
        success: true,
        message: 'New admin user created and linked with Clerk',
        user: data,
        action: 'created'
      });
    }

  } catch (error) {
    console.error('Error forcing admin status:', error);
    return Response.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}