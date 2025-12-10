import { NextRequest } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const { userId } = await auth();
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Check if current user is admin in Supabase
    const { data: currentUser } = await supabase
      .from('users')
      .select('is_admin')
      .eq('clerk_user_id', userId)
      .single();

    if (!currentUser?.is_admin) {
      return new Response('Forbidden - Admin access required', { status: 403 });
    }

    // Get all users from Clerk
    const clerkUsers = await clerkClient.users.getUserList();
    
    let syncedCount = 0;
    let errors: string[] = [];

    for (const clerkUser of clerkUsers.data) {
      try {
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        const phone = clerkUser.phoneNumbers[0]?.phoneNumber;
        const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';

        // Check for admin role in Clerk metadata
        const clerkRole = clerkUser.publicMetadata?.role || clerkUser.privateMetadata?.role || clerkUser.unsafeMetadata?.role;
        const clerkIsAdmin = clerkUser.publicMetadata?.isAdmin || clerkUser.privateMetadata?.isAdmin || clerkUser.unsafeMetadata?.isAdmin;
        
        const isAdmin = clerkRole === 'admin' || clerkIsAdmin === true;

        // Update user in Supabase
        const { error } = await supabase
          .from('users')
          .upsert({
            clerk_user_id: clerkUser.id,
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
          errors.push(`Error syncing user ${email}: ${error.message}`);
        } else {
          syncedCount++;
          console.log(`Synced user ${email} (Admin: ${isAdmin})`);
        }
      } catch (userError) {
        errors.push(`Error processing user ${clerkUser.id}: ${userError}`);
      }
    }

    return Response.json({
      success: true,
      message: `Successfully synced ${syncedCount} users`,
      syncedCount,
      totalUsers: clerkUsers.data.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error syncing roles:', error);
    return new Response('Internal server error', { status: 500 });
  }
}