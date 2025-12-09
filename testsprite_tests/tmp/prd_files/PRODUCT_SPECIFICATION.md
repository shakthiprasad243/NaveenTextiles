# Naveen Textiles - Product Specification Document

**Version:** 3.0.0  
**Last Updated:** December 9, 2025  
**Product URL:** [https://naveentextiles.online](https://naveentextiles.online)  
**Status:** Production Ready

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Technical Architecture](#3-technical-architecture)
4. [Feature Specifications](#4-feature-specifications)
5. [Data Models](#5-data-models)
6. [User Roles & Permissions](#6-user-roles--permissions)
7. [API Specifications](#7-api-specifications)
8. [Authentication System](#8-authentication-system)
9. [Admin Panel](#9-admin-panel)
10. [Database Setup](#10-database-setup)

---

## 1. Executive Summary

### 1.1 Product Vision
Naveen Textiles is a premium e-commerce platform for textile retail with WhatsApp-integrated checkout, Supabase authentication, and comprehensive admin management.

### 1.2 Key Highlights
- **Full Supabase Integration** - Database, Auth, and Storage
- **Real-time Order Management** - Admin panel with live updates
- **WhatsApp Checkout** - Seamless ordering via WhatsApp
- **Offers & Promotions** - Coupon code management system
- **Stock Management** - Real-time inventory tracking

---

## 2. Product Overview

### 2.1 Feature Status

| Feature | Description | Status |
|---------|-------------|--------|
| Product Catalog | Browse products with images, variants, pricing | ✅ Complete |
| Product Variants | Multiple sizes, colors, stock per variant | ✅ Complete |
| Image Gallery | Multiple images per product with thumbnails | ✅ Complete |
| Similar Products | "You May Also Like" section on product pages | ✅ Complete |
| Shopping Cart | Add, remove, update cart items | ✅ Complete |
| WhatsApp Checkout | Order via WhatsApp integration | ✅ Complete |
| Supabase Auth | Email/password authentication | ✅ Complete |
| User Registration | Auto-confirmed user accounts | ✅ Complete |
| User Profile | View profile and order history | ✅ Complete |
| Order Tracking | Track orders by email/phone/order number | ✅ Complete |
| Admin Dashboard | Overview metrics and quick actions | ✅ Complete |
| Admin Products | Full CRUD for products and variants | ✅ Complete |
| Admin Orders | Order management with status updates | ✅ Complete |
| Admin Offers | Coupon code and promotion management | ✅ Complete |
| Offers Display | Homepage offers section | ✅ Complete |
| Stock Display | In Stock / Out of Stock indicators | ✅ Complete |
| Invoice Generation | PDF invoice for orders | ✅ Complete |
| Bulk Operations | Bulk delete, bulk invoice printing | ✅ Complete |
| Database Reset | API to reset and seed database | ✅ Complete |

---

## 3. Technical Architecture

### 3.1 Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Framework** | Next.js (App Router) | 14.2.x |
| **Language** | TypeScript | 5.x |
| **Database** | Supabase (PostgreSQL) | Latest |
| **Authentication** | Supabase Auth | Latest |
| **Storage** | Supabase Storage | Latest |
| **Styling** | Tailwind CSS | 3.4.x |
| **Icons** | Lucide React | Latest |
| **Hosting** | Vercel | - |

### 3.2 Directory Structure

```
src/
├── app/
│   ├── page.tsx                    # Homepage with offers
│   ├── login/page.tsx              # Auth page (login/register)
│   ├── account/
│   │   ├── page.tsx                # User dashboard
│   │   └── orders/page.tsx         # Order history
│   ├── products/
│   │   ├── page.tsx                # Product listing
│   │   └── [id]/page.tsx           # Product detail + similar products
│   ├── cart/page.tsx               # Shopping cart
│   ├── checkout/page.tsx           # Checkout with WhatsApp
│   ├── admin/
│   │   ├── page.tsx                # Admin dashboard
│   │   ├── products/page.tsx       # Product management
│   │   ├── orders/page.tsx         # Order management
│   │   ├── offers/page.tsx         # Offers management (NEW)
│   │   └── users/page.tsx          # User management
│   └── api/
│       ├── products/               # Products CRUD
│       ├── orders/                 # Orders CRUD
│       ├── offers/                 # Offers API (NEW)
│       ├── admin/orders/           # Admin orders API
│       ├── auth/
│       │   ├── register/           # User registration (NEW)
│       │   ├── login/              # User login (NEW)
│       │   └── create-admin/       # Admin creation (NEW)
│       ├── setup/                  # Database status (NEW)
│       ├── reset-database/         # Database reset (NEW)
│       └── health/                 # Health check
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   ├── OffersSection.tsx           # Homepage offers (NEW)
│   └── Invoice.tsx                 # Invoice component
├── context/
│   ├── AuthContext.tsx             # Supabase Auth (UPDATED)
│   ├── CartContext.tsx
│   └── ProductContext.tsx
└── lib/
    ├── supabase.ts                 # Supabase client + types
    ├── supabase-admin.ts           # Admin client (service role)
    ├── types.ts
    ├── utils.ts
    └── validators.ts
```

---

## 4. Feature Specifications

### 4.1 Product Detail Page

**Features:**
- Image gallery with clickable thumbnails
- Size and color selection
- Stock status (In Stock / Out of Stock)
- Add to cart with variant selection
- "You May Also Like" section showing similar products

**Similar Products Logic:**
1. First: Products from same category
2. Fallback: Products from same main category
3. Final fallback: Any active products

### 4.2 Offers System (NEW)

**Offer Types:**
| Type | Description | Example |
|------|-------------|---------|
| `percentage` | Percentage discount | 20% off |
| `fixed` | Fixed amount discount | ₹200 off |
| `bogo` | Buy one get one | Buy 2 Get 1 Free |

**Offer Fields:**
- Title, Description, Code
- Discount type and value
- Minimum order value
- Maximum discount cap
- Valid from/till dates
- Active status
- Usage limit and count

### 4.3 Stock Management

**Display:**
- Shows "In Stock" (green) or "Out of Stock" (red)
- No quantity shown to customers
- Stock decremented on order placement
- Stock restored on order cancellation/deletion

### 4.4 Order Management

**Order Statuses:**
| Status | Description |
|--------|-------------|
| PENDING | New order, awaiting confirmation |
| CONFIRMED | Order confirmed by admin |
| PACKED | Order packaged |
| SHIPPED | Order dispatched |
| DELIVERED | Order completed |
| CANCELLED | Order cancelled |

**Admin Features:**
- View all orders with filters
- Update order status
- Generate invoices (single/bulk)
- Delete orders (restores stock)
- WhatsApp quick contact

---

## 5. Data Models

### 5.1 Database Tables

| Table | Description |
|-------|-------------|
| `users` | Customer and admin accounts |
| `admin_users` | Admin role tracking |
| `addresses` | User delivery addresses |
| `products` | Product catalog |
| `product_variants` | Sizes, colors, stock, images |
| `orders` | Customer orders |
| `order_items` | Items in each order |
| `offers` | Promotional codes (NEW) |

### 5.2 Key Schemas

**Products:**
```typescript
interface DbProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  main_category: string;  // Men, Women, Home & Living
  category: string;       // Shirts, Sarees, Kurtas, etc.
  active: boolean;
  created_at: string;
}
```

**Product Variants:**
```typescript
interface DbProductVariant {
  id: string;
  product_id: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  stock_qty: number;
  reserved_qty: number;
  images: string[];       // Array of image URLs
  created_at: string;
}
```

**Offers:**
```typescript
interface DbOffer {
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
```

---

## 6. User Roles & Permissions

### 6.1 Role Matrix

| Feature | Guest | Customer | Admin |
|---------|-------|----------|-------|
| Browse Products | ✅ | ✅ | ✅ |
| Add to Cart | ✅ | ✅ | ✅ |
| Checkout | ✅ | ✅ | ✅ |
| View Account | ❌ | ✅ | ✅ |
| View Order History | ❌ | ✅ | ✅ |
| Admin Dashboard | ❌ | ❌ | ✅ |
| Manage Products | ❌ | ❌ | ✅ |
| Manage Orders | ❌ | ❌ | ✅ |
| Manage Offers | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |

---

## 7. API Specifications

### 7.1 Products API

```
GET    /api/products              # List products (paginated)
GET    /api/products/[id]         # Get single product
POST   /api/products              # Create product
PATCH  /api/products/[id]         # Update product
DELETE /api/products/[id]         # Delete product
```

### 7.2 Orders API

```
GET    /api/orders?phone=xxx      # Get orders by phone
GET    /api/orders?email=xxx      # Get orders by email
GET    /api/orders?order_number=x # Get order by number
POST   /api/orders                # Create order
DELETE /api/orders                # Delete order(s)

GET    /api/admin/orders          # Get all orders (admin)
PATCH  /api/admin/orders/[id]     # Update order status
```

### 7.3 Offers API (NEW)

```
GET    /api/offers                # Get active offers
```

### 7.4 Auth API (NEW)

```
POST   /api/auth/register         # Register new user (auto-confirm)
POST   /api/auth/login            # Login user
POST   /api/auth/create-admin     # Create admin user
```

### 7.5 Setup API (NEW)

```
GET    /api/setup                 # Check database status
POST   /api/reset-database        # Reset and seed database
       Body: { "secret": "RESET_DB_2024" }
```

---

## 8. Authentication System

### 8.1 Supabase Auth Integration

**Login Flow:**
1. User enters email/password
2. `supabase.auth.signInWithPassword()` called
3. On success, fetch user profile from `users` table
4. Check `admin_users` table for admin status
5. Set user in AuthContext

**Registration Flow:**
1. User fills registration form
2. API `/api/auth/register` called
3. Creates user in Supabase Auth (auto-confirmed)
4. Creates profile in `users` table
5. Auto-login after registration

### 8.2 Admin Credentials

```
Email: admin@naveentextiles.com
Password: Admin@123
```

---

## 9. Admin Panel

### 9.1 Dashboard (`/admin`)

**Metrics:**
- Total Products (active count)
- Pending Orders
- Low Stock Items (< 5 units)
- Total Revenue

### 9.2 Products (`/admin/products`)

- Create/Edit/Delete products
- Manage variants (size, color, stock, images)
- Toggle active status
- Unique slug generation

### 9.3 Orders (`/admin/orders`)

- View all orders with search/filter
- Update order status
- Generate invoices
- Bulk operations (delete, print)
- WhatsApp quick contact

### 9.4 Offers (`/admin/offers`) (NEW)

- Create/Edit/Delete offers
- Set discount type and value
- Configure validity dates
- Toggle active status
- Track usage

---

## 10. Database Setup

### 10.1 Initial Setup

Run the SQL script in Supabase Dashboard:
```
scripts/complete-supabase-setup.sql
```

Or use the API:
```bash
curl -X POST http://localhost:3000/api/reset-database \
  -H "Content-Type: application/json" \
  -d '{"secret":"RESET_DB_2024"}'
```

### 10.2 Seeded Data

| Data | Count |
|------|-------|
| Admin User | 1 |
| Products | 13 |
| Product Variants | 25 |
| Offers | 3 |

### 10.3 Product Categories

**Men (4 products):**
- Premium Linen Shirt
- Cotton Formal Shirt
- Silk Blend Kurta
- Cotton Casual Kurta

**Women (5 products):**
- Banarasi Silk Saree
- Kanjivaram Silk Saree
- Cotton Printed Saree
- Embroidered Anarkali Kurta
- Chikankari Kurta Set

**Home & Living (4 products):**
- King Size Bedsheet Set
- Double Bed Comforter
- Silk Cushion Covers Set
- Cotton Table Runner

### 10.4 Default Offers

| Code | Type | Value | Min Order |
|------|------|-------|-----------|
| FESTIVE20 | percentage | 20% | ₹1000 |
| WELCOME200 | fixed | ₹200 | ₹500 |
| FREESHIP | fixed | ₹0 | ₹999 |

---

## 11. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Site
NEXT_PUBLIC_SITE_URL=https://naveentextiles.online
NEXT_PUBLIC_CURRENCY=INR
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210

# Security
CRON_SECRET=xxx
```

---

## 12. Recent Updates (v3.0.0)

### New Features Added:
1. ✅ Similar Products section on product detail page
2. ✅ Image gallery with thumbnails for multiple product images
3. ✅ Offers management system (admin CRUD)
4. ✅ Homepage offers display section
5. ✅ Supabase Auth integration (replaces demo auth)
6. ✅ Auto-confirmed user registration
7. ✅ Stock display as In/Out of Stock (not quantity)
8. ✅ Stock management on order create/delete
9. ✅ Admin orders API with cache control
10. ✅ Database reset API
11. ✅ Invoice generation and printing
12. ✅ Bulk order operations

### Bug Fixes:
- Fixed orders not displaying in admin panel (RLS issues)
- Fixed orders not showing in user's My Orders section
- Fixed product images not displaying from variants
- Fixed duplicate slug error on product creation
- Fixed caching issues on API routes

---

## 13. Future Roadmap

### Phase 2 (Planned):
- [ ] Online payment integration (Razorpay)
- [ ] Email notifications
- [ ] Customer reviews and ratings
- [ ] Wishlist functionality
- [ ] Product search with autocomplete
- [ ] SMS notifications
- [ ] Multi-language support

---

*Document maintained by Naveen Textiles Development Team*
