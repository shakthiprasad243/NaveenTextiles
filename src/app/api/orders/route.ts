import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getOrdersByPhone, getOrderByNumber } from '@/lib/supabase';

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

    const order = await createOrder({
      customer_name,
      customer_phone,
      customer_email,
      shipping_address,
      items,
      payment_method
    });

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';
    return NextResponse.json({ 
      success: true, 
      order,
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

    if (orderNumber) {
      const order = await getOrderByNumber(orderNumber);
      return NextResponse.json({ order });
    }

    if (phone) {
      const orders = await getOrdersByPhone(phone);
      return NextResponse.json({ orders });
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
