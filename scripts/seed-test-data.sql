-- Seed test data for API testing
-- Run this in Supabase SQL Editor after updating RLS policies

-- Insert sample products if they don't exist
INSERT INTO products (name, slug, description, base_price, main_category, category, active) VALUES
('Test Linen Shirt', 'test-linen-shirt', 'Premium linen shirt for testing.', 1299, 'Men', 'Shirts', true),
('Test Silk Saree', 'test-silk-saree', 'Elegant silk saree for testing.', 4500, 'Women', 'Sarees', true),
('Test Cotton Kurta', 'test-cotton-kurta', 'Traditional cotton kurta for testing.', 1899, 'Women', 'Kurtas', true),
('Test Bedsheet Set', 'test-bedsheet-set', 'King size bedsheet for testing.', 1299, 'Home & Living', 'Bedsheets', true)
ON CONFLICT (slug) DO UPDATE SET active = true;

-- Insert product variants for each product
INSERT INTO product_variants (product_id, sku, size, color, stock_qty, reserved_qty, images) 
SELECT p.id, 'test-shirt-s-white', 'S', 'White', 50, 0, '["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600"]'::jsonb
FROM products p WHERE p.slug = 'test-linen-shirt'
ON CONFLICT (sku) DO UPDATE SET stock_qty = 50;

INSERT INTO product_variants (product_id, sku, size, color, stock_qty, reserved_qty, images) 
SELECT p.id, 'test-shirt-m-blue', 'M', 'Blue', 30, 0, '[]'::jsonb
FROM products p WHERE p.slug = 'test-linen-shirt'
ON CONFLICT (sku) DO UPDATE SET stock_qty = 30;

INSERT INTO product_variants (product_id, sku, size, color, stock_qty, reserved_qty, images) 
SELECT p.id, 'test-saree-free-red', 'Free', 'Red', 20, 0, '["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600"]'::jsonb
FROM products p WHERE p.slug = 'test-silk-saree'
ON CONFLICT (sku) DO UPDATE SET stock_qty = 20;

INSERT INTO product_variants (product_id, sku, size, color, stock_qty, reserved_qty, images) 
SELECT p.id, 'test-kurta-m-green', 'M', 'Green', 25, 0, '["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600"]'::jsonb
FROM products p WHERE p.slug = 'test-cotton-kurta'
ON CONFLICT (sku) DO UPDATE SET stock_qty = 25;

INSERT INTO product_variants (product_id, sku, size, color, stock_qty, reserved_qty, images) 
SELECT p.id, 'test-bedsheet-king-white', 'King', 'White', 15, 0, '[]'::jsonb
FROM products p WHERE p.slug = 'test-bedsheet-set'
ON CONFLICT (sku) DO UPDATE SET stock_qty = 15;

-- Verify the data
SELECT 
  p.name, 
  p.slug, 
  p.active,
  COUNT(pv.id) as variant_count,
  SUM(pv.stock_qty) as total_stock
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
WHERE p.slug LIKE 'test-%'
GROUP BY p.id, p.name, p.slug, p.active;
