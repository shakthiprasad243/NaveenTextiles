-- =====================================================
-- COMPLETE SUPABASE SETUP SCRIPT FOR NAVEEN TEXTILES
-- WITH CLERK AUTHENTICATION INTEGRATION
-- =====================================================
-- This script will:
-- 1. Drop all existing tables (clean slate)
-- 2. Create all required tables optimized for Clerk
-- 3. Set up RLS policies
-- 4. Seed initial data
-- 
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: DROP EXISTING TABLES (in correct order due to foreign keys)
-- =====================================================

DROP TABLE IF EXISTS inventory_reservations CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS offers CASCADE;

-- =====================================================
-- STEP 2: CREATE TABLES
-- =====================================================

-- 2.1 Users Table (Clerk Integration)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL, -- Clerk user ID
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  is_admin BOOLEAN DEFAULT false,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 Admin Users Table (for additional admin tracking)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2.3 Addresses Table
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(50),
  line1 VARCHAR(255),
  line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'India',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.4 Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  base_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  main_category VARCHAR(100),
  category VARCHAR(100),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.5 Product Variants Table
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  sku VARCHAR(100) UNIQUE,
  size VARCHAR(50),
  color VARCHAR(50),
  price NUMERIC(10, 2),
  stock_qty INTEGER DEFAULT 0,
  reserved_qty INTEGER DEFAULT 0,
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.6 Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  shipping_address JSONB,
  subtotal NUMERIC(10, 2),
  shipping NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2),
  payment_method VARCHAR(50) DEFAULT 'COD',
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
  whatsapp_message TEXT,
  reserved_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.7 Order Items Table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name VARCHAR(255),
  size VARCHAR(50),
  color VARCHAR(50),
  qty INTEGER DEFAULT 1,
  unit_price NUMERIC(10, 2),
  line_total NUMERIC(10, 2)
);

-- 2.8 Inventory Reservations Table
CREATE TABLE inventory_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  qty INTEGER,
  reserved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reserved_until TIMESTAMP WITH TIME ZONE
);

-- 2.9 Offers Table
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'bogo')),
  discount_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
  min_order_value NUMERIC(10, 2),
  max_discount NUMERIC(10, 2),
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  valid_till TIMESTAMP WITH TIME ZONE,
  active BOOLEAN NOT NULL DEFAULT true,
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 3: CREATE INDEXES
-- =====================================================

CREATE INDEX idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_main_category ON products(main_category);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_inventory_reservations_variant_id ON inventory_reservations(product_variant_id);
CREATE INDEX idx_inventory_reservations_order_id ON inventory_reservations(order_id);
CREATE INDEX idx_offers_code ON offers(code);
CREATE INDEX idx_offers_active ON offers(active);

-- =====================================================
-- STEP 4: ENABLE RLS AND CREATE POLICIES
-- =====================================================

-- 4.1 Users Table RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read users" ON users FOR SELECT USING (true);
CREATE POLICY "Anyone can insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update users" ON users FOR UPDATE USING (true) WITH CHECK (true);

-- 4.2 Admin Users Table RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read admin_users" ON admin_users FOR SELECT USING (true);
CREATE POLICY "Anyone can insert admin_users" ON admin_users FOR INSERT WITH CHECK (true);

-- 4.3 Addresses Table RLS
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read addresses" ON addresses FOR SELECT USING (true);
CREATE POLICY "Anyone can insert addresses" ON addresses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update addresses" ON addresses FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete addresses" ON addresses FOR DELETE USING (true);

-- 4.4 Products Table RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read products" ON products FOR SELECT USING (true);
CREATE POLICY "Anyone can insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update products" ON products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete products" ON products FOR DELETE USING (true);

-- 4.5 Product Variants Table RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Anyone can insert variants" ON product_variants FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update variants" ON product_variants FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete variants" ON product_variants FOR DELETE USING (true);

-- 4.6 Orders Table RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update orders" ON orders FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete orders" ON orders FOR DELETE USING (true);

-- 4.7 Order Items Table RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read order_items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Anyone can insert order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update order_items" ON order_items FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete order_items" ON order_items FOR DELETE USING (true);

-- 4.8 Inventory Reservations Table RLS
ALTER TABLE inventory_reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read reservations" ON inventory_reservations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reservations" ON inventory_reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update reservations" ON inventory_reservations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete reservations" ON inventory_reservations FOR DELETE USING (true);

-- 4.9 Offers Table RLS
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read offers" ON offers FOR SELECT USING (true);
CREATE POLICY "Anyone can insert offers" ON offers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update offers" ON offers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete offers" ON offers FOR DELETE USING (true);

-- =====================================================
-- STEP 5: SEED INITIAL DATA
-- =====================================================

-- 5.1 Create Admin User (Clerk Integration)
-- Note: This will be created via Clerk, but we'll add a placeholder
INSERT INTO users (clerk_user_id, name, email, phone, is_admin) VALUES
('clerk_admin_placeholder', 'Admin', 'admin@naveentextiles.com', '9876543210', true);

-- Add to admin_users table
INSERT INTO admin_users (user_id, role)
SELECT id, 'admin' FROM users WHERE email = 'admin@naveentextiles.com';

-- 5.2 Create Sample Products

-- Men's Products
INSERT INTO products (name, slug, description, base_price, main_category, category, active) VALUES
('Premium Linen Shirt', 'premium-linen-shirt', 'Breathable premium linen shirt perfect for summer. Features a classic collar and button-down front.', 1499, 'Men', 'Shirts', true),
('Cotton Formal Shirt', 'cotton-formal-shirt', 'Crisp cotton formal shirt ideal for office wear. Wrinkle-resistant fabric.', 1299, 'Men', 'Shirts', true),
('Silk Blend Kurta', 'silk-blend-kurta-men', 'Elegant silk blend kurta with intricate embroidery. Perfect for festive occasions.', 2499, 'Men', 'Kurtas', true),
('Cotton Casual Kurta', 'cotton-casual-kurta', 'Comfortable cotton kurta for daily wear. Lightweight and breathable.', 999, 'Men', 'Kurtas', true);

-- Women's Products
INSERT INTO products (name, slug, description, base_price, main_category, category, active) VALUES
('Banarasi Silk Saree', 'banarasi-silk-saree', 'Authentic Banarasi silk saree with golden zari work. A timeless classic for weddings.', 8999, 'Women', 'Sarees', true),
('Kanjivaram Silk Saree', 'kanjivaram-silk-saree', 'Traditional Kanjivaram silk saree with temple border design.', 12999, 'Women', 'Sarees', true),
('Cotton Printed Saree', 'cotton-printed-saree', 'Lightweight cotton saree with beautiful block prints. Perfect for daily wear.', 1499, 'Women', 'Sarees', true),
('Embroidered Anarkali Kurta', 'embroidered-anarkali-kurta', 'Stunning Anarkali kurta with delicate thread embroidery.', 2999, 'Women', 'Kurtas', true),
('Chikankari Kurta Set', 'chikankari-kurta-set', 'Elegant Lucknowi Chikankari kurta with matching palazzo.', 3499, 'Women', 'Kurtas', true);

-- Home & Living Products
INSERT INTO products (name, slug, description, base_price, main_category, category, active) VALUES
('King Size Bedsheet Set', 'king-size-bedsheet-set', 'Premium cotton king size bedsheet with 2 pillow covers. 300 thread count.', 1999, 'Home & Living', 'Bedsheets', true),
('Double Bed Comforter', 'double-bed-comforter', 'Soft microfiber comforter with reversible design. All-season comfort.', 2999, 'Home & Living', 'Bedsheets', true),
('Silk Cushion Covers Set', 'silk-cushion-covers-set', 'Set of 5 silk cushion covers with traditional motifs.', 1299, 'Home & Living', 'Cushion Covers', true),
('Cotton Table Runner', 'cotton-table-runner', 'Hand-woven cotton table runner with tassels. 72 inches long.', 799, 'Home & Living', 'Table Linen', true);

-- 5.3 Create Product Variants
-- Premium Linen Shirt Variants
INSERT INTO product_variants (product_id, sku, size, color, price, stock_qty, reserved_qty, images)
SELECT id, 'PLS-S-WHITE', 'S', 'White', 1499, 25, 0, '["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600"]'::jsonb
FROM products WHERE slug = 'premium-linen-shirt';

INSERT INTO product_variants (product_id, sku, size, color, price, stock_qty, reserved_qty, images)
SELECT id, 'PLS-M-WHITE', 'M', 'White', 1499, 30, 0, '["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600"]'::jsonb
FROM products WHERE slug = 'premium-linen-shirt';

INSERT INTO product_variants (product_id, sku, size, color, price, stock_qty, reserved_qty, images)
SELECT id, 'PLS-L-BLUE', 'L', 'Sky Blue', 1499, 20, 0, '["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600"]'::jsonb
FROM products WHERE slug = 'premium-linen-shirt';

INSERT INTO product_variants (product_id, sku, size, color, price, stock_qty, reserved_qty, images)
SELECT id, 'PLS-XL-BEIGE', 'XL', 'Beige', 1499, 15, 0, '["https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600"]'::jsonb
FROM products WHERE slug = 'premium-linen-shirt';

-- Cotton Formal Shirt Variants
INSERT INTO product_variants (product_id, sku, size, color, price, stock_qty, reserved_qty, images)
SELECT id, 'CFS-M-WHITE', 'M', 'White', 1299, 40, 0, '["https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600"]'::jsonb
FROM products WHERE slug = 'cotton-formal-shirt';

INSERT INTO product_variants (product_id, sku, size, color, price, stock_qty, reserved_qty, images)
SELECT id, 'CFS-L-LIGHTBLUE', 'L', 'Light Blue', 1299, 35, 0, '["https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600"]'::jsonb
FROM products WHERE slug = 'cotton-formal-shirt';

-- Silk Blend Kurta Men Variants
INSERT INTO product_variants (product_id, sku, size, color, price, stock_qty, reserved_qty, images)
SELECT id, 'SBK-M-MAROON', 'M', 'Maroon', 2499, 20, 0, '["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600"]'::jsonb
FROM products WHERE slug = 'silk-blend-kurta-men';

INSERT INTO product_variants (product_id, sku, size, color, price, stock_qty, reserved_qty, images)
SELECT id, 'SBK-L-GOLD', 'L', 'Gold', 2699, 15, 0, '["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600"]'::jsonb
FROM products WHERE slug = 'silk-blend-kurta-men';

-- Cotton Casual Kurta Variants
INSERT INTO product_variants (product_id, sku, size, color, price, stock_qty, reserved_qty, images)
SELECT id, 'CCK-M-WHITE', 'M', 'White', 999, 50, 0, '["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600"]'::jsonb
FROM products WHERE slug = 'cotton-casual-kurta';

INSERT INTO product_variants (product_id, sku, size, color, price, stock_qty, reserved_qty, images)
SELECT id, 'CCK-L-BLUE', 'L', 'Blue', 999, 45, 0, '[]'::jsonb
FROM products WHERE slug = 'cotton-casual-kurta';

-- Banarasi Silk Saree Variants
INSERT INTO product_variants (product_id, sku, size, color, price, stock_qty, reserved_qty, images)
SELECT id, 'BSS-FREE-RED', 'Free Size', 'Red', 8999, 10, 0, '["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600"]'::jsonb
FROM products WHERE slug = 'banarasi-silk-saree';

INSERT INTO product_variants (product_id, sku, size, color, price, stock_qty, reserved_qty, images)
SELECT id, 'BSS-FREE-PURPLE', 'Free Size', 'Purple', 8999, 8, 0, '["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600"]'::jsonb
FROM products WHERE slug = 'banarasi-silk-saree';

-- Kanjivaram Silk Saree Variants
INSERT INTO product_variants (product_id, sku, size, color, price, stock_qty, reserved_qty, images)
SELECT id, 'KSS-FREE-GOLD', 'Free Size', 'Gold & Maroon', 12999, 5, 0, '["https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600"]'::jsonb
FROM products WHERE slug = 'kanjivaram-silk-saree';

-- Cotton Printed Saree Variants
INSERT INTO product_variants (product_id, sku, size, color, price, stock_qty, reserved_qty, images)
SELECT id, 'CPS-FREE-BLUE', 'Free Size', 'Indigo Blue', 1499, 30, 0, '["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600"]'::jsonb
FROM products WHERE slug = 'cotton-printed-saree';

INSERT INTO product_variants (product_id, sku, size, color, price, stock_qty, reserved_qty, images)
SELECT id, 'CPS-FREE-GREEN', 'Free Size', 'Forest Green', 1499, 25, 0, '[]'::jsonb
FROM products WHERE slug = 'cotton-printed-saree';

-- Embroidered Anarkali Kurta Variants
INSERT INTO product_variants (product_id, sku, size, color, price, stock_qty, reserved_qty, images)
SELECT id, 'EAK-S-PINK', 'S', 'Blush Pink', 2999, 15, 0, '["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600"]'::jsonb
FROM products WHERE slug = 'embroidered-anarkali-kurta';

INSERT INTO product_variants (product_id, sku, size, color, price, stock_qty, reserved_qty, images)
SELECT id, 'EAK-M-TEAL', 'M', 'Teal', 2999, 20, 0, '[]'::jsonb
FROM products WHERE slug = 'embroidered-anarkali-kurta';

-- Chikankari Kurta Set Variants
INSERT INTO product_variants (product_id, sku, size, color, price, stock_qty, reserved_qty, images)
SELECT id, 'CKS-M-WHITE', 'M', 'White', 3499, 18, 0, '["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600"]'::jsonb
FROM products WHERE slug = 'chikankari-kurta-set';

INSERT INTO product_variants (product_id, sku, size, color, price, stock_qty, reserved_qty, images)
SELECT id, 'CKS-L-PEACH', 'L', 'Peach', 3499, 12, 0, '[]'::jsonb
FROM products WHERE slug = 'chikankari-kurta-set';

-- King Size Bedsheet Set Variants
INSERT INTO product_variants (product_id, sku, size, color, price, stock_qty, reserved_qty, images)
SELECT id, 'KBS-KING-WHITE', 'King', 'White', 1999, 25, 0, '["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600"]'::jsonb
FROM products WHERE slug = 'king-size-bedsheet-set';

INSERT INTO product_variants (product_id, sku, size, color, price, stock_qty, reserved_qty, images)
SELECT id, 'KBS-KING-BLUE', 'King', 'Royal Blue', 1999, 20, 0, '[]'::jsonb
FROM products WHERE slug = 'king-size-bedsheet-set';

-- Double Bed Comforter Variants
INSERT INTO product_variants (product_id, sku, size, color, price, stock_qty, reserved_qty, images)
SELECT id, 'DBC-DOUBLE-GREY', 'Double', 'Grey', 2999, 15, 0, '["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600"]'::jsonb
FROM products WHERE slug = 'double-bed-comforter';

-- Silk Cushion Covers Set Variants
INSERT INTO product_variants (product_id, sku, size, color, price, stock_qty, reserved_qty, images)
SELECT id, 'SCC-16-GOLD', '16x16 inch', 'Gold', 1299, 30, 0, '["https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600"]'::jsonb
FROM products WHERE slug = 'silk-cushion-covers-set';

INSERT INTO product_variants (product_id, sku, size, color, price, stock_qty, reserved_qty, images)
SELECT id, 'SCC-16-MAROON', '16x16 inch', 'Maroon', 1299, 25, 0, '[]'::jsonb
FROM products WHERE slug = 'silk-cushion-covers-set';

-- Cotton Table Runner Variants
INSERT INTO product_variants (product_id, sku, size, color, price, stock_qty, reserved_qty, images)
SELECT id, 'CTR-72-BEIGE', '72 inch', 'Beige', 799, 40, 0, '["https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600"]'::jsonb
FROM products WHERE slug = 'cotton-table-runner';

-- 5.4 Create Sample Offers
INSERT INTO offers (title, description, code, discount_type, discount_value, min_order_value, max_discount, valid_from, valid_till, active) VALUES
('Festive Season Sale', 'Get 20% off on all ethnic wear! Use code at checkout.', 'FESTIVE20', 'percentage', 20, 1000, 500, NOW(), '2025-12-31 23:59:59', true),
('First Order Discount', 'Flat ₹200 off on your first order. Welcome to Naveen Textiles!', 'WELCOME200', 'fixed', 200, 500, NULL, NOW(), NULL, true),
('Free Shipping', 'Free shipping on orders above ₹999. No code needed!', 'FREESHIP', 'fixed', 0, 999, NULL, NOW(), '2025-12-31 23:59:59', true);

-- =====================================================
-- STEP 6: VERIFICATION QUERIES
-- =====================================================

-- Check all tables
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'admin_users', COUNT(*) FROM admin_users
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'product_variants', COUNT(*) FROM product_variants
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL SELECT 'inventory_reservations', COUNT(*) FROM inventory_reservations
UNION ALL SELECT 'offers', COUNT(*) FROM offers
UNION ALL SELECT 'addresses', COUNT(*) FROM addresses;

-- =====================================================
-- IMPORTANT NOTES FOR CLERK INTEGRATION:
-- =====================================================
-- 1. Authentication is now handled by Clerk, not Supabase Auth
--    - Users will sign up/login through Clerk
--    - Clerk user data will be synced to our users table
--
-- 2. Create Storage Bucket:
--    - Go to Storage > New Bucket
--    - Name: product-images
--    - Public: Yes
--
-- 3. Storage Bucket Policy (run in SQL Editor):
--    CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
--    CREATE POLICY "Anyone can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
--    CREATE POLICY "Anyone can update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
--    CREATE POLICY "Anyone can delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');
--
-- 4. Clerk Configuration:
--    - Set up Clerk project at https://clerk.com
--    - Add Clerk keys to .env.local
--    - Configure webhooks to sync user data
--
-- 5. Database Connection String:
--    postgresql://postgres:shakthi@db.urczffuuejarmpbdqevj.supabase.co:5432/postgres
-- =====================================================
