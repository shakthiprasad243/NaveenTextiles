-- Enhanced User Sync Schema Migration
-- Run this in Supabase SQL Editor to add sync tracking fields

-- Add new columns to users table if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS clerk_user_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS admin_source TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing records to have updated_at
UPDATE users 
SET updated_at = COALESCE(updated_at, created_at, NOW())
WHERE updated_at IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email_admin ON users(email, is_admin);
CREATE INDEX IF NOT EXISTS idx_users_last_synced ON users(last_synced_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enhanced function to get user sync status
CREATE OR REPLACE FUNCTION get_user_sync_status(user_email text)
RETURNS json AS $$
DECLARE
    user_record users%ROWTYPE;
    result json;
BEGIN
    SELECT * INTO user_record FROM users WHERE email = user_email;
    
    IF FOUND THEN
        result := json_build_object(
            'exists', true,
            'user_id', user_record.id,
            'clerk_user_id', user_record.clerk_user_id,
            'is_admin', user_record.is_admin,
            'admin_source', user_record.admin_source,
            'last_synced_at', user_record.last_synced_at,
            'has_clerk_link', user_record.clerk_user_id IS NOT NULL,
            'sync_status', CASE 
                WHEN user_record.clerk_user_id IS NULL THEN 'not_linked'
                WHEN user_record.last_synced_at IS NULL THEN 'never_synced'
                WHEN user_record.last_synced_at < NOW() - INTERVAL '1 day' THEN 'stale'
                ELSE 'current'
            END
        );
    ELSE
        result := json_build_object(
            'exists', false,
            'sync_status', 'not_found'
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Enhanced function to sync user from Clerk
CREATE OR REPLACE FUNCTION sync_user_from_clerk(
    p_clerk_user_id text,
    p_email text,
    p_name text DEFAULT NULL,
    p_phone text DEFAULT NULL,
    p_profile_image_url text DEFAULT NULL,
    p_is_admin boolean DEFAULT false,
    p_admin_source text DEFAULT 'clerk_metadata'
)
RETURNS json AS $$
DECLARE
    user_record users%ROWTYPE;
    result json;
    action_taken text;
BEGIN
    -- Try to find existing user by Clerk ID first
    SELECT * INTO user_record FROM users WHERE clerk_user_id = p_clerk_user_id;
    
    IF FOUND THEN
        -- Update existing user by Clerk ID
        UPDATE users SET
            email = COALESCE(p_email, email),
            name = COALESCE(p_name, name),
            phone = COALESCE(p_phone, phone),
            profile_image_url = COALESCE(p_profile_image_url, profile_image_url),
            is_admin = p_is_admin,
            admin_source = p_admin_source,
            last_synced_at = NOW(),
            updated_at = NOW()
        WHERE clerk_user_id = p_clerk_user_id
        RETURNING * INTO user_record;
        
        action_taken := 'updated_by_clerk_id';
    ELSE
        -- Try to find by email and link
        SELECT * INTO user_record FROM users WHERE email = p_email AND clerk_user_id IS NULL;
        
        IF FOUND THEN
            -- Link existing user
            UPDATE users SET
                clerk_user_id = p_clerk_user_id,
                name = COALESCE(p_name, name),
                phone = COALESCE(p_phone, phone),
                profile_image_url = COALESCE(p_profile_image_url, profile_image_url),
                is_admin = GREATEST(is_admin::int, p_is_admin::int)::boolean, -- Preserve existing admin if true
                admin_source = CASE 
                    WHEN is_admin THEN COALESCE(admin_source, 'existing_database')
                    ELSE p_admin_source 
                END,
                last_synced_at = NOW(),
                updated_at = NOW()
            WHERE email = p_email AND clerk_user_id IS NULL
            RETURNING * INTO user_record;
            
            action_taken := 'linked_existing_user';
        ELSE
            -- Create new user
            INSERT INTO users (
                clerk_user_id, email, name, phone, profile_image_url,
                is_admin, admin_source, last_synced_at, created_at, updated_at
            ) VALUES (
                p_clerk_user_id, p_email, COALESCE(p_name, 'User'), p_phone, p_profile_image_url,
                p_is_admin, p_admin_source, NOW(), NOW(), NOW()
            ) RETURNING * INTO user_record;
            
            action_taken := 'created_new_user';
        END IF;
    END IF;
    
    result := json_build_object(
        'success', true,
        'action', action_taken,
        'user', row_to_json(user_record),
        'is_admin', user_record.is_admin,
        'admin_source', user_record.admin_source
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        result := json_build_object(
            'success', false,
            'error', SQLERRM,
            'action', 'error'
        );
        RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_sync_status(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION sync_user_from_clerk(text, text, text, text, text, boolean, text) TO authenticated, anon;

-- Add helpful comments
COMMENT ON COLUMN users.clerk_user_id IS 'Unique Clerk user identifier for linking';
COMMENT ON COLUMN users.admin_source IS 'Source of admin privileges: clerk_metadata, email_config, existing_database, none';
COMMENT ON COLUMN users.last_synced_at IS 'Last time user data was synced from Clerk';
COMMENT ON FUNCTION get_user_sync_status(text) IS 'Get comprehensive sync status for a user by email';
COMMENT ON FUNCTION sync_user_from_clerk(text, text, text, text, text, boolean, text) IS 'Sync user data from Clerk with smart linking and admin preservation';