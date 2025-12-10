-- Diagnostic functions for Supabase
-- Run this in your Supabase SQL Editor to enable better diagnostics

-- Function to get table information
CREATE OR REPLACE FUNCTION get_table_info(table_name text)
RETURNS json AS $$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'column_name', column_name,
        'data_type', data_type,
        'is_nullable', is_nullable,
        'column_default', column_default
      )
    )
    FROM information_schema.columns 
    WHERE table_name = $1 AND table_schema = 'public'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check RLS policies
CREATE OR REPLACE FUNCTION get_table_policies(table_name text)
RETURNS json AS $$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'policyname', policyname,
        'permissive', permissive,
        'roles', roles,
        'cmd', cmd,
        'qual', qual,
        'with_check', with_check
      )
    )
    FROM pg_policies 
    WHERE tablename = $1
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get admin users with their Clerk linking status
CREATE OR REPLACE FUNCTION get_admin_users_status()
RETURNS json AS $$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'id', id,
        'name', name,
        'email', email,
        'is_admin', is_admin,
        'clerk_user_id', clerk_user_id,
        'clerk_linked', clerk_user_id IS NOT NULL,
        'created_at', created_at,
        'updated_at', updated_at
      )
    )
    FROM users 
    WHERE is_admin = true
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check if required tables exist
CREATE OR REPLACE FUNCTION check_required_tables()
RETURNS json AS $$
BEGIN
  RETURN (
    SELECT json_object_agg(
      table_name,
      EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = t.table_name
      )
    )
    FROM (VALUES 
      ('users'),
      ('products'),
      ('product_variants'),
      ('orders'),
      ('order_items'),
      ('addresses')
    ) AS t(table_name)
  );
END;
$$ LANGUAGE plpgsql;

-- Function to ensure admin user exists and is properly configured
CREATE OR REPLACE FUNCTION ensure_admin_user(
  admin_email text DEFAULT 'admin@naveentextiles.com',
  admin_name text DEFAULT 'Admin User',
  admin_phone text DEFAULT '9876543210'
)
RETURNS json AS $$
DECLARE
  user_record users%ROWTYPE;
  result json;
BEGIN
  -- Try to find existing user
  SELECT * INTO user_record FROM users WHERE email = admin_email;
  
  IF FOUND THEN
    -- Update existing user to ensure admin status
    UPDATE users 
    SET is_admin = true, 
        name = COALESCE(name, admin_name),
        phone = COALESCE(phone, admin_phone),
        updated_at = NOW()
    WHERE email = admin_email
    RETURNING * INTO user_record;
    
    result := json_build_object(
      'action', 'updated',
      'user', row_to_json(user_record),
      'message', 'Existing user updated to admin'
    );
  ELSE
    -- Create new admin user
    INSERT INTO users (name, email, phone, is_admin, created_at, updated_at)
    VALUES (admin_name, admin_email, admin_phone, true, NOW(), NOW())
    RETURNING * INTO user_record;
    
    result := json_build_object(
      'action', 'created',
      'user', row_to_json(user_record),
      'message', 'New admin user created'
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to link a user with Clerk ID
CREATE OR REPLACE FUNCTION link_user_with_clerk(
  user_email text,
  clerk_id text
)
RETURNS json AS $$
DECLARE
  user_record users%ROWTYPE;
  result json;
BEGIN
  -- Update user with Clerk ID
  UPDATE users 
  SET clerk_user_id = clerk_id,
      updated_at = NOW()
  WHERE email = user_email
  RETURNING * INTO user_record;
  
  IF FOUND THEN
    result := json_build_object(
      'success', true,
      'user', row_to_json(user_record),
      'message', 'User successfully linked with Clerk ID'
    );
  ELSE
    result := json_build_object(
      'success', false,
      'message', 'User not found with email: ' || user_email
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_table_info(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_policies(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_users_status() TO authenticated;
GRANT EXECUTE ON FUNCTION check_required_tables() TO authenticated;
GRANT EXECUTE ON FUNCTION ensure_admin_user(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION link_user_with_clerk(text, text) TO authenticated;

-- Also grant to anon for diagnostic purposes (you can remove this later)
GRANT EXECUTE ON FUNCTION get_table_info(text) TO anon;
GRANT EXECUTE ON FUNCTION get_table_policies(text) TO anon;
GRANT EXECUTE ON FUNCTION get_admin_users_status() TO anon;
GRANT EXECUTE ON FUNCTION check_required_tables() TO anon;