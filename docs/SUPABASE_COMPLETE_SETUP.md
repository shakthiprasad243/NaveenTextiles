# Supabase Complete Setup Guide

## Database Schema

### Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `users` | Customer and admin accounts | id, name, email, phone, is_admin |
| `admin_users` | Admin role tracking | id, user_id, role |
| `addresses` | User delivery addresses | id, user_id, line1, line2, city, state, postal_code |
| `products` | Product catalog | id, name, slug, description, base_price, main_category, category, active |
| `product_variants` | Product sizes/colors/stock | id, product_id, sku, size, color, price, stock_qty, reserved_qty, images |
| `orders` | Customer orders | id, order_number, customer_name, customer_phone, customer_email, shipping_address, total, status |
| `order_items` | Items in each order | id, order_id, product_variant_id, product_name, size, color, qty, unit_price |
| `offers` | Promotional codes/discounts | id, title, description, code, discount_type, discount_value, active |

### Order Status Values
- `PENDING` - Order placed, awaiting confirmation
- `CONFIRMED` - Order confirmed by admin
- `PACKED` - Order packed and ready
- `SHIPPED` - Order shipped
- `DELIVERED` - Order delivered
- `CANCELLED` - Order cancelled

### Discount Types (Offers)
- `percentage` - Percentage discount (e.g., 20% off)
- `fixed` - Fixed amount discount (e.g., ₹200 off)
- `bogo` - Buy one get one free

## Authentication

### Supabase Auth
- Uses Supabase's built-in authentication
- Email/password login
- Session management via `onAuthStateChange`

### Admin Credentials
- Email: `admin@naveentextiles.com`
- Password: `Admin@123`

## API Endpoints

### Products
- `GET /api/products` - List all products with variants
- `GET /api/products/[id]` - Get single product
- `POST /api/products` - Create product (admin)
- `PATCH /api/products/[id]` - Update product (admin)
- `DELETE /api/products/[id]` - Delete product (admin)

### Orders
- `GET /api/orders?phone=xxx` - Get orders by phone
- `GET /api/orders?email=xxx` - Get orders by email
- `GET /api/orders?order_number=xxx` - Get order by number
- `POST /api/orders` - Create new order
- `DELETE /api/orders` - Delete order(s)

### Admin Orders
- `GET /api/admin/orders` - Get all orders (admin)
- `PATCH /api/admin/orders/[id]` - Update order status (admin)

### Offers
- `GET /api/offers` - Get active offers

### Auth
- `POST /api/auth/create-admin` - Create admin user in Supabase Auth

### Setup
- `GET /api/setup` - Check database status
- `POST /api/reset-database` - Reset and seed database (requires secret)

## Storage

### Bucket: `product-images`
- Public bucket for product images
- Images stored as: `{product-slug}/{timestamp}.{ext}`

## Row Level Security (RLS)

All tables have RLS enabled with permissive policies for:
- SELECT (read)
- INSERT (create)
- UPDATE (modify)
- DELETE (remove)

## Current Data

### Products (13 total)
- **Men (4)**: Premium Linen Shirt, Cotton Formal Shirt, Silk Blend Kurta, Cotton Casual Kurta
- **Women (5)**: Banarasi Silk Saree, Kanjivaram Silk Saree, Cotton Printed Saree, Embroidered Anarkali Kurta, Chikankari Kurta Set
- **Home & Living (4)**: King Size Bedsheet Set, Double Bed Comforter, Silk Cushion Covers Set, Cotton Table Runner

### Product Variants (25 total)
Each product has 1-4 variants with different sizes, colors, and stock quantities.

### Offers (3 total)
1. **FESTIVE20** - 20% off on orders above ₹1000 (max ₹500 discount)
2. **WELCOME200** - Flat ₹200 off on orders above ₹500
3. **FREESHIP** - Free shipping on orders above ₹999

## Reset Database

To completely reset the database:

```bash
curl -X POST http://localhost:3000/api/reset-database \
  -H "Content-Type: application/json" \
  -d '{"secret":"RESET_DB_2024"}'
```

This will:
1. Clear all existing data
2. Create admin user
3. Create 13 products with 25 variants
4. Create 3 offers
5. Create admin in Supabase Auth

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://vobyofrvnrzcadgocicy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
```
