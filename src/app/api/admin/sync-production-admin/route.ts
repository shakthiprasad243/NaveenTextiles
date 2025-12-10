import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email, clerkUserId, isAdmin = true } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // First, check if user exists by email
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      // Update existing user
      const updateData: any = {
        is_admin: isAdmin,
        updated_at: new Date().toISOString()
      };

      // If Clerk user ID is provided, link it
      if (clerkUserId) {
        updateData.clerk_user_id = clerkUserId;
      }

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('email', email)
        .select()
        .single();

      if (error) {
        return Response.json({ 
          error: 'Failed to update user', 
          details: error 
        }, { status: 500 });
      }

      return Response.json({
        success: true,
        message: 'User updated successfully',
        user: data,
        action: 'updated'
      });
    } else {
      // Create new user if doesn't exist
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: email,
          name: email.split('@')[0], // Use email prefix as name
          phone: '',
          clerk_user_id: clerkUserId || null,
          is_admin: isAdmin,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return Response.json({ 
          error: 'Failed to create user', 
          details: error 
        }, { status: 500 });
      }

      return Response.json({
        success: true,
        message: 'User created successfully',
        user: data,
        action: 'created'
      });
    }

  } catch (error) {
    console.error('Error syncing production admin:', error);
    return Response.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// GET endpoint to check current status
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return Response.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    return Response.json({
      email,
      user: user || null,
      exists: !!user,
      isAdmin: user?.is_admin || false,
      hasClerkId: !!user?.clerk_user_id
    });

  } catch (error) {
    console.error('Error checking user status:', error);
    return Response.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}