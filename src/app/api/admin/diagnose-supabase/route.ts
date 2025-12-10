import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasClerkKey: !!process.env.CLERK_SECRET_KEY,
        hasWebhookSecret: !!process.env.CLERK_WEBHOOK_SECRET
      },
      database: {
        connection: null as any,
        tables: {} as any,
        policies: {} as any,
        users: {} as any
      },
      clerk: {
        connection: null as any,
        currentUser: null as any
      }
    };

    // Test Supabase connection
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      diagnostics.database.connection = {
        status: error ? 'failed' : 'success',
        error: error?.message
      };
    } catch (err) {
      diagnostics.database.connection = {
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    // Check table structure
    try {
      // Check if users table exists and its structure
      const { data: usersTable, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);

      diagnostics.database.tables.users = {
        exists: !usersError,
        error: usersError?.message,
        sampleData: usersTable?.[0] || null
      };

      // Get table schema information
      const { data: tableInfo } = await supabase.rpc('get_table_info', { table_name: 'users' }).single();
      diagnostics.database.tables.usersSchema = tableInfo;

    } catch (err) {
      diagnostics.database.tables.users = {
        exists: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    // Check for admin users
    try {
      const { data: adminUsers, error: adminError } = await supabase
        .from('users')
        .select('id, email, name, is_admin, clerk_user_id, created_at')
        .eq('is_admin', true);

      diagnostics.database.users.admins = {
        count: adminUsers?.length || 0,
        users: adminUsers || [],
        error: adminError?.message
      };

      // Check for the specific admin email
      const { data: specificAdmin } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'admin@naveentextiles.com')
        .single();

      diagnostics.database.users.specificAdmin = specificAdmin;

    } catch (err) {
      diagnostics.database.users.admins = {
        count: 0,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    // Check RLS policies
    try {
      const { data: policies } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'users');

      diagnostics.database.policies.users = policies || [];
    } catch (err) {
      diagnostics.database.policies.users = {
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    // Test Clerk connection
    try {
      const { userId } = await auth();
      
      if (userId) {
        const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const clerkUser = await clerk.users.getUser(userId);
        
        diagnostics.clerk.connection = { status: 'success' };
        diagnostics.clerk.currentUser = {
          id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress,
          publicMetadata: clerkUser.publicMetadata,
          privateMetadata: clerkUser.privateMetadata,
          isAdmin: clerkUser.publicMetadata?.isAdmin === true || clerkUser.publicMetadata?.role === 'admin'
        };
      } else {
        diagnostics.clerk.connection = { status: 'no_user' };
      }
    } catch (err) {
      diagnostics.clerk.connection = {
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    // Check webhook endpoint
    try {
      const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/webhooks/clerk`;
      diagnostics.clerk.webhookUrl = webhookUrl;
    } catch (err) {
      // Ignore webhook URL errors
    }

    return Response.json(diagnostics, { status: 200 });

  } catch (error) {
    console.error('Diagnostic error:', error);
    return Response.json({ 
      error: 'Diagnostic failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// Helper function to get table info (you might need to create this in Supabase)
// CREATE OR REPLACE FUNCTION get_table_info(table_name text)
// RETURNS json AS $$
// BEGIN
//   RETURN (
//     SELECT json_agg(
//       json_build_object(
//         'column_name', column_name,
//         'data_type', data_type,
//         'is_nullable', is_nullable,
//         'column_default', column_default
//       )
//     )
//     FROM information_schema.columns 
//     WHERE table_name = $1 AND table_schema = 'public'
//   );
// END;
// $$ LANGUAGE plpgsql;