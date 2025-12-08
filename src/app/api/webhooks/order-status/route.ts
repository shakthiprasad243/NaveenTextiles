import { NextRequest, NextResponse } from 'next/server';
import { supabase, getWhatsAppOrderUrl } from '@/lib/supabase';

// Webhook for order status changes - sends WhatsApp notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, new_status, old_status } = body;

    if (!order_id || !new_status) {
      return NextResponse.json(
        { error: 'Missing order_id or new_status' },
        { status: 400 }
      );
    }

    // Get order details
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items (*)')
      .eq('id', order_id)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Generate status-specific message
    const statusMessages: Record<string, string> = {
      CONFIRMED: `✅ *Order Confirmed!*\n\nHi ${order.customer_name},\n\nYour order *${order.order_number}* has been confirmed!\n\nWe're preparing your items for dispatch.\n\nThank you for shopping with Naveen Textiles! 🙏`,
      
      PACKED: `📦 *Order Packed!*\n\nHi ${order.customer_name},\n\nGreat news! Your order *${order.order_number}* has been packed and is ready for shipping.\n\nYou'll receive tracking details soon.\n\n- Naveen Textiles`,
      
      SHIPPED: `🚚 *Order Shipped!*\n\nHi ${order.customer_name},\n\nYour order *${order.order_number}* is on its way!\n\nExpected delivery: 3-5 business days\n\nTrack your order or contact us for updates.\n\n- Naveen Textiles`,
      
      DELIVERED: `🎉 *Order Delivered!*\n\nHi ${order.customer_name},\n\nYour order *${order.order_number}* has been delivered!\n\nWe hope you love your purchase. If you have any questions, feel free to reach out.\n\nThank you for choosing Naveen Textiles! ⭐`,
      
      CANCELLED: `❌ *Order Cancelled*\n\nHi ${order.customer_name},\n\nYour order *${order.order_number}* has been cancelled.\n\nIf you didn't request this cancellation or have questions, please contact us.\n\n- Naveen Textiles`
    };

    const message = statusMessages[new_status];
    
    if (!message) {
      return NextResponse.json({ 
        success: true, 
        message: 'No notification needed for this status' 
      });
    }

    // Generate WhatsApp URL for the customer
    const whatsappUrl = getWhatsAppOrderUrl(order.customer_phone, message);

    // Log the notification (in production, you'd integrate with WhatsApp Business API)
    console.log(`[ORDER NOTIFICATION] ${order.order_number}: ${old_status} → ${new_status}`);
    console.log(`WhatsApp URL: ${whatsappUrl}`);

    return NextResponse.json({
      success: true,
      order_number: order.order_number,
      customer_phone: order.customer_phone,
      new_status,
      notification_message: message,
      whatsapp_url: whatsappUrl
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
