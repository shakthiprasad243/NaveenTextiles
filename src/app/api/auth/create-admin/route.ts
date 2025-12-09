import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create admin user in Supabase Auth
export async function POST(request: Request) {
  try {
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Create user in Supabase Auth using admin API
    const { data: authData, error: authError } = await client.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: 'Admin',
        phone: '9876543210'
      }
    });

    if (authError) {
      // If user already exists, try to update password
      if (authError.message.includes('already been registered')) {
        // Get user by email
        const { data: { users }, error: listError } = await client.auth.admin.listUsers();
        
        if (listError) {
          return NextResponse.json({ error: listError.message }, { status: 500 });
        }

        const existingUser = users?.find(u => u.email === email);
        if (existingUser) {
          // Update password
          const { error: updateError } = await client.auth.admin.updateUserById(
            existingUser.id,
            { password }
          );

          if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
          }

          return NextResponse.json({
            success: true,
            message: 'Admin user password updated',
            userId: existingUser.id
          });
        }
      }
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // Also ensure user exists in users table with is_admin=true
    const { error: dbError } = await client
      .from('users')
      .upsert({
        name: 'Admin',
        email,
        phone: '9876543210',
        is_admin: true
      }, { onConflict: 'email' });

    if (dbError) {
      console.error('DB error:', dbError);
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created in Supabase Auth',
      userId: authData.user?.id
    });
  } catch (error: unknown) {
    console.error('Create admin error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create admin';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
