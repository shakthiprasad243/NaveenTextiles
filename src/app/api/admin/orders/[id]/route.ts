import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json();
    const { id: orderId } = await params;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status required' }, { status: 400 });
    }

    const client = createClient(
      supabaseUrl,
      supabaseServiceKey || supabaseAnonKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data, error } = await client
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating order:', error);
      throw error;
    }

    return NextResponse.json({ order: data });
  } catch (error: unknown) {
    console.error('Error updating order status:', error);
    const message = error instanceof Error ? error.message : 'Failed to update order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
