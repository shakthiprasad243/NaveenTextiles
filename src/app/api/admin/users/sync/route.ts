import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const clerkSecretKey = process.env.CLERK_SECRET_KEY || '';

export async function POST() {
  try {
    // Check if user is authenticated and is admin
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Check if current user is admin
    const { data: currentUser } = await client
      .from('users')
      .select('is_admin')
      .eq('clerk_user_id', userId)
      .single();

    if (!currentUser?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!clerkSecretKey) {
      return NextResponse.json({ error: 'Clerk configuration missing' }, { status: 500 });
    }

    // Fetch all users from Clerk
    const clerkResponse = await fetch('https://api.clerk.com/v1/users?limit=100', {
      headers: {
        'Authorization': `Bearer ${clerkSecretKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!clerkResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch users from Clerk' }, { status: 500 });
    }

    const clerkUsers = await clerkResponse.json();
    let syncedCount = 0;
    let errorCount = 0;

    // Sync each user to Supabase
    for (const clerkUser of clerkUsers) {
      try {
        const email = clerkUser.email_addresses[0]?.email_address;
        const phone = clerkUser.phone_numbers[0]?.phone_number;
        const name = `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim() || 'User';

        // Check if user already exists to preserve admin status
        const { data: existingUser } = await client
          .from('users')
          .select('is_admin')
          .eq('clerk_user_id', clerkUser.id)
          .single();

        // Sync user data (preserve existing admin status)
        const { error } = await client
          .from('users')
          .upsert({
            clerk_user_id: clerkUser.id,
            email,
            name,
            phone,
            profile_image_url: clerkUser.image_url,
            // Preserve existing admin status or default to false for new users
            is_admin: existingUser?.is_admin || false,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'clerk_user_id'
          });

        if (error) {
          console.error(`Error syncing user ${email}:`, error);
          errorCount++;
        } else {
          syncedCount++;
        }
      } catch (error) {
        console.error(`Error processing user ${clerkUser.id}:`, error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${syncedCount} users successfully`,
      syncedCount,
      errorCount,
      totalProcessed: clerkUsers.length
    });

  } catch (error: unknown) {
    console.error('User sync error:', error);
    const message = error instanceof Error ? error.message : 'Failed to sync users';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}