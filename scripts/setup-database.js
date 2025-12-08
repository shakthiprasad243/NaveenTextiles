const { Client } = require('pg');

const connectionString = 'postgresql://postgres:shakthi@db.vobyofrvnrzcadgocicy.supabase.co:5432/postgres';

async function setupDatabase() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    console.log('📦 Creating tables...\n');

    // Create all tables
    const createTablesSQL = `
      -- Enable UUID extension
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- 1. Users table
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT UNIQUE NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 2. Addresses table
      CREATE TABLE IF NOT EXISTS addresses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        label TEXT,
        line1 TEXT,
        line2 TEXT,
        city TEXT,
        state TEXT,
        postal_code TEXT,
        country TEXT DEFAULT 'India',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 3. Products table
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT UNIQUE,
        description TEXT,
        base_price NUMERIC(12,2) NOT NULL,
        main_category TEXT,
        category TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 4. Product Variants table
      CREATE TABLE IF NOT EXISTS product_variants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        sku TEXT UNIQUE,
        size TEXT,
        color TEXT,
        price NUMERIC(12,2),
        stock_qty INTEGER DEFAULT 0,
        reserved_qty INTEGER DEFAULT 0,
        images JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 5. Orders table
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number TEXT UNIQUE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_email TEXT,
        shipping_address JSONB,
        subtotal NUMERIC(12,2),
        shipping NUMERIC(12,2) DEFAULT 0,
        total NUMERIC(12,2),
        payment_method TEXT DEFAULT 'COD',
        status TEXT DEFAULT 'PENDING',
        whatsapp_message TEXT,
        reserved_until TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 6. Order Items table
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        product_variant_id UUID REFERENCES product_variants(id),
        product_name TEXT,
        size TEXT,
        color TEXT,
        qty INTEGER,
        unit_price NUMERIC(12,2),
        line_total NUMERIC(12,2)
      );

      -- 7. Inventory Reservations table
      CREATE TABLE IF NOT EXISTS inventory_reservations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        qty INTEGER,
        reserved_at TIMESTAMPTZ DEFAULT NOW(),
        reserved_until TIMESTAMPTZ
      );

      -- 8. Admin Users table
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        role TEXT DEFAULT 'admin',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
      CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status, created_at);
      CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
      CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(main_category, category);
    `;

    await client.query(createTablesSQL);
    console.log('✅ Tables created successfully!\n');

    // Enable RLS
    console.log('🔒 Enabling Row Level Security...');
    const rlsSQL = `
      ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
      ALTER TABLE products ENABLE ROW LEVEL SECURITY;
      ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
      ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
      ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
      ALTER TABLE inventory_reservations ENABLE ROW LEVEL SECURITY;
      ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
    `;
    await client.query(rlsSQL);
    console.log('✅ RLS enabled!\n');

    // Create RLS policies
    console.log('📜 Creating RLS policies...');
    const policies = [
      `DROP POLICY IF EXISTS "Products public read" ON products`,
      `CREATE POLICY "Products public read" ON products FOR SELECT USING (active = true)`,
      `DROP POLICY IF EXISTS "Variants public read" ON product_variants`,
      `CREATE POLICY "Variants public read" ON product_variants FOR SELECT USING (true)`,
      `DROP POLICY IF EXISTS "Orders insert" ON orders`,
      `CREATE POLICY "Orders insert" ON orders FOR INSERT WITH CHECK (true)`,
      `DROP POLICY IF EXISTS "Orders select" ON orders`,
      `CREATE POLICY "Orders select" ON orders FOR SELECT USING (true)`,
      `DROP POLICY IF EXISTS "Order items insert" ON order_items`,
      `CREATE POLICY "Order items insert" ON order_items FOR INSERT WITH CHECK (true)`,
      `DROP POLICY IF EXISTS "Order items select" ON order_items`,
      `CREATE POLICY "Order items select" ON order_items FOR SELECT USING (true)`,
      `DROP POLICY IF EXISTS "Users public insert" ON users`,
      `CREATE POLICY "Users public insert" ON users FOR INSERT WITH CHECK (true)`,
      `DROP POLICY IF EXISTS "Users select own" ON users`,
      `CREATE POLICY "Users select own" ON users FOR SELECT USING (true)`,
      `DROP POLICY IF EXISTS "Addresses insert" ON addresses`,
      `CREATE POLICY "Addresses insert" ON addresses FOR INSERT WITH CHECK (true)`,
      `DROP POLICY IF EXISTS "Addresses select" ON addresses`,
      `CREATE POLICY "Addresses select" ON addresses FOR SELECT USING (true)`,
    ];
    
    for (const policy of policies) {
      try {
        await client.query(policy);
      } catch (e) {
        // Policy might already exist, continue
      }
    }
    console.log('✅ RLS policies created!\n');

    // Seed data
    console.log('🌱 Seeding sample data...');
    
    // Admin user
    await client.query(`
      INSERT INTO users (name, email, phone, is_admin) 
      VALUES ('Admin User', 'admin@naveentextiles.com', '9876543210', true)
      ON CONFLICT (email) DO UPDATE SET is_admin = true
    `);
    console.log('  ✅ Admin user: admin@naveentextiles.com');

    // Sample customer
    await client.query(`
      INSERT INTO users (name, email, phone, is_admin) 
      VALUES ('Ravi Kumar', 'ravi@example.com', '9876543211', false)
      ON CONFLICT (email) DO NOTHING
    `);
    console.log('  ✅ Sample customer: ravi@example.com');

    // Add admin to admin_users
    await client.query(`
      INSERT INTO admin_users (user_id, role)
      SELECT id, 'admin' FROM users WHERE email = 'admin@naveentextiles.com'
      ON CONFLICT (user_id) DO NOTHING
    `);

    // Products
    const products = [
      ['Classic Linen Shirt', 'classic-linen-shirt', 'Premium linen shirt, breathable and perfect for summer.', 1299, 'Men', 'Shirts'],
      ['Silk Blend Saree', 'silk-blend-saree', 'Elegant silk-cotton blend saree with gold border.', 4500, 'Women', 'Sarees'],
      ['Block Print Kurta', 'block-print-kurta', 'Traditional hand-block printed kurta in soft cotton.', 1899, 'Women', 'Kurtas'],
      ['Cotton Fabric Roll', 'cotton-fabric-roll', 'Pure cotton fabric, ideal for custom tailoring.', 799, 'Men', 'Fabrics'],
      ['Embroidered Dupatta', 'embroidered-dupatta', 'Beautifully embroidered dupatta with intricate patterns.', 650, 'Women', 'Dupattas'],
      ['Formal Cotton Shirt', 'formal-cotton-shirt', 'Crisp cotton formal shirt for office and events.', 1499, 'Men', 'Shirts'],
      ['Kids Ethnic Kurta Set', 'kids-ethnic-kurta-set', 'Festive kurta pajama set for boys.', 999, 'Kids', 'Boys Wear'],
      ['Premium Bedsheet Set', 'premium-bedsheet-set', 'King size cotton bedsheet with 2 pillow covers.', 1299, 'Home & Living', 'Bedsheets']
    ];

    for (const [name, slug, desc, price, mainCat, cat] of products) {
      await client.query(`
        INSERT INTO products (name, slug, description, base_price, main_category, category, active)
        VALUES ($1, $2, $3, $4, $5, $6, true)
        ON CONFLICT (slug) DO NOTHING
      `, [name, slug, desc, price, mainCat, cat]);
    }
    console.log('  ✅ 8 products created');

    // Product variants
    const variants = [
      ['classic-linen-shirt', 'shirt-s-white', 'S', 'White', 10, '["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600"]'],
      ['classic-linen-shirt', 'shirt-m-white', 'M', 'White', 8, '[]'],
      ['classic-linen-shirt', 'shirt-l-white', 'L', 'White', 5, '[]'],
      ['classic-linen-shirt', 'shirt-m-blue', 'M', 'Blue', 6, '[]'],
      ['silk-blend-saree', 'saree-free-red', 'Free', 'Red', 4, '["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600"]'],
      ['silk-blend-saree', 'saree-free-green', 'Free', 'Green', 3, '[]'],
      ['block-print-kurta', 'kurta-m-blue', 'M', 'Blue', 7, '["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600"]'],
      ['block-print-kurta', 'kurta-l-blue', 'L', 'Blue', 5, '[]'],
      ['block-print-kurta', 'kurta-xl-blue', 'XL', 'Blue', 3, '[]'],
      ['cotton-fabric-roll', 'fabric-5m-floral', '5m', 'Floral', 15, '["https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600"]'],
      ['cotton-fabric-roll', 'fabric-5m-plain', '5m', 'Plain', 20, '[]'],
      ['embroidered-dupatta', 'dupatta-free-pink', 'Free', 'Pink', 12, '["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600"]'],
      ['embroidered-dupatta', 'dupatta-free-yellow', 'Free', 'Yellow', 8, '[]'],
      ['formal-cotton-shirt', 'formal-m-white', 'M', 'White', 10, '["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600"]'],
      ['formal-cotton-shirt', 'formal-l-white', 'L', 'White', 8, '[]'],
      ['formal-cotton-shirt', 'formal-m-lightblue', 'M', 'Light Blue', 6, '[]'],
      ['kids-ethnic-kurta-set', 'kids-2-3y-gold', '2-3Y', 'Gold', 8, '["https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600"]'],
      ['kids-ethnic-kurta-set', 'kids-4-5y-gold', '4-5Y', 'Gold', 6, '[]'],
      ['kids-ethnic-kurta-set', 'kids-6-7y-gold', '6-7Y', 'Gold', 4, '[]'],
      ['premium-bedsheet-set', 'bed-king-bluefloral', 'King', 'Blue Floral', 10, '["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600"]'],
      ['premium-bedsheet-set', 'bed-king-white', 'King', 'White', 8, '[]']
    ];

    for (const [productSlug, sku, size, color, stock, images] of variants) {
      await client.query(`
        INSERT INTO product_variants (product_id, sku, size, color, stock_qty, images)
        SELECT p.id, $2, $3, $4, $5, $6::jsonb
        FROM products p WHERE p.slug = $1
        ON CONFLICT (sku) DO NOTHING
      `, [productSlug, sku, size, color, stock, images]);
    }
    console.log('  ✅ 21 product variants created');

    // Create function to release expired reservations
    console.log('\n⏰ Creating inventory cleanup function...');
    await client.query(`
      CREATE OR REPLACE FUNCTION release_expired_reservations()
      RETURNS void AS $$
      BEGIN
        -- Return reserved stock to available
        UPDATE product_variants pv
        SET 
          stock_qty = stock_qty + ir.qty,
          reserved_qty = reserved_qty - ir.qty
        FROM inventory_reservations ir
        WHERE pv.id = ir.product_variant_id
          AND ir.reserved_until < NOW();
        
        -- Delete expired reservations
        DELETE FROM inventory_reservations WHERE reserved_until < NOW();
        
        -- Update orders that expired
        UPDATE orders 
        SET status = 'CANCELLED'
        WHERE status = 'PENDING' 
          AND reserved_until < NOW();
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ Cleanup function created!');

    console.log('\n' + '='.repeat(60));
    console.log('🎉 DATABASE SETUP COMPLETE!');
    console.log('='.repeat(60));
    console.log(`
Tables created:
  ✅ users
  ✅ addresses  
  ✅ products
  ✅ product_variants
  ✅ orders
  ✅ order_items
  ✅ inventory_reservations
  ✅ admin_users

Sample data:
  ✅ Admin: admin@naveentextiles.com
  ✅ Customer: ravi@example.com
  ✅ 8 products with 21 variants

Functions:
  ✅ release_expired_reservations()
`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

setupDatabase();
