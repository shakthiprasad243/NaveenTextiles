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
    // Get current authenticated user
    const { userId } = await auth();
    
    if (!userId) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user details from Clerk
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const clerkUser = await clerk.users.getUser(userId);
    
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';
    const phone = clerkUser.primaryPhoneNumber?.phoneNumber || '';
    
    // Determine admin status from Clerk metadata
    const publicMeta = clerkUser.publicMetadata || {};
    const privateMeta = clerkUser.privateMetadata || {};
    const unsafeMeta = clerkUser.unsafeMetadata || {};
    
    const isAdmin = !!(
      publicMeta.isAdmin === true ||
      publicMeta.role === 'admin' ||
      privateMeta.isAdmin === true ||
      privateMeta.role === 'admin' ||
      unsafeMeta.isAdmin === true ||
      unsafeMeta.role === 'admin'
    );

    const adminSource = isAdmin ? 'clerk_metadata' : 'none';

    console.log('🔄 Manual user sync requested:', {
      clerk_id: userId,
      email,
      is_admin: isAdmin,
      admin_source: adminSource
    });

    // Use the enhanced sync function
    const { data: syncResult, error } = await supabase
      .rpc('sync_user_from_clerk', {
        p_clerk_user_id: userId,
        p_email: email,
        p_name: name,
        p_phone: phone,
        p_profile_image_url: clerkUser.imageUrl || null,
        p_is_admin: isAdmin,
        p_admin_source: adminSource
      });

    if (error) {
      console.error('❌ Sync function error:', error);
      return Response.json({ 
        error: 'Sync function failed', 
        details: error 
      }, { status: 500 });
    }

    console.log('✅ User sync completed:', syncResult);

    return Response.json({
      success: true,
      message: 'User successfully synced',
      sync_result: syncResult,
      clerk_admin_status: isAdmin,
      instructions: isAdmin ? 
        'Admin access granted! Refresh the page to see the admin panel.' :
        'User synced successfully. No admin privileges detected in Clerk metadata.'
    });

  } catch (error) {
    console.error('❌ Error during manual user sync:', error);
    return Response.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// GET endpoint to check sync status
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const clerkUser = await clerk.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    // Get sync status from Supabase
    const { data: syncStatus, error } = await supabase
      .rpc('get_user_sync_status', { user_email: email });

    if (error) {
      return Response.json({ 
        error: 'Failed to get sync status', 
        details: error 
      }, { status: 500 });
    }

    // Check Clerk admin status
    const publicMeta = clerkUser.publicMetadata || {};
    const clerkIsAdmin = !!(publicMeta.isAdmin === true || publicMeta.role === 'admin');

    return Response.json({
      clerk: {
        user_id: userId,
        email: email,
        is_admin: clerkIsAdmin,
        metadata: publicMeta
      },
      supabase: syncStatus,
      cross_verification: {
        both_admin: clerkIsAdmin && syncStatus?.is_admin,
        clerk_admin_only: clerkIsAdmin && !syncStatus?.is_admin,
        supabase_admin_only: !clerkIsAdmin && syncStatus?.is_admin,
        neither_admin: !clerkIsAdmin && !syncStatus?.is_admin,
        recommendation: clerkIsAdmin && syncStatus?.is_admin ? 
          'Admin access should work properly' :
          clerkIsAdmin && !syncStatus?.is_admin ?
          'Run sync to grant admin access' :
          !clerkIsAdmin && syncStatus?.is_admin ?
          'Admin access will be revoked on next sync' :
          'No admin access (correct)'
      }
    });

  } catch (error) {
    console.error('Error checking sync status:', error);
    return Response.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}