import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus, supabase } from '@/lib/supabase';

// Update order status (for admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    const orderId = params.id;

    const validStatuses = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const order = await updateOrderStatus(orderId, status);

    // If order is confirmed, release the reservation timer
    if (status === 'CONFIRMED') {
      await supabase
        .from('orders')
        .update({ reserved_until: null })
        .eq('id', orderId);
    }

    // If order is cancelled, release inventory
    if (status === 'CANCELLED') {
      // Get order items
      const { data: items } = await supabase
        .from('order_items')
        .select('product_variant_id, qty')
        .eq('order_id', orderId);

      // Return stock using direct update (no RPC)
      if (items) {
        for (const item of items) {
          const { data: variant } = await supabase
            .from('product_variants')
            .select('stock_qty, reserved_qty')
            .eq('id', item.product_variant_id)
            .single();
          
          if (variant) {
            await supabase
              .from('product_variants')
              .update({ 
                stock_qty: variant.stock_qty + item.qty,
                reserved_qty: Math.max(0, variant.reserved_qty - item.qty)
              })
              .eq('id', item.product_variant_id);
          }
        }
      }

      // Delete reservations
      await supabase
        .from('inventory_reservations')
        .delete()
        .eq('order_id', orderId);
    }

    return NextResponse.json({ 
      success: true, 
      order,
      message: `Order status updated to ${status}`
    });
  } catch (error: any) {
    console.error('Status update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update order status' },
      { status: 500 }
    );
  }
}
