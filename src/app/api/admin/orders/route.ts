import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { logger, measureDuration } from '@/lib/logger';
import { checkApiRateLimit, getClientIP } from '@/lib/rate-limit';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Get all orders for admin - uses service role to bypass RLS
export async function GET(request: Request) {
  const startTime = Date.now();
  const clientIP = getClientIP(request);
  
  try {
    // Rate limiting
    const rateLimit = checkApiRateLimit(clientIP);
    if (!rateLimit.allowed) {
      logger.warn('Rate limit exceeded for admin orders', { clientIP });
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Verify admin authentication (optional in dev mode)
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isAdmin) {
      logger.warn('Unauthorized admin orders access', { clientIP, error: authResult.error });
      return NextResponse.json(
        { error: authResult.error || 'Admin access required' },
        { status: 403 }
      );
    }

    logger.info('Admin orders request', { clientIP, adminEmail: authResult.email });

    // Create fresh client with service role key to bypass RLS
    const client = createClient(
      supabaseUrl, 
      supabaseServiceKey || supabaseAnonKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    
    const { data, error } = await client
      .from('orders')
      .select(`*, order_items (*)`)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Supabase error fetching orders', error);
      throw error;
    }

    logger.info('Admin orders fetched', { 
      count: data?.length || 0, 
      duration: measureDuration(startTime) 
    });

    // Return with no-cache headers
    return NextResponse.json(
      { orders: data || [] },
      { 
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'X-RateLimit-Remaining': String(rateLimit.remaining)
        }
      }
    );
  } catch (error: unknown) {
    logger.error('Error fetching admin orders', error, { clientIP });
    const message = error instanceof Error ? error.message : 'Failed to fetch orders';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
