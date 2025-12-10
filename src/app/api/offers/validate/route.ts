import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    if (!subtotal || typeof subtotal !== 'number' || subtotal <= 0) {
      return NextResponse.json(
        { error: 'Valid subtotal is required' },
        { status: 400 }
      );
    }

    const client = createClient(
      supabaseUrl,
      supabaseServiceKey || supabaseAnonKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const now = new Date().toISOString();

    // Find the coupon
    const { data: offer, error } = await client
      .from('offers')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .lte('valid_from', now)
      .single();

    if (error || !offer) {
      return NextResponse.json(
        { error: 'Invalid or expired coupon code' },
        { status: 404 }
      );
    }

    // Check if coupon is still valid (not expired)
    if (offer.valid_till && new Date(offer.valid_till) < new Date()) {
      return NextResponse.json(
        { error: 'This coupon has expired' },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    let finalTotal = subtotal;

    if (offer.discount_type === 'percentage') {
      discountAmount = Math.round((subtotal * offer.discount_value) / 100);
      finalTotal = subtotal - discountAmount;
    } else if (offer.discount_type === 'fixed') {
      discountAmount = Math.min(offer.discount_value, subtotal); // Can't discount more than subtotal
      finalTotal = subtotal - discountAmount;
    }

    // Ensure final total is not negative
    finalTotal = Math.max(0, finalTotal);

    return NextResponse.json({
      valid: true,
      offer: {
        id: offer.id,
        title: offer.title,
        description: offer.description,
        code: offer.code,
        discount_type: offer.discount_type,
        discount_value: offer.discount_value
      },
      discount: {
        amount: discountAmount,
        type: offer.discount_type,
        value: offer.discount_value
      },
      subtotal,
      finalTotal
    });

  } catch (error: any) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}