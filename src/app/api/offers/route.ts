import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Get active offers
export async function GET(): Promise<NextResponse> {
  try {
    // Add timeout handling
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout after 25 seconds')), 25000)
    );
    
    const fetchOffersPromise = async (): Promise<NextResponse> => {
      const client = createClient(
        supabaseUrl,
        supabaseServiceKey || supabaseAnonKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );

      const now = new Date().toISOString();
      
      // Optimized query with specific field selection
      const { data, error } = await client
        .from('offers')
        .select('id, title, description, code, discount_type, discount_value, active, valid_from, valid_till, created_at')
        .eq('active', true)
        .lte('valid_from', now)
        .order('created_at', { ascending: false })
        .limit(10); // Increased limit but still reasonable

      if (error) {
        console.error('Error fetching offers:', error);
        return NextResponse.json({ offers: [] });
      }

      // Filter valid_till in JS (more efficient than complex SQL)
      const validOffers = (data || []).filter(offer =>
        !offer.valid_till || new Date(offer.valid_till) >= new Date()
      );

      return NextResponse.json({ offers: validOffers });
    };

    // Race between the operation and timeout
    return await Promise.race([fetchOffersPromise(), timeoutPromise]);
  } catch (error: any) {
    console.error('Error fetching offers:', error);
    
    // Return appropriate error response
    if (error.message?.includes('timeout')) {
      return NextResponse.json(
        { error: 'Request timeout', offers: [] }, 
        { status: 408 }
      );
    }
    
    return NextResponse.json({ offers: [] });
  }
}
