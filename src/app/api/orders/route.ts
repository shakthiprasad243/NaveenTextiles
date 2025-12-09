import { NextRequest, NextResponse } from 'next/server';
import { supabase, generateOrderNumber, generateWhatsAppMessage } from '@/lib/supabase';
import { supabaseAdmin, isAdminClientConfigured } from '@/lib/supabase-admin';
import { validateOrder } from '@/lib/validators';

// Helper function to normalize phone number for matching
function normalizePhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  // If starts with 91 and has 12 digits, remove country code
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  // If has 10 digits, return as is
  if (digits.length === 10) {
    return digits;
  }
  // Return last 10 digits if longer
  if (digits.length > 10) {
    return digits.slice(-10);
  }
  return digits;
}

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
    
    // Validate input
    const validation = validateOrder(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    // Support both flat format and nested customer object format
    const customer = body.customer || {};
    const customer_name = body.customer_name || customer.name;
    const customer_phone = body.customer_phone || customer.phone;
    const customer_email = body.customer_email || customer.email;
    const shipping_address = body.shipping_address || body.shippingAddress;
    const items = body.items;
    const payment_method = body.payment_method || body.paymentMethod;

    // Normalize phone number for consistent storage
    const normalizedCustomerPhone = normalizePhone(customer_phone);

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
            qty: item.qty || item.quantity || 1,
            variant_exists: true
          };
        }
      }
      
      // If product_variant_id is provided, verify it exists
      if (item.product_variant_id) {
        const { data: variant } = await client
          .from('product_variants')
          .select('id, price')
          .eq('id', item.product_variant_id)
          .single();
        
        if (variant) {
          return {
            ...item,
            qty: item.qty || item.quantity || 1,
            unit_price: item.unit_price || variant.price || 0,
            variant_exists: true
          };
        }
      }
      
      // Normalize qty/quantity - variant doesn't exist but allow order creation
      return {
        ...item,
        product_variant_id: null, // Clear invalid variant ID
        qty: item.qty || item.quantity || 1,
        unit_price: item.unit_price || 0,
        variant_exists: false
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
        customer_phone: normalizedCustomerPhone,
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
      id: order.id,
      order_number: order.order_number,
      orderNumber: order.order_number,
      order_id: order.id,
      status: order.status,
      whatsapp_url: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(order.whatsapp_message || '')}`
    }, { status: 201 });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}

// Get orders by phone, email, or order number
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const email = searchParams.get('email');
    const orderNumber = searchParams.get('order_number');

    // Use admin client if available for better access
    const client = isAdminClientConfigured() ? supabaseAdmin : supabase;

    if (orderNumber) {
      const { data, error } = await client
        .from('orders')
        .select(`*, order_items (*)`)
        .eq('order_number', orderNumber)
        .single();
      
      if (error) {
        // Handle "no rows returned" error gracefully
        if (error.code === 'PGRST116') {
          // Return empty array for test compatibility
          return NextResponse.json([]);
        }
        throw error;
      }
      // Return array with single order for test compatibility
      return NextResponse.json(data ? [data] : []);
    }

    if (email) {
      const { data, error } = await client
        .from('orders')
        .select(`*, order_items (*)`)
        .eq('customer_email', email)
        .order('created_at', { ascending: false });
      if (error) throw error;
      // Return array directly for test compatibility
      return NextResponse.json(data || []);
    }

    if (phone) {
      // Normalize the phone number for flexible matching
      const normalizedPhone = normalizePhone(phone);
      
      // Try exact match first
      let { data, error } = await client
        .from('orders')
        .select(`*, order_items (*)`)
        .eq('customer_phone', phone)
        .order('created_at', { ascending: false });
      
      // If no results, try with normalized phone (pattern match)
      if (!error && (!data || data.length === 0) && normalizedPhone.length === 10) {
        // Try matching with just the 10 digits using ilike pattern
        const { data: patternData, error: patternError } = await client
          .from('orders')
          .select(`*, order_items (*)`)
          .ilike('customer_phone', `%${normalizedPhone}%`)
          .order('created_at', { ascending: false });
        
        if (!patternError && patternData) {
          data = patternData;
        }
      }
      
      if (error) throw error;
      // Return array directly for test compatibility
      return NextResponse.json(data || []);
    }

    return NextResponse.json(
      { error: 'Provide phone, email, or order_number parameter' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
