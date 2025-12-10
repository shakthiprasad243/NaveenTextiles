import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { email, isAdmin } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Update user admin status
    const { data: user, error: updateError } = await client
      .from('users')
      .update({ is_admin: isAdmin })
      .eq('email', email)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If making admin, also add to admin_users table
    if (isAdmin) {
      const { error: adminError } = await client
        .from('admin_users')
        .upsert({ 
          user_id: user.id,
          role: 'admin',
          created_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (adminError) {
        console.error('Admin users table error:', adminError);
        // Don't fail the request, just log the error
      }
    } else {
      // If removing admin, remove from admin_users table
      await client
        .from('admin_users')
        .delete()
        .eq('user_id', user.id);
    }

    return NextResponse.json({
      success: true,
      message: `User ${isAdmin ? 'granted' : 'removed'} admin access`,
      user: {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin
      }
    });

  } catch (error: unknown) {
    console.error('Set admin error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update admin status';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}