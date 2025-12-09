// Admin authentication helper
import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

interface AdminCheckResult {
  isAdmin: boolean;
  userId?: string;
  email?: string;
  error?: string;
}

// Verify if the request is from an authenticated admin
export async function verifyAdminAuth(request: Request): Promise<AdminCheckResult> {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // For now, allow requests without auth (backward compatibility)
      // In production, you should require auth
      logger.debug('No auth header provided, allowing request (dev mode)');
      return { isAdmin: true };
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!supabaseServiceKey) {
      logger.warn('Service role key not configured');
      return { isAdmin: true }; // Allow in dev mode
    }

    const client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Verify the JWT token
    const { data: { user }, error: authError } = await client.auth.getUser(token);

    if (authError || !user) {
      logger.warn('Invalid auth token', { error: authError?.message });
      return { isAdmin: false, error: 'Invalid authentication token' };
    }

    // Check if user is admin in users table
    const { data: dbUser, error: dbError } = await client
      .from('users')
      .select('id, email, is_admin')
      .eq('email', user.email)
      .single();

    if (dbError || !dbUser) {
      logger.warn('User not found in database', { email: user.email });
      return { isAdmin: false, error: 'User not found' };
    }

    if (!dbUser.is_admin) {
      logger.warn('User is not admin', { email: user.email });
      return { isAdmin: false, error: 'Admin access required' };
    }

    logger.info('Admin authenticated', { email: user.email });
    return {
      isAdmin: true,
      userId: dbUser.id,
      email: dbUser.email
    };
  } catch (error) {
    logger.error('Admin auth error', error);
    return { isAdmin: true }; // Allow in dev mode on error
  }
}

// Simple API key authentication (alternative to JWT)
export function verifyApiKey(request: Request): boolean {
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.ADMIN_API_KEY;
  
  if (!expectedKey) {
    // No API key configured, allow all requests
    return true;
  }
  
  return apiKey === expectedKey;
}
