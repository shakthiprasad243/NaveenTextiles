import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin, isAdminClientConfigured } from '@/lib/supabase-admin';

// CRON job to release expired inventory reservations
// Set up in Vercel: cron expression "*/15 * * * *" (every 15 minutes)
// Or call manually: POST /api/cron/cleanup-reservations

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (optional security - only enforced if CRON_SECRET is set)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && cronSecret.length > 0 && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[CRON] Starting inventory cleanup...');

    // Use admin client if available for better access
    const client = isAdminClientConfigured() ? supabaseAdmin : supabase;

    // 1. Find expired reservations
    const { data: expiredReservations, error: fetchError } = await client
      .from('inventory_reservations')
      .select('id, product_variant_id, qty, order_id')
      .lt('reserved_until', new Date().toISOString());

    if (fetchError) {
      throw fetchError;
    }

    let releasedCount = 0;
    let cancelledOrders = 0;

    if (expiredReservations && expiredReservations.length > 0) {
      // 2. Return stock to variants
      for (const reservation of expiredReservations) {
        // Update variant stock
        const { data: variant } = await client
          .from('product_variants')
          .select('stock_qty, reserved_qty')
          .eq('id', reservation.product_variant_id)
          .single();

        if (variant) {
          await client
            .from('product_variants')
            .update({
              stock_qty: variant.stock_qty + reservation.qty,
              reserved_qty: Math.max(0, variant.reserved_qty - reservation.qty)
            })
            .eq('id', reservation.product_variant_id);
        }

        releasedCount++;
      }

      // 3. Delete expired reservations
      await client
        .from('inventory_reservations')
        .delete()
        .lt('reserved_until', new Date().toISOString());
    }

    // 4. Cancel orders that have expired reservations
    const { data: expiredOrders } = await client
      .from('orders')
      .select('id, order_number')
      .eq('status', 'PENDING')
      .lt('reserved_until', new Date().toISOString());

    if (expiredOrders && expiredOrders.length > 0) {
      for (const order of expiredOrders) {
        await client
          .from('orders')
          .update({ status: 'CANCELLED' })
          .eq('id', order.id);

        cancelledOrders++;
        console.log(`[CRON] Cancelled expired order: ${order.order_number}`);
      }
    }

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      reservations_released: releasedCount,
      orders_cancelled: cancelledOrders
    };

    console.log('[CRON] Cleanup complete:', result);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[CRON] Cleanup error:', error);
    return NextResponse.json(
      { error: error.message || 'Cleanup failed' },
      { status: 500 }
    );
  }
}

// Also allow GET for easy testing
export async function GET(request: NextRequest) {
  return POST(request);
}
