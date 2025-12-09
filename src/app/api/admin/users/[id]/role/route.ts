import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isAdminClientConfigured } from '@/lib/supabase-admin';
import { supabase } from '@/lib/supabase';

// Toggle user admin role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const body = await request.json();
    const { makeAdmin } = body;

    if (typeof makeAdmin !== 'boolean') {
      return NextResponse.json(
        { error: 'makeAdmin must be a boolean' },
        { status: 400 }
      );
    }

    // Use admin client if available for bypassing RLS
    const client = isAdminClientConfigured() ? supabaseAdmin : supabase;

    if (makeAdmin) {
      // Make user an admin
      // First check if already in admin_users
      const { data: existingAdmin } = await client
        .from('admin_users')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!existingAdmin) {
        // Insert into admin_users table
        const { error: insertError } = await client
          .from('admin_users')
          .insert({ user_id: userId, role: 'admin' });

        if (insertError) {
          console.error('Error inserting admin_users:', insertError);
          // Continue anyway, we'll update the users table
        }
      }

      // Update is_admin flag in users table
      const { error: updateError } = await client
        .from('users')
        .update({ is_admin: true })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }
    } else {
      // Remove admin access
      // Delete from admin_users table
      const { error: deleteError } = await client
        .from('admin_users')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Error deleting from admin_users:', deleteError);
        // Continue anyway, we'll update the users table
      }

      // Update is_admin flag in users table
      const { error: updateError } = await client
        .from('users')
        .update({ is_admin: false })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }
    }

    // Fetch updated user
    const { data: updatedUser, error: fetchError } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      isAdmin: makeAdmin,
      message: makeAdmin ? 'User is now an admin' : 'Admin access removed'
    });
  } catch (error: any) {
    console.error('Error toggling admin role:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user role' },
      { status: 500 }
    );
  }
}
