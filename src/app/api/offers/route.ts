import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Get active offers
export async function GET() {
  try {
    const client = createClient(
      supabaseUrl,
      supabaseServiceKey || supabaseAnonKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const now = new Date().toISOString();
    
    const { data, error } = await client
      .from('offers')
      .select('*')
      .eq('active', true)
      .lte('valid_from', now)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching offers:', error);
      return NextResponse.json({ offers: [] });
    }

    // Filter valid_till in JS
    const validOffers = (data || []).filter(offer =>
      !offer.valid_till || new Date(offer.valid_till) >= new Date()
    );

    return NextResponse.json({ offers: validOffers });
  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json({ offers: [] });
  }
}
