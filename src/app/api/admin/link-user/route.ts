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

    // Update the existing Supabase record to link with Clerk ID
    const { data, error } = await supabase
      .from('users')
      .update({
        clerk_user_id: userId,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()
      .single();

    if (error) {
      return Response.json({ 
        error: 'Failed to link user', 
        details: error,
        attempted: {
          clerk_user_id: userId,
          email: email
        }
      }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: 'User successfully linked with Clerk ID',
      user: data,
      instructions: 'Now refresh the page to see admin panel'
    });

  } catch (error) {
    console.error('Error linking user:', error);
    return Response.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}