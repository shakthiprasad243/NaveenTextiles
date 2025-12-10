import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { shouldBeAdmin } from '@/lib/admin-config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Check if this email should be admin
    const isAdmin = shouldBeAdmin(email);

    if (!isAdmin) {
      return NextResponse.json({ 
        error: 'Email not in admin list',
        message: 'This email is not configured as an admin email'
      }, { status: 403 });
    }

    // Update user admin status
    const { data: user, error: updateError } = await client
      .from('users')
      .update({ is_admin: true })
      .eq('email', email)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin access granted successfully',
      user: {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin
      }
    });

  } catch (error: unknown) {
    console.error('Setup admin error:', error);
    const message = error instanceof Error ? error.message : 'Failed to setup admin';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}