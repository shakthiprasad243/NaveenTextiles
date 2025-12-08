# Supabase Setup Guide for Naveen Textiles

## ✅ Integration Status: COMPLETE

The following components are now integrated with Supabase:
- ✅ Home page - fetches featured products from Supabase
- ✅ Products listing page - fetches products with filters from Supabase
- ✅ Product detail page - fetches single product from Supabase
- ✅ Checkout page - creates orders via API to Supabase
- ✅ Admin Dashboard - fetches stats from Supabase
- ✅ Admin Products - full CRUD operations with Supabase
- ✅ Admin Orders - fetches and updates orders in Supabase
- ✅ Admin Users - fetches and manages users in Supabase
- ✅ Authentication - login/register with Supabase users table

---

## Step 1: Create Tables in Supabase Dashboard

Go to your Supabase Dashboard → SQL Editor and run the following:

### Run this SQL in Supabase SQL Editor:

```sql
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

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Products (public read)
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (active = true);
CREATE POLICY "Product variants are viewable by everyone" ON product_variants FOR SELECT USING (true);

-- RLS Policies: Orders (users can create, view own)
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (true);

-- RLS Policies: Order items
CREATE POLICY "Order items are viewable" ON order_items FOR SELECT USING (true);
CREATE POLICY "Order items can be created" ON order_items FOR INSERT WITH CHECK (true);
```

## Step 2: Seed Sample Data

After creating tables, run this SQL to add sample data:

```sql
-- Insert admin user
INSERT INTO users (name, email, phone, is_admin) 
VALUES ('Admin User', 'admin@naveentextiles.com', '9876543210', true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample customer
INSERT INTO users (name, email, phone, is_admin) 
VALUES ('Ravi Kumar', 'ravi@example.com', '9876543211', false)
ON CONFLICT (email) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, slug, description, base_price, main_category, category, active) VALUES
('Classic Linen Shirt', 'classic-linen-shirt', 'Premium linen shirt, breathable and perfect for summer.', 1299, 'Men', 'Shirts', true),
('Silk Blend Saree', 'silk-blend-saree', 'Elegant silk-cotton blend saree with gold border.', 4500, 'Women', 'Sarees', true),
('Block Print Kurta', 'block-print-kurta', 'Traditional hand-block printed kurta in soft cotton.', 1899, 'Women', 'Kurtas', true),
('Cotton Fabric Roll', 'cotton-fabric-roll', 'Pure cotton fabric, ideal for custom tailoring.', 799, 'Men', 'Fabrics', true),
('Kids Ethnic Kurta Set', 'kids-ethnic-kurta-set', 'Festive kurta pajama set for boys.', 999, 'Kids', 'Boys Wear', true),
('Premium Bedsheet Set', 'premium-bedsheet-set', 'King size cotton bedsheet with 2 pillow covers.', 1299, 'Home & Living', 'Bedsheets', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert product variants
INSERT INTO product_variants (product_id, sku, size, color, stock_qty, images) 
SELECT p.id, 'shirt-s-white', 'S', 'White', 10, '["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600"]'::jsonb
FROM products p WHERE p.slug = 'classic-linen-shirt'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, sku, size, color, stock_qty, images) 
SELECT p.id, 'shirt-m-white', 'M', 'White', 8, '[]'::jsonb
FROM products p WHERE p.slug = 'classic-linen-shirt'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, sku, size, color, stock_qty, images) 
SELECT p.id, 'shirt-l-blue', 'L', 'Blue', 5, '[]'::jsonb
FROM products p WHERE p.slug = 'classic-linen-shirt'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, sku, size, color, stock_qty, images) 
SELECT p.id, 'saree-free-red', 'Free', 'Red', 4, '["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600"]'::jsonb
FROM products p WHERE p.slug = 'silk-blend-saree'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, sku, size, color, stock_qty, images) 
SELECT p.id, 'saree-free-green', 'Free', 'Green', 3, '[]'::jsonb
FROM products p WHERE p.slug = 'silk-blend-saree'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, sku, size, color, stock_qty, images) 
SELECT p.id, 'kurta-m-blue', 'M', 'Blue', 7, '["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600"]'::jsonb
FROM products p WHERE p.slug = 'block-print-kurta'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, sku, size, color, stock_qty, images) 
SELECT p.id, 'kurta-l-blue', 'L', 'Blue', 5, '[]'::jsonb
FROM products p WHERE p.slug = 'block-print-kurta'
ON CONFLICT (sku) DO NOTHING;

-- Add admin to admin_users table
INSERT INTO admin_users (user_id, role)
SELECT id, 'admin' FROM users WHERE email = 'admin@naveentextiles.com'
ON CONFLICT (user_id) DO NOTHING;
```

## Step 3: Create Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Click "New Bucket"
3. Name: `product-images`
4. Check "Public bucket"
5. Click "Create bucket"

## Step 4: Environment Variables

Your `.env.local` file should contain:

```env
NEXT_PUBLIC_SUPABASE_URL=https://vobyofrvnrzcadgocicy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_zFEeqj8XkhjP0sVj4A1niA_bmpWmch9
NEXT_PUBLIC_CURRENCY=INR
CART_RESERVATION_TIMEOUT=15
```

## Step 5: Test Connection

After setup, run the seed script:
```bash
npx tsx scripts/seed-data.ts
```

## Configuration Summary

| Resource | Status |
|----------|--------|
| Supabase URL | `https://vobyofrvnrzcadgocicy.supabase.co` |
| Storage Bucket | `product-images` (public) |
| Admin User | `admin@naveentextiles.com` |
| Currency | INR |
| Cart Timeout | 15 minutes |

## Security Notes

1. **Never expose** the `service_role` key in client code
2. Use the **anon key** for frontend operations
3. RLS policies protect data at the database level
4. Rotate keys if compromised
