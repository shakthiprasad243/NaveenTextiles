import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vobyofrvnrzcadgocicy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_zFEeqj8XkhjP0sVj4A1niA_bmpWmch9';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============ Database Types ============

export interface DbUser {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  is_admin: boolean;
  created_at: string;
}

export interface DbAddress {
  id: string;
  user_id: string;
  label: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string;
  created_at: string;
}

export interface DbProduct {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  base_price: number;
  main_category: string | null;
  category: string | null;
  active: boolean;
  created_at: string;
}

export interface DbProductVariant {
  id: string;
  product_id: string;
  sku: string | null;
  size: string | null;
  color: string | null;
  price: number | null;
  stock_qty: number;
  reserved_qty: number;
  images: string[];
  created_at: string;
}

export interface DbOrder {
  id: string;
  order_number: string | null;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  } | null;
  subtotal: number | null;
  shipping: number;
  total: number | null;
  payment_method: string;
  status: 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  whatsapp_message: string | null;
  reserved_until: string | null;
  created_at: string;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  product_variant_id: string | null;
  product_name: string | null;
  size: string | null;
  color: string | null;
  qty: number | null;
  unit_price: number | null;
  line_total: number | null;
}

export interface DbOffer {
  id: string;
  title: string;
  description: string;
  code: string;
  discount_type: 'percentage' | 'fixed' | 'bogo';
  discount_value: number;
  min_order_value: number | null;
  max_discount: number | null;
  valid_from: string;
  valid_till: string | null;
  active: boolean;
  usage_limit: number | null;
  used_count: number;
  created_at: string;
}

// ============ API Functions ============

// Products
export async function getProducts(filters?: { mainCategory?: string; category?: string; active?: boolean }) {
  let query = supabase.from('products').select(`
    *,
    product_variants (*)
  `);
  
  if (filters?.mainCategory) query = query.eq('main_category', filters.mainCategory);
  if (filters?.category) query = query.eq('category', filters.category);
  if (filters?.active !== undefined) query = query.eq('active', filters.active);
  
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`*, product_variants (*)`)
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data;
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`*, product_variants (*)`)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

// Orders
export async function createOrder(orderData: {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address: DbOrder['shipping_address'];
  items: Array<{
    product_variant_id: string;
    product_name: string;
    size: string;
    color: string;
    qty: number;
    unit_price: number;
  }>;
  payment_method?: string;
}) {
  const orderNumber = generateOrderNumber();
  const subtotal = orderData.items.reduce((sum, item) => sum + (item.unit_price * item.qty), 0);
  const shipping = subtotal >= 1000 ? 0 : 50;
  const total = subtotal + shipping;

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      customer_email: orderData.customer_email,
      shipping_address: orderData.shipping_address,
      subtotal,
      shipping,
      total,
      payment_method: orderData.payment_method || 'COD',
      status: 'PENDING',
      whatsapp_message: generateWhatsAppMessage(orderNumber, orderData.customer_name, orderData.customer_phone, orderData.shipping_address, orderData.items, total),
      reserved_until: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // Create order items
  const orderItems = orderData.items.map(item => ({
    order_id: order.id,
    product_variant_id: item.product_variant_id,
    product_name: item.product_name,
    size: item.size,
    color: item.color,
    qty: item.qty,
    unit_price: item.unit_price,
    line_total: item.unit_price * item.qty
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) throw itemsError;

  // Reserve inventory
  for (const item of orderData.items) {
    try {
      await supabase.rpc('reserve_inventory', {
        p_variant_id: item.product_variant_id,
        p_order_id: order.id,
        p_qty: item.qty
      });
    } catch {
      // If RPC doesn't exist, do manual update
      const { data: variant } = await supabase
        .from('product_variants')
        .select('stock_qty, reserved_qty')
        .eq('id', item.product_variant_id)
        .single();
      
      if (variant) {
        await supabase
          .from('product_variants')
          .update({ 
            stock_qty: Math.max(0, variant.stock_qty - item.qty),
            reserved_qty: variant.reserved_qty + item.qty
          })
          .eq('id', item.product_variant_id);
      }
    }
  }

  return order;
}

export async function getOrdersByPhone(phone: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`*, order_items (*)`)
    .eq('customer_phone', phone)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getOrderByNumber(orderNumber: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`*, order_items (*)`)
    .eq('order_number', orderNumber)
    .single();
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(orderId: string, status: DbOrder['status']) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Users
export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getUserByPhone(phone: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createUser(userData: { name: string; email?: string; phone: string }) {
  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Addresses
export async function getUserAddresses(userId: string) {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createAddress(addressData: Omit<DbAddress, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('addresses')
    .insert(addressData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============ Helper Functions ============

export function generateOrderNumber() {
  const prefix = 'NT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}${random}`;
}

export function generateWhatsAppMessage(
  orderNumber: string,
  customerName: string,
  customerPhone: string,
  address: DbOrder['shipping_address'],
  items: Array<{ product_name: string; size: string; color: string; qty: number; unit_price: number }>,
  total: number
) {
  const itemsList = items.map(item => 
    `• ${item.product_name} (${item.size}, ${item.color}) x${item.qty} - ₹${item.unit_price * item.qty}`
  ).join('\n');

  const addressStr = address ? 
    `${address.line1 || ''}, ${address.line2 || ''}\n${address.city || ''}, ${address.state || ''} - ${address.postal_code || ''}` : 
    'Not provided';

  return `🛒 *New Order - Naveen Textiles*

📦 *Order ID:* ${orderNumber}

👤 *Customer:* ${customerName}
📱 *Phone:* ${customerPhone}

📍 *Delivery Address:*
${addressStr}

🛍️ *Items:*
${itemsList}

💰 *Total:* ₹${total}
💳 *Payment:* Cash on Delivery

Please confirm this order. 🙏`;
}

export function getWhatsAppOrderUrl(phone: string, message: string) {
  const cleanPhone = phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

// Storage helpers
export function getPublicImageUrl(path: string) {
  return `${supabaseUrl}/storage/v1/object/public/product-images/${path}`;
}

export async function uploadProductImage(file: File, productSlug: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${productSlug}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file);
    
  if (error) throw error;
  return getPublicImageUrl(data.path);
}
