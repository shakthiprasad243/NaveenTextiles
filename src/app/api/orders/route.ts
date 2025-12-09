import { NextRequest, NextResponse } from 'next/server';
import { supabase, generateOrderNumber, generateWhatsAppMessage } from '@/lib/supabase';
import { supabaseAdmin, isAdminClientConfigured } from '@/lib/supabase-admin';

// Delete order(s)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, order_ids } = body;

    if (!order_id && !order_ids?.length) {
      return NextResponse.json(
        { error: 'Provide order_id or order_ids array' },
        { status: 400 }
      );
    }

    const client = isAdminClientConfigured() ? supabaseAdmin : supabase;
    const idsToDelete = order_ids || [order_id];

    // First, restore inventory for cancelled/deleted orders
    for (const id of idsToDelete) {
      const { data: orderItems } = await client
        .from('order_items')
        .select('product_variant_id, qty')
        .eq('order_id', id);

      if (orderItems) {
        for (const item of orderItems) {
          if (!item.product_variant_id) continue;
          
          const { data: variant } = await client
            .from('product_variants')
            .select('stock_qty, reserved_qty')
            .eq('id', item.product_variant_id)
            .single();
          
          if (variant) {
            await client
              .from('product_variants')
              .update({ 
                stock_qty: variant.stock_qty + item.qty,
                reserved_qty: Math.max(0, variant.reserved_qty - item.qty)
              })
              .eq('id', item.product_variant_id);
          }
        }
      }

      // Delete order items first (foreign key constraint)
      await client.from('order_items').delete().eq('order_id', id);
    }

    // Delete orders
    const { error } = await client
      .from('orders')
      .delete()
      .in('id', idsToDelete);

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      deleted_count: idsToDelete.length 
    });
  } catch (error: any) {
    console.error('Order deletion error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete order(s)' },
      { status: 500 }
    );
  }
}

// Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { customer_name, customer_phone, customer_email, shipping_address, items, payment_method } = body;

    if (!customer_name || !customer_phone || !items?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_name, customer_phone, items' },
        { status: 400 }
      );
    }

    // Use admin client if available, otherwise fall back to regular client
    const client = isAdminClientConfigured() ? supabaseAdmin : supabase;

    // Normalize items to handle different formats
    const normalizedItems = await Promise.all(items.map(async (item: any) => {
      // If item has product_id but not product_variant_id, try to get the first variant
      if (item.product_id && !item.product_variant_id) {
        const { data: variants } = await client
          .from('product_variants')
          .select('id, price')
          .eq('product_id', item.product_id)
          .limit(1);
        
        if (variants && variants.length > 0) {
          return {
            ...item,
            product_variant_id: variants[0].id,
            unit_price: item.unit_price || variants[0].price || 0,
            qty: item.qty || item.quantity || 1
          };
        }
      }
      
      // Normalize qty/quantity
      return {
        ...item,
        qty: item.qty || item.quantity || 1,
        unit_price: item.unit_price || 0
      };
    }));

    const orderNumber = generateOrderNumber();
    const subtotal = normalizedItems.reduce((sum: number, item: any) => sum + ((item.unit_price || 0) * (item.qty || 1)), 0);
    const shipping = subtotal >= 1000 ? 0 : 50;
    const total = subtotal + shipping;

    // Create order
    const { data: order, error: orderError } = await client
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name,
        customer_phone,
        customer_email,
        shipping_address: typeof shipping_address === 'string' ? { line1: shipping_address } : shipping_address,
        subtotal,
        shipping,
        total,
        payment_method: payment_method || 'COD',
        status: 'PENDING',
        whatsapp_message: generateWhatsAppMessage(orderNumber, customer_name, customer_phone, shipping_address, normalizedItems, total),
        reserved_until: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = normalizedItems.map((item: any) => ({
      order_id: order.id,
      product_variant_id: item.product_variant_id,
      product_name: item.product_name || 'Product',
      size: item.size || '',
      color: item.color || '',
      qty: item.qty || 1,
      unit_price: item.unit_price || 0,
      line_total: (item.unit_price || 0) * (item.qty || 1)
    }));

    const { error: itemsError } = await client.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    // Reserve inventory
    for (const item of normalizedItems) {
      if (!item.product_variant_id) continue;
      
      const { data: variant } = await client
        .from('product_variants')
        .select('stock_qty, reserved_qty')
        .eq('id', item.product_variant_id)
        .single();
      
      if (variant) {
        await client
          .from('product_variants')
          .update({ 
            stock_qty: Math.max(0, variant.stock_qty - (item.qty || 1)),
            reserved_qty: variant.reserved_qty + (item.qty || 1)
          })
          .eq('id', item.product_variant_id);
      }
    }

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';
    return NextResponse.json({ 
      success: true, 
      order,
      // Also include these at root level for easier access
      order_number: order.order_number,
      order_id: order.id,
      whatsapp_url: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(order.whatsapp_message || '')}`
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}

// Get orders by phone or order number
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const orderNumber = searchParams.get('order_number');

    // Use admin client if available for better access
    const client = isAdminClientConfigured() ? supabaseAdmin : supabase;

    if (orderNumber) {
      const { data, error } = await client
        .from('orders')
        .select(`*, order_items (*)`)
        .eq('order_number', orderNumber)
        .single();
      if (error) throw error;
      return NextResponse.json({ order: data });
    }

    if (phone) {
      const { data, error } = await client
        .from('orders')
        .select(`*, order_items (*)`)
        .eq('customer_phone', phone)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json({ orders: data });
    }

    return NextResponse.json(
      { error: 'Provide phone or order_number parameter' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
