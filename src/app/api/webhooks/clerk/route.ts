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

    console.log(`Processing ${eventType} for user: ${email} (ID: ${id})`);

    try {
      // Check if user already exists by Clerk ID
      const { data: existingUserByClerkId } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_user_id', id)
        .single();

      // Check if user exists by email (for linking existing accounts)
      const { data: existingUserByEmail } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      // Determine admin status from multiple sources (priority order):
      // 1. Clerk public metadata (isAdmin or role)
      // 2. Clerk private metadata (isAdmin or role)
      // 3. Clerk unsafe metadata (isAdmin or role)
      // 4. Email-based admin configuration
      // 5. Preserve existing admin status from database
      let isAdmin = false;
      let adminSource = 'none';

      // Check Clerk metadata for admin role
      const clerkRole = public_metadata?.role || private_metadata?.role || unsafe_metadata?.role;
      const clerkIsAdmin = public_metadata?.isAdmin || private_metadata?.isAdmin || unsafe_metadata?.isAdmin;
      
      if (clerkRole === 'admin' || clerkIsAdmin === true) {
        isAdmin = true;
        adminSource = 'clerk_metadata';
        console.log(`✅ Admin role detected in Clerk metadata for user ${email}`);
      } else if (email && shouldBeAdmin(email)) {
        isAdmin = true;
        adminSource = 'email_config';
        console.log(`✅ Admin role assigned based on email configuration for ${email}`);
      } else if (existingUserByClerkId?.is_admin || existingUserByEmail?.is_admin) {
        isAdmin = true;
        adminSource = 'existing_database';
        console.log(`✅ Preserving existing admin status for user ${email}`);
      }

      // Prepare user data
      const userData = {
        clerk_user_id: id,
        email,
        name,
        phone: phone || '',
        profile_image_url: image_url || null,
        is_admin: isAdmin,
        admin_source: adminSource,
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      let result;
      let action;

      if (existingUserByClerkId) {
        // Update existing user by Clerk ID
        const { data, error } = await supabase
          .from('users')
          .update(userData)
          .eq('clerk_user_id', id)
          .select()
          .single();

        if (error) throw error;
        result = data;
        action = 'updated_by_clerk_id';
      } else if (existingUserByEmail && !existingUserByEmail.clerk_user_id) {
        // Link existing user by email (add Clerk ID)
        const { data, error } = await supabase
          .from('users')
          .update({
            ...userData,
            created_at: existingUserByEmail.created_at // Preserve original creation date
          })
          .eq('email', email)
          .select()
          .single();

        if (error) throw error;
        result = data;
        action = 'linked_existing_user';
        console.log(`🔗 Linked existing user ${email} with Clerk ID ${id}`);
      } else {
        // Create new user
        const { data, error } = await supabase
          .from('users')
          .insert({
            ...userData,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
        action = 'created_new_user';
        console.log(`🆕 Created new user ${email} with Clerk ID ${id}`);
      }

      console.log(`✅ User sync successful:`, {
        action,
        email,
        clerk_id: id,
        is_admin: isAdmin,
        admin_source: adminSource,
        user_id: result.id
      });

      // Log admin status changes for audit
      if (isAdmin) {
        console.log(`🛡️  ADMIN ACCESS GRANTED: ${email} (Source: ${adminSource})`);
      }

    } catch (error) {
      console.error('❌ Database error during user sync:', error);
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