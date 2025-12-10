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
    const phone = clerkUser.phoneNumbers[0]?.phoneNumber;
    const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';

    // Force admin for shakthiprasad243@gmail.com
    const isAdmin = email === 'shakthiprasad243@gmail.com' || 
                   clerkUser.publicMetadata?.isAdmin === true || 
                   clerkUser.publicMetadata?.role === 'admin';

    // Delete any existing user record first
    await supabase
      .from('users')
      .delete()
      .eq('clerk_user_id', userId);

    await supabase
      .from('users')
      .delete()
      .eq('email', email);

    // Create fresh user record with admin status
    const { data, error } = await supabase
      .from('users')
      .insert({
        clerk_user_id: userId,
        email,
        name,
        phone,
        profile_image_url: clerkUser.imageUrl,
        is_admin: isAdmin,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return Response.json({ 
        error: 'Failed to create user', 
        details: error,
        attempted: {
          clerk_user_id: userId,
          email,
          name,
          is_admin: isAdmin
        }
      }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: 'User created with admin privileges',
      user: data,
      isAdmin,
      instructions: 'Now log out and log back in to see admin panel'
    });

  } catch (error) {
    console.error('Error forcing admin:', error);
    return Response.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}