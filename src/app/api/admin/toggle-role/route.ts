import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    // Check if user is authenticated and is admin
    const { userId } = await auth();
    console.log('Toggle Role API - Clerk User ID:', userId);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Check if current user is admin
    const { data: currentUser, error: currentUserError } = await client
      .from('users')
      .select('is_admin, email, name')
      .eq('clerk_user_id', userId)
      .single();

    console.log('Toggle Role API - Current user lookup:', { currentUser, currentUserError });

    if (currentUserError || !currentUser) {
      return NextResponse.json({ 
        error: 'Current user not found in database',
        details: currentUserError?.message 
      }, { status: 403 });
    }

    if (!currentUser?.is_admin) {
      return NextResponse.json({ 
        error: 'Admin access required',
        currentUser: currentUser.email 
      }, { status: 403 });
    }

    const body = await request.json();
    const { targetUserId, makeAdmin } = body;

    if (typeof makeAdmin !== 'boolean') {
      return NextResponse.json({ error: 'makeAdmin must be a boolean' }, { status: 400 });
    }

    // Get target user info
    console.log('Toggle Role API - Looking for target user ID:', targetUserId);
    
    const { data: targetUser, error: userError } = await client
      .from('users')
      .select('*')
      .eq('id', targetUserId)
      .single();

    console.log('Toggle Role API - Target user lookup:', { targetUser, userError });

    if (userError || !targetUser) {
      return NextResponse.json({ 
        error: 'User not found',
        targetUserId,
        details: userError?.message 
      }, { status: 404 });
    }

    // Update user's admin status in Supabase
    const { error: updateError } = await client
      .from('users')
      .update({ 
        is_admin: makeAdmin,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetUserId);

    if (updateError) {
      console.error('Error updating user admin status:', updateError);
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
    }

    // Update admin_users table
    if (makeAdmin) {
      // Add to admin_users table
      await client
        .from('admin_users')
        .upsert({
          user_id: targetUserId,
          role: 'admin',
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
    } else {
      // Remove from admin_users table
      await client
        .from('admin_users')
        .delete()
        .eq('user_id', targetUserId);
    }

    console.log(`Admin role ${makeAdmin ? 'granted to' : 'removed from'} user: ${targetUser.email}`);

    return NextResponse.json({
      success: true,
      message: `User ${makeAdmin ? 'granted' : 'removed'} admin access successfully`,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        isAdmin: makeAdmin
      }
    });

  } catch (error: unknown) {
    console.error('Toggle role error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update user role';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}