import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkAuthRateLimit, getClientIP } from '@/lib/rate-limit';
import { logger, measureDuration } from '@/lib/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Login user
export async function POST(request: Request) {
  const startTime = Date.now();
  const clientIP = getClientIP(request);
  
  try {
    // Check rate limit
    const rateLimit = checkAuthRateLimit(clientIP);
    if (!rateLimit.allowed) {
      logger.warn('Rate limit exceeded for login', { clientIP });
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
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
    const { email, password } = body;

    logger.info('Login attempt', { email, clientIP });

    if (!email || !password) {
      logger.warn('Login missing credentials', { email: !!email, password: !!password });
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Sign in with Supabase Auth
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      logger.warn('Login failed', { email, error: error.message });
      
      // Provide user-friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        return NextResponse.json({ 
          error: 'Invalid email or password. Please check your credentials.' 
        }, { status: 401 });
      }
      if (error.message.includes('Email not confirmed')) {
        return NextResponse.json({ 
          error: 'Please verify your email before signing in.' 
        }, { status: 401 });
      }
      
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!data.user) {
      return NextResponse.json({ error: 'Login failed' }, { status: 401 });
    }

    logger.info('Login successful', { email, userId: data.user.id, duration: measureDuration(startTime) });

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name
      },
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token
      }
    });
  } catch (error: unknown) {
    logger.error('Login error', error, { clientIP });
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
