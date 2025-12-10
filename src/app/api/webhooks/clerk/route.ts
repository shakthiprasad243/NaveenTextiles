import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { createClient } from '@supabase/supabase-js';
import { shouldBeAdmin } from '@/lib/admin-config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local');
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with an ID of ${id} and type of ${eventType}`);
  console.log('Webhook body:', body);

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { email_addresses, first_name, last_name, phone_numbers, image_url, public_metadata, private_metadata, unsafe_metadata } = evt.data;
    
    const email = email_addresses[0]?.email_address;
    const phone = phone_numbers[0]?.phone_number;
    const name = `${first_name || ''} ${last_name || ''}`.trim() || 'User';

    try {
      // Check if user already exists to preserve admin status
      const { data: existingUser } = await supabase
        .from('users')
        .select('is_admin')
        .eq('clerk_user_id', id)
        .single();

      // Determine admin status from multiple sources (priority order):
      // 1. Clerk public metadata role
      // 2. Clerk private metadata role  
      // 3. Clerk unsafe metadata role
      // 4. Email-based admin configuration
      // 5. Preserve existing admin status
      let isAdmin = false;

      // Check Clerk metadata for admin role
      const clerkRole = public_metadata?.role || private_metadata?.role || unsafe_metadata?.role;
      const clerkIsAdmin = public_metadata?.isAdmin || private_metadata?.isAdmin || unsafe_metadata?.isAdmin;
      
      if (clerkRole === 'admin' || clerkIsAdmin === true) {
        isAdmin = true;
        console.log(`Admin role detected in Clerk metadata for user ${email}`);
      } else if (email && shouldBeAdmin(email)) {
        isAdmin = true;
        console.log(`Admin role assigned based on email configuration for ${email}`);
      } else if (existingUser?.is_admin) {
        isAdmin = true;
        console.log(`Preserving existing admin status for user ${email}`);
      }

      // Sync profile data with role-based admin assignment
      const { error } = await supabase
        .from('users')
        .upsert({
          clerk_user_id: id,
          email,
          name,
          phone,
          profile_image_url: image_url,
          is_admin: isAdmin,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'clerk_user_id'
        });

      if (error) {
        console.error('Error syncing user to Supabase:', error);
        return new Response('Error syncing user', { status: 500 });
      }

      console.log(`User profile synced successfully to Supabase (Admin: ${isAdmin}, Source: ${clerkRole || clerkIsAdmin ? 'Clerk Role' : email && shouldBeAdmin(email) ? 'Email Config' : 'Existing Status'})`);
    } catch (error) {
      console.error('Database error:', error);
      return new Response('Database error', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('clerk_user_id', id);

      if (error) {
        console.error('Error deleting user from Supabase:', error);
        return new Response('Error deleting user', { status: 500 });
      }

      console.log('User deleted successfully from Supabase');
    } catch (error) {
      console.error('Database error:', error);
      return new Response('Database error', { status: 500 });
    }
  }

  return new Response('', { status: 200 });
}