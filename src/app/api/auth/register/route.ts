import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkAuthRateLimit, getClientIP } from '@/lib/rate-limit';
import { logger, measureDuration } from '@/lib/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Register new user with auto-confirmation
export async function POST(request: Request) {
  const startTime = Date.now();
  const clientIP = getClientIP(request);
  
  try {
    // Check rate limit (stricter for registration)
    const rateLimit = checkAuthRateLimit(clientIP);
    if (!rateLimit.allowed) {
      logger.warn('Rate limit exceeded for registration', { clientIP });
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)),
            'X-RateLimit-Remaining': '0'
          }
        }
      );
    }

    const body = await request.json();
    const { name, email, phone, password } = body;

    logger.info('Registration attempt', { email, clientIP });

    if (!email || !password) {
      logger.warn('Registration missing credentials');
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    if (!supabaseServiceKey) {
      logger.error('Service role key not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Create user in Supabase Auth with auto-confirmation
    const { data: authData, error: authError } = await client.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: name || email.split('@')[0],
        phone: phone || ''
      }
    });

    if (authError) {
      // Check if user already exists
      if (authError.message.includes('already been registered')) {
        logger.warn('Registration failed - email exists', { email });
        return NextResponse.json({ 
          error: 'An account with this email already exists. Please sign in instead.' 
        }, { status: 400 });
      }
      logger.error('Auth error during registration', authError, { email });
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // Create user profile in users table
    const { data: dbUser, error: dbError } = await client
      .from('users')
      .insert({
        name: name || email.split('@')[0],
        email,
        phone: phone || '',
        is_admin: false
      })
      .select()
      .single();

    if (dbError && !dbError.message.includes('duplicate')) {
      logger.warn('DB profile creation error', { email, error: dbError.message });
      // Don't fail - user is created in auth, profile will be created on first login
    }

    logger.info('Registration successful', { 
      email, 
      userId: dbUser?.id || authData.user?.id,
      duration: measureDuration(startTime)
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: dbUser?.id || authData.user?.id,
        email: authData.user?.email,
        name: name || email.split('@')[0]
      }
    });
  } catch (error: unknown) {
    logger.error('Registration error', error, { clientIP });
    const message = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
