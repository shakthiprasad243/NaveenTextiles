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

    // Get user from Supabase
    const { data: supabaseUser } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    // Check admin status in Clerk metadata
    const clerkRole = clerkUser.publicMetadata?.role || clerkUser.privateMetadata?.role || clerkUser.unsafeMetadata?.role;
    const clerkIsAdmin = clerkUser.publicMetadata?.isAdmin || clerkUser.privateMetadata?.isAdmin || clerkUser.unsafeMetadata?.isAdmin;

    return Response.json({
      userId,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      clerk: {
        publicMetadata: clerkUser.publicMetadata,
        privateMetadata: clerkUser.privateMetadata,
        unsafeMetadata: clerkUser.unsafeMetadata,
        detectedRole: clerkRole,
        detectedIsAdmin: clerkIsAdmin,
        shouldBeAdmin: clerkRole === 'admin' || clerkIsAdmin === true
      },
      supabase: {
        exists: !!supabaseUser,
        isAdmin: supabaseUser?.is_admin || false,
        userData: supabaseUser
      }
    });

  } catch (error) {
    console.error('Error checking user:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Force sync current user
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

    // Check admin status in Clerk metadata
    const clerkRole = clerkUser.publicMetadata?.role || clerkUser.privateMetadata?.role || clerkUser.unsafeMetadata?.role;
    const clerkIsAdmin = clerkUser.publicMetadata?.isAdmin || clerkUser.privateMetadata?.isAdmin || clerkUser.unsafeMetadata?.isAdmin;
    
    const isAdmin = clerkRole === 'admin' || clerkIsAdmin === true;

    // Update user in Supabase
    const { error } = await supabase
      .from('users')
      .upsert({
        clerk_user_id: userId,
        email,
        name,
        phone,
        profile_image_url: clerkUser.imageUrl,
        is_admin: isAdmin,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'clerk_user_id'
      });

    if (error) {
      return Response.json({ error: 'Failed to update user', details: error }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: 'User synced successfully',
      isAdmin,
      source: clerkRole || clerkIsAdmin ? 'Clerk Role' : 'No admin role found'
    });

  } catch (error) {
    console.error('Error syncing user:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}