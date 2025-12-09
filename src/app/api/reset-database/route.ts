import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// This endpoint resets and sets up the entire database
export async function POST(request: Request) {
  try {
    // Check for secret key to prevent accidental resets
    const { secret } = await request.json();
    if (secret !== 'RESET_DB_2024') {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }

    if (!supabaseServiceKey) {
      return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
    }

    const client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const results: string[] = [];

    // Step 1: Delete all existing data (in correct order due to foreign keys)
    results.push('=== STEP 1: Clearing existing data ===');
    
    await client.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    results.push('✓ Cleared order_items');
    
    await client.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    results.push('✓ Cleared orders');
    
    await client.from('product_variants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    results.push('✓ Cleared product_variants');
    
    await client.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    results.push('✓ Cleared products');
    
    await client.from('addresses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    results.push('✓ Cleared addresses');
    
    await client.from('admin_users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    results.push('✓ Cleared admin_users');
    
    await client.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    results.push('✓ Cleared users');
    
    await client.from('offers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    results.push('✓ Cleared offers');

    // Step 2: Create Admin User
    results.push('=== STEP 2: Creating admin user ===');
    const { data: adminUser, error: adminError } = await client
      .from('users')
      .insert({
        name: 'Admin',
        email: 'admin@naveentextiles.com',
        phone: '9876543210',
        is_admin: true
      })
      .select()
      .single();

    if (adminError) {
      results.push(`✗ Admin user error: ${adminError.message}`);
    } else {
      results.push(`✓ Created admin user: ${adminUser.email}`);
      
      // Add to admin_users table
      await client.from('admin_users').insert({
        user_id: adminUser.id,
        role: 'admin'
      });
      results.push('✓ Added to admin_users table');
    }

    // Step 3: Create Products
    results.push('=== STEP 3: Creating products ===');
    
    const products = [
      // Men's Products
      { name: 'Premium Linen Shirt', slug: 'premium-linen-shirt', description: 'Breathable premium linen shirt perfect for summer. Features a classic collar and button-down front.', base_price: 1499, main_category: 'Men', category: 'Shirts', active: true },
      { name: 'Cotton Formal Shirt', slug: 'cotton-formal-shirt', description: 'Crisp cotton formal shirt ideal for office wear. Wrinkle-resistant fabric.', base_price: 1299, main_category: 'Men', category: 'Shirts', active: true },
      { name: 'Silk Blend Kurta', slug: 'silk-blend-kurta-men', description: 'Elegant silk blend kurta with intricate embroidery. Perfect for festive occasions.', base_price: 2499, main_category: 'Men', category: 'Kurtas', active: true },
      { name: 'Cotton Casual Kurta', slug: 'cotton-casual-kurta', description: 'Comfortable cotton kurta for daily wear. Lightweight and breathable.', base_price: 999, main_category: 'Men', category: 'Kurtas', active: true },
      // Women's Products
      { name: 'Banarasi Silk Saree', slug: 'banarasi-silk-saree', description: 'Authentic Banarasi silk saree with golden zari work. A timeless classic for weddings.', base_price: 8999, main_category: 'Women', category: 'Sarees', active: true },
      { name: 'Kanjivaram Silk Saree', slug: 'kanjivaram-silk-saree', description: 'Traditional Kanjivaram silk saree with temple border design.', base_price: 12999, main_category: 'Women', category: 'Sarees', active: true },
      { name: 'Cotton Printed Saree', slug: 'cotton-printed-saree', description: 'Lightweight cotton saree with beautiful block prints. Perfect for daily wear.', base_price: 1499, main_category: 'Women', category: 'Sarees', active: true },
      { name: 'Embroidered Anarkali Kurta', slug: 'embroidered-anarkali-kurta', description: 'Stunning Anarkali kurta with delicate thread embroidery.', base_price: 2999, main_category: 'Women', category: 'Kurtas', active: true },
      { name: 'Chikankari Kurta Set', slug: 'chikankari-kurta-set', description: 'Elegant Lucknowi Chikankari kurta with matching palazzo.', base_price: 3499, main_category: 'Women', category: 'Kurtas', active: true },
      // Home & Living Products
      { name: 'King Size Bedsheet Set', slug: 'king-size-bedsheet-set', description: 'Premium cotton king size bedsheet with 2 pillow covers. 300 thread count.', base_price: 1999, main_category: 'Home & Living', category: 'Bedsheets', active: true },
      { name: 'Double Bed Comforter', slug: 'double-bed-comforter', description: 'Soft microfiber comforter with reversible design. All-season comfort.', base_price: 2999, main_category: 'Home & Living', category: 'Bedsheets', active: true },
      { name: 'Silk Cushion Covers Set', slug: 'silk-cushion-covers-set', description: 'Set of 5 silk cushion covers with traditional motifs.', base_price: 1299, main_category: 'Home & Living', category: 'Cushion Covers', active: true },
      { name: 'Cotton Table Runner', slug: 'cotton-table-runner', description: 'Hand-woven cotton table runner with tassels. 72 inches long.', base_price: 799, main_category: 'Home & Living', category: 'Table Linen', active: true },
    ];

    const { data: createdProducts, error: productsError } = await client
      .from('products')
      .insert(products)
      .select();

    if (productsError) {
      results.push(`✗ Products error: ${productsError.message}`);
    } else {
      results.push(`✓ Created ${createdProducts.length} products`);
    }

    // Step 4: Create Product Variants
    results.push('=== STEP 4: Creating product variants ===');
    
    // Get product IDs
    const { data: productList } = await client.from('products').select('id, slug');
    const productMap = new Map(productList?.map(p => [p.slug, p.id]) || []);

    const variants = [
      // Premium Linen Shirt
      { product_id: productMap.get('premium-linen-shirt'), sku: 'PLS-S-WHITE', size: 'S', color: 'White', price: 1499, stock_qty: 25, reserved_qty: 0, images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600'] },
      { product_id: productMap.get('premium-linen-shirt'), sku: 'PLS-M-WHITE', size: 'M', color: 'White', price: 1499, stock_qty: 30, reserved_qty: 0, images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600'] },
      { product_id: productMap.get('premium-linen-shirt'), sku: 'PLS-L-BLUE', size: 'L', color: 'Sky Blue', price: 1499, stock_qty: 20, reserved_qty: 0, images: ['https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600'] },
      { product_id: productMap.get('premium-linen-shirt'), sku: 'PLS-XL-BEIGE', size: 'XL', color: 'Beige', price: 1499, stock_qty: 15, reserved_qty: 0, images: ['https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600'] },
      // Cotton Formal Shirt
      { product_id: productMap.get('cotton-formal-shirt'), sku: 'CFS-M-WHITE', size: 'M', color: 'White', price: 1299, stock_qty: 40, reserved_qty: 0, images: ['https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600'] },
      { product_id: productMap.get('cotton-formal-shirt'), sku: 'CFS-L-LIGHTBLUE', size: 'L', color: 'Light Blue', price: 1299, stock_qty: 35, reserved_qty: 0, images: ['https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600'] },
      // Silk Blend Kurta Men
      { product_id: productMap.get('silk-blend-kurta-men'), sku: 'SBK-M-MAROON', size: 'M', color: 'Maroon', price: 2499, stock_qty: 20, reserved_qty: 0, images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600'] },
      { product_id: productMap.get('silk-blend-kurta-men'), sku: 'SBK-L-GOLD', size: 'L', color: 'Gold', price: 2699, stock_qty: 15, reserved_qty: 0, images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'] },
      // Cotton Casual Kurta
      { product_id: productMap.get('cotton-casual-kurta'), sku: 'CCK-M-WHITE', size: 'M', color: 'White', price: 999, stock_qty: 50, reserved_qty: 0, images: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600'] },
      { product_id: productMap.get('cotton-casual-kurta'), sku: 'CCK-L-BLUE', size: 'L', color: 'Blue', price: 999, stock_qty: 45, reserved_qty: 0, images: [] },
      // Banarasi Silk Saree
      { product_id: productMap.get('banarasi-silk-saree'), sku: 'BSS-FREE-RED', size: 'Free Size', color: 'Red', price: 8999, stock_qty: 10, reserved_qty: 0, images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'] },
      { product_id: productMap.get('banarasi-silk-saree'), sku: 'BSS-FREE-PURPLE', size: 'Free Size', color: 'Purple', price: 8999, stock_qty: 8, reserved_qty: 0, images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600'] },
      // Kanjivaram Silk Saree
      { product_id: productMap.get('kanjivaram-silk-saree'), sku: 'KSS-FREE-GOLD', size: 'Free Size', color: 'Gold & Maroon', price: 12999, stock_qty: 5, reserved_qty: 0, images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600'] },
      // Cotton Printed Saree
      { product_id: productMap.get('cotton-printed-saree'), sku: 'CPS-FREE-BLUE', size: 'Free Size', color: 'Indigo Blue', price: 1499, stock_qty: 30, reserved_qty: 0, images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'] },
      { product_id: productMap.get('cotton-printed-saree'), sku: 'CPS-FREE-GREEN', size: 'Free Size', color: 'Forest Green', price: 1499, stock_qty: 25, reserved_qty: 0, images: [] },
      // Embroidered Anarkali Kurta
      { product_id: productMap.get('embroidered-anarkali-kurta'), sku: 'EAK-S-PINK', size: 'S', color: 'Blush Pink', price: 2999, stock_qty: 15, reserved_qty: 0, images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600'] },
      { product_id: productMap.get('embroidered-anarkali-kurta'), sku: 'EAK-M-TEAL', size: 'M', color: 'Teal', price: 2999, stock_qty: 20, reserved_qty: 0, images: [] },
      // Chikankari Kurta Set
      { product_id: productMap.get('chikankari-kurta-set'), sku: 'CKS-M-WHITE', size: 'M', color: 'White', price: 3499, stock_qty: 18, reserved_qty: 0, images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600'] },
      { product_id: productMap.get('chikankari-kurta-set'), sku: 'CKS-L-PEACH', size: 'L', color: 'Peach', price: 3499, stock_qty: 12, reserved_qty: 0, images: [] },
      // King Size Bedsheet Set
      { product_id: productMap.get('king-size-bedsheet-set'), sku: 'KBS-KING-WHITE', size: 'King', color: 'White', price: 1999, stock_qty: 25, reserved_qty: 0, images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600'] },
      { product_id: productMap.get('king-size-bedsheet-set'), sku: 'KBS-KING-BLUE', size: 'King', color: 'Royal Blue', price: 1999, stock_qty: 20, reserved_qty: 0, images: [] },
      // Double Bed Comforter
      { product_id: productMap.get('double-bed-comforter'), sku: 'DBC-DOUBLE-GREY', size: 'Double', color: 'Grey', price: 2999, stock_qty: 15, reserved_qty: 0, images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600'] },
      // Silk Cushion Covers Set
      { product_id: productMap.get('silk-cushion-covers-set'), sku: 'SCC-16-GOLD', size: '16x16 inch', color: 'Gold', price: 1299, stock_qty: 30, reserved_qty: 0, images: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600'] },
      { product_id: productMap.get('silk-cushion-covers-set'), sku: 'SCC-16-MAROON', size: '16x16 inch', color: 'Maroon', price: 1299, stock_qty: 25, reserved_qty: 0, images: [] },
      // Cotton Table Runner
      { product_id: productMap.get('cotton-table-runner'), sku: 'CTR-72-BEIGE', size: '72 inch', color: 'Beige', price: 799, stock_qty: 40, reserved_qty: 0, images: ['https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600'] },
    ].filter(v => v.product_id); // Filter out any with missing product_id

    const { data: createdVariants, error: variantsError } = await client
      .from('product_variants')
      .insert(variants)
      .select();

    if (variantsError) {
      results.push(`✗ Variants error: ${variantsError.message}`);
    } else {
      results.push(`✓ Created ${createdVariants.length} product variants`);
    }

    // Step 5: Create Offers
    results.push('=== STEP 5: Creating offers ===');
    
    const offers = [
      { title: 'Festive Season Sale', description: 'Get 20% off on all ethnic wear! Use code at checkout.', code: 'FESTIVE20', discount_type: 'percentage', discount_value: 20, min_order_value: 1000, max_discount: 500, valid_from: new Date().toISOString(), valid_till: '2025-12-31T23:59:59Z', active: true, usage_limit: null, used_count: 0 },
      { title: 'First Order Discount', description: 'Flat ₹200 off on your first order. Welcome to Naveen Textiles!', code: 'WELCOME200', discount_type: 'fixed', discount_value: 200, min_order_value: 500, max_discount: null, valid_from: new Date().toISOString(), valid_till: null, active: true, usage_limit: null, used_count: 0 },
      { title: 'Free Shipping', description: 'Free shipping on orders above ₹999. No code needed!', code: 'FREESHIP', discount_type: 'fixed', discount_value: 0, min_order_value: 999, max_discount: null, valid_from: new Date().toISOString(), valid_till: '2025-12-31T23:59:59Z', active: true, usage_limit: null, used_count: 0 },
    ];

    const { data: createdOffers, error: offersError } = await client
      .from('offers')
      .insert(offers)
      .select();

    if (offersError) {
      results.push(`✗ Offers error: ${offersError.message}`);
    } else {
      results.push(`✓ Created ${createdOffers.length} offers`);
    }

    // Step 6: Create Admin in Supabase Auth
    results.push('=== STEP 6: Creating admin in Supabase Auth ===');
    
    try {
      // First try to delete existing admin user
      const { data: { users: existingUsers } } = await client.auth.admin.listUsers();
      const existingAdmin = existingUsers?.find(u => u.email === 'admin@naveentextiles.com');
      
      if (existingAdmin) {
        await client.auth.admin.deleteUser(existingAdmin.id);
        results.push('✓ Deleted existing admin auth user');
      }

      // Create new admin user
      const { data: authData, error: authError } = await client.auth.admin.createUser({
        email: 'admin@naveentextiles.com',
        password: 'Admin@123',
        email_confirm: true,
        user_metadata: { name: 'Admin', phone: '9876543210' }
      });

      if (authError) {
        results.push(`✗ Auth error: ${authError.message}`);
      } else {
        results.push(`✓ Created admin auth user: ${authData.user?.email}`);
      }
    } catch (authErr: any) {
      results.push(`✗ Auth setup error: ${authErr.message}`);
    }

    // Final Summary
    results.push('=== SETUP COMPLETE ===');
    
    // Get counts
    const { count: usersCount } = await client.from('users').select('*', { count: 'exact', head: true });
    const { count: productsCount } = await client.from('products').select('*', { count: 'exact', head: true });
    const { count: variantsCount } = await client.from('product_variants').select('*', { count: 'exact', head: true });
    const { count: offersCount } = await client.from('offers').select('*', { count: 'exact', head: true });

    results.push(`Users: ${usersCount}`);
    results.push(`Products: ${productsCount}`);
    results.push(`Variants: ${variantsCount}`);
    results.push(`Offers: ${offersCount}`);
    results.push('');
    results.push('Admin Login: admin@naveentextiles.com / Admin@123');

    return NextResponse.json({
      success: true,
      message: 'Database reset and setup completed',
      results
    });
  } catch (error: unknown) {
    console.error('Reset error:', error);
    const message = error instanceof Error ? error.message : 'Reset failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
