import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!supabaseServiceKey) {
      return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
    }

    const client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Update current user to admin
    const { data: user, error: updateError } = await client
      .from('users')
      .update({ is_admin: true })
      .eq('clerk_user_id', userId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'You are now an admin!',
      user: {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin
      }
    });

  } catch (error: unknown) {
    console.error('Make admin error:', error);
    const message = error instanceof Error ? error.message : 'Failed to make admin';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}