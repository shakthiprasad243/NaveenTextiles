import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// This endpoint sets up the database by ensuring tables exist and creating test data
export async function POST() {
  try {
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
    }

    const client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const results: string[] = [];

    // 1. Check if users table exists and create admin user
    const { data: existingAdmin, error: adminCheckError } = await client
      .from('users')
      .select('*')
      .eq('email', 'admin@naveentextiles.com')
      .single();

    if (adminCheckError && adminCheckError.code === 'PGRST116') {
      // User doesn't exist, create it
      const { error: createAdminError } = await client
        .from('users')
        .insert({
          name: 'Admin',
          email: 'admin@naveentextiles.com',
          phone: '9876543210',
          is_admin: true
        });

      if (createAdminError) {
        results.push(`Admin user creation: ${createAdminError.message}`);
      } else {
        results.push('Admin user created successfully');
      }
    } else if (existingAdmin) {
      // Update to ensure is_admin is true
      const { error: updateError } = await client
        .from('users')
        .update({ is_admin: true })
        .eq('email', 'admin@naveentextiles.com');

      if (updateError) {
        results.push(`Admin update: ${updateError.message}`);
      } else {
        results.push('Admin user updated with is_admin=true');
      }
    }

    // 2. Check if admin_users table exists and add admin
    if (existingAdmin) {
      const { error: adminUsersError } = await client
        .from('admin_users')
        .upsert({ user_id: existingAdmin.id }, { onConflict: 'user_id' });

      if (adminUsersError) {
        results.push(`Admin users table: ${adminUsersError.message}`);
      } else {
        results.push('Admin added to admin_users table');
      }
    }

    // 3. Test orders access
    const { data: ordersData, error: ordersError } = await client
      .from('orders')
      .select('id, order_number, status')
      .limit(5);

    if (ordersError) {
      results.push(`Orders access: ${ordersError.message}`);
    } else {
      results.push(`Orders access OK - found ${ordersData?.length || 0} orders`);
    }

    // 4. Test products access
    const { data: productsData, error: productsError } = await client
      .from('products')
      .select('id, name')
      .limit(5);

    if (productsError) {
      results.push(`Products access: ${productsError.message}`);
    } else {
      results.push(`Products access OK - found ${productsData?.length || 0} products`);
    }

    // 5. Test offers access
    const { data: offersData, error: offersError } = await client
      .from('offers')
      .select('id, title')
      .limit(5);

    if (offersError) {
      results.push(`Offers access: ${offersError.message}`);
    } else {
      results.push(`Offers access OK - found ${offersData?.length || 0} offers`);
    }

    return NextResponse.json({
      success: true,
      message: 'Database setup completed',
      results
    });
  } catch (error: unknown) {
    console.error('Setup error:', error);
    const message = error instanceof Error ? error.message : 'Setup failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET endpoint to check database status
export async function GET() {
  try {
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
    }

    const client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const status: Record<string, unknown> = {};

    // Check users
    const { count: usersCount } = await client.from('users').select('*', { count: 'exact', head: true });
    status.users = usersCount || 0;

    // Check admin users
    const { count: adminCount } = await client.from('admin_users').select('*', { count: 'exact', head: true });
    status.adminUsers = adminCount || 0;

    // Check orders
    const { count: ordersCount } = await client.from('orders').select('*', { count: 'exact', head: true });
    status.orders = ordersCount || 0;

    // Check products
    const { count: productsCount } = await client.from('products').select('*', { count: 'exact', head: true });
    status.products = productsCount || 0;

    // Check offers
    const { count: offersCount } = await client.from('offers').select('*', { count: 'exact', head: true });
    status.offers = offersCount || 0;

    // Check if admin exists
    const { data: adminUser } = await client
      .from('users')
      .select('*')
      .eq('email', 'admin@naveentextiles.com')
      .single();

    status.adminUserExists = !!adminUser;
    status.adminIsAdmin = adminUser?.is_admin || false;

    return NextResponse.json({ status });
  } catch (error: unknown) {
    console.error('Status check error:', error);
    const message = error instanceof Error ? error.message : 'Status check failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
