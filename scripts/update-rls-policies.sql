-- Update RLS Policies to allow API operations
-- Run this in Supabase SQL Editor

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Product variants are viewable by everyone" ON product_variants;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Order items are viewable" ON order_items;
DROP POLICY IF EXISTS "Order items can be created" ON order_items;

-- Products: Allow all operations (for API testing)
CREATE POLICY "Products are viewable by everyone" ON products 
  FOR SELECT USING (true);

CREATE POLICY "Products can be created" ON products 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Products can be updated" ON products 
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Products can be deleted" ON products 
  FOR DELETE USING (true);

-- Product Variants: Allow all operations
CREATE POLICY "Product variants are viewable by everyone" ON product_variants 
  FOR SELECT USING (true);

CREATE POLICY "Product variants can be created" ON product_variants 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Product variants can be updated" ON product_variants 
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Product variants can be deleted" ON product_variants 
  FOR DELETE USING (true);

-- Orders: Allow all operations
CREATE POLICY "Orders are viewable" ON orders 
  FOR SELECT USING (true);

CREATE POLICY "Orders can be created" ON orders 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Orders can be updated" ON orders 
  FOR UPDATE USING (true) WITH CHECK (true);

-- Order Items: Allow all operations
CREATE POLICY "Order items are viewable" ON order_items 
  FOR SELECT USING (true);

CREATE POLICY "Order items can be created" ON order_items 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Order items can be updated" ON order_items 
  FOR UPDATE USING (true) WITH CHECK (true);

-- Inventory Reservations: Allow all operations
ALTER TABLE inventory_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reservations are viewable" ON inventory_reservations;
DROP POLICY IF EXISTS "Reservations can be created" ON inventory_reservations;
DROP POLICY IF EXISTS "Reservations can be deleted" ON inventory_reservations;

CREATE POLICY "Reservations are viewable" ON inventory_reservations 
  FOR SELECT USING (true);

CREATE POLICY "Reservations can be created" ON inventory_reservations 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Reservations can be updated" ON inventory_reservations 
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Reservations can be deleted" ON inventory_reservations 
  FOR DELETE USING (true);

-- Users table policies
DROP POLICY IF EXISTS "Users are viewable" ON users;
DROP POLICY IF EXISTS "Users can be created" ON users;

CREATE POLICY "Users are viewable" ON users 
  FOR SELECT USING (true);

CREATE POLICY "Users can be created" ON users 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can be updated" ON users 
  FOR UPDATE USING (true) WITH CHECK (true);

-- Addresses table policies
DROP POLICY IF EXISTS "Addresses are viewable" ON addresses;
DROP POLICY IF EXISTS "Addresses can be created" ON addresses;

CREATE POLICY "Addresses are viewable" ON addresses 
  FOR SELECT USING (true);

CREATE POLICY "Addresses can be created" ON addresses 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Addresses can be updated" ON addresses 
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Addresses can be deleted" ON addresses 
  FOR DELETE USING (true);
