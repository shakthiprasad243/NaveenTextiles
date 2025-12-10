# Naveen Textiles - Product Specification Document

**Version:** 4.0.0  
**Last Updated:** December 10, 2025  
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
| **Core E-commerce** |
| Product Catalog | Browse products with images, variants, pricing | ✅ Complete |
| Product Variants | Multiple sizes, colors, stock per variant | ✅ Complete |
| Image Gallery | Multiple images per product with thumbnails | ✅ Complete |
| Similar Products | "You May Also Like" section on product pages | ✅ Complete |
| Shopping Cart | Add, remove, update cart items | ✅ Complete |
| WhatsApp Checkout | Order via WhatsApp integration | ✅ Complete |
| Product Filters | Filter by category, price, availability | ✅ Complete |
| **Authentication & Users** |
| Clerk Authentication | Modern auth with email/password, social login | ✅ Complete |
| Supabase Integration | Database sync with Clerk users | ✅ Complete |
| User Registration | Auto-confirmed user accounts | ✅ Complete |
| User Profile | View profile and order history | ✅ Complete |
| Protected Routes | Middleware-based route protection | ✅ Complete |
| **Order Management** |
| Order Tracking | Track orders by email/phone/order number | ✅ Complete |
| Order Status Updates | Real-time status tracking system | ✅ Complete |
| Invoice Generation | PDF invoice for orders | ✅ Complete |
| Bulk Operations | Bulk delete, bulk invoice printing | ✅ Complete |
| **Admin Panel** |
| Admin Dashboard | Overview metrics and quick actions | ✅ Complete |
| Admin Products | Full CRUD for products and variants | ✅ Complete |
| Admin Orders | Order management with status updates | ✅ Complete |
| Admin Offers | Coupon code and promotion management | ✅ Complete |
| Admin Users | User management and role assignment | ✅ Complete |
| Sales Reports | Analytics with CSV export functionality | ✅ Complete |
| **Content & Marketing** |
| Offers Display | Homepage offers section | ✅ Complete |
| Hero Carousel | Homepage banner carousel | ✅ Complete |
| Stock Display | In Stock / Out of Stock indicators | ✅ Complete |
| SEO Optimization | Dynamic sitemap generation | ✅ Complete |
| **Customer Support** |
| Contact Page | Contact form with WhatsApp integration | ✅ Complete |
| FAQs Page | Comprehensive FAQ section | ✅ Complete |
| Shipping Policy | Detailed shipping information | ✅ Complete |
| Returns Policy | Exchange policy and guidelines | ✅ Complete |
| Privacy Policy | GDPR-compliant privacy policy | ✅ Complete |
| Terms & Conditions | Legal terms and conditions | ✅ Complete |
| **Technical Features** |
| Database Reset | API to reset and seed database | ✅ Complete |
| Health Monitoring | API health check endpoints | ✅ Complete |
| Webhook Support | Clerk and order status webhooks | ✅ Complete |
| CRON Jobs | Automated cleanup and maintenance | ✅ Complete |
| Testing Suite | Playwright E2E tests | ✅ Complete |

---

## 3. Technical Architecture

### 3.1 Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Framework** | Next.js (App Router) | 16.0.x |
| **Language** | TypeScript | 5.x |
| **Database** | Supabase (PostgreSQL) | Latest |
| **Authentication** | Clerk | 6.36.x |
| **Storage** | Supabase Storage | Latest |
| **Styling** | Tailwind CSS | 3.4.x |
| **Icons** | Lucide React, React Icons | Latest |
| **Testing** | Playwright, Jest | Latest |
| **Hosting** | Vercel | - |

### 3.2 Directory Structure

```
src/
├── app/
│   ├── page.tsx                    # Homepage with hero carousel & offers
│   ├── login/page.tsx              # Clerk login page
│   ├── register/page.tsx           # Clerk registration page
│   ├── account/
│   │   ├── page.tsx                # User dashboard
│   │   └── orders/page.tsx         # Order history
│   ├── products/
│   │   ├── page.tsx                # Product listing with filters
│   │   └── [id]/page.tsx           # Product detail + similar products
│   ├── cart/page.tsx               # Shopping cart
│   ├── checkout/page.tsx           # Checkout with WhatsApp
│   ├── track-order/page.tsx        # Order tracking page
│   ├── contact/page.tsx            # Contact form with WhatsApp
│   ├── faqs/page.tsx               # FAQ section
│   ├── shipping/page.tsx           # Shipping policy
│   ├── returns/page.tsx            # Returns/exchange policy
│   ├── privacy/page.tsx            # Privacy policy
│   ├── terms/page.tsx              # Terms & conditions
│   ├── admin/
│   │   ├── page.tsx                # Admin dashboard
│   │   ├── products/page.tsx       # Product management
│   │   ├── orders/page.tsx         # Order management
│   │   ├── offers/page.tsx         # Offers management
│   │   ├── users/page.tsx          # User management
│   │   └── sales/page.tsx          # Sales reports & analytics
│   ├── sitemap.ts                  # Dynamic sitemap generation
│   └── api/
│       ├── products/               # Products CRUD
│       ├── orders/                 # Orders CRUD
│       ├── offers/                 # Offers API
│       ├── admin/
│       │   ├── orders/             # Admin orders API
│       │   ├── users/              # Admin users API
│       │   └── run-migrations/     # Database migrations
│       ├── auth/
│       │   └── create-admin/       # Admin creation
│       ├── webhooks/
│       │   ├── clerk/              # Clerk user sync webhook
│       │   └── order-status/       # Order status webhook
│       ├── cron/
│       │   └── cleanup-reservations/ # Automated cleanup
│       ├── setup/                  # Database status
│       ├── reset-database/         # Database reset
│       └── health/                 # Health check
├── components/
│   ├── Header.tsx                  # Navigation header
│   ├── Footer.tsx                  # Site footer
│   ├── ProductCard.tsx             # Product display card
│   ├── ProductFilters.tsx          # Product filtering
│   ├── OffersSection.tsx           # Homepage offers
│   ├── HeroCarousel.tsx            # Homepage banner carousel
│   ├── GoogleDriveImage.tsx        # Google Drive image component
│   └── Invoice.tsx                 # Invoice component
├── context/
│   ├── AuthContext.tsx             # Clerk Auth context
│   ├── CartContext.tsx             # Shopping cart state
│   └── ProductContext.tsx          # Product data context
└── lib/
    ├── supabase.ts                 # Supabase client + types
    ├── supabase-admin.ts           # Admin client (service role)
    ├── types.ts                    # TypeScript definitions
    ├── utils.ts                    # Utility functions
    └── validators.ts               # Data validation
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

### 7.3 Offers API

```
GET    /api/offers                # Get active offers
```

### 7.4 Admin APIs

```
GET    /api/admin/orders          # Get all orders (admin)
PATCH  /api/admin/orders/[id]     # Update order status
GET    /api/admin/users           # Get all users (admin)
POST   /api/admin/run-migrations  # Run database migrations
POST   /api/auth/create-admin     # Create admin user
```

### 7.5 Webhook APIs

```
POST   /api/webhooks/clerk        # Clerk user sync webhook
POST   /api/webhooks/order-status # Order status update webhook
```

### 7.6 System APIs

```
GET    /api/health                # Health check endpoint
GET    /api/setup                 # Check database status
POST   /api/reset-database        # Reset and seed database
       Body: { "secret": "RESET_DB_2024" }
POST   /api/cron/cleanup-reservations # Cleanup expired reservations
```

---

## 8. Authentication System

### 8.1 Clerk Authentication Integration

**Login Flow:**
1. User clicks Sign In button
2. Clerk modal opens with login form
3. User enters email/password or uses social login
4. Clerk handles authentication and JWT tokens
5. Webhook syncs user data to Supabase `users` table
6. Check `admin_users` table for admin status
7. Redirect to appropriate dashboard

**Registration Flow:**
1. User clicks Sign Up button
2. Clerk modal opens with registration form
3. User fills registration details
4. Clerk creates user account (auto-confirmed)
5. Webhook creates profile in Supabase `users` table
6. Auto-login after registration

**Protected Routes:**
- `/admin/*` - Admin only
- `/account/*` - Authenticated users only
- `/checkout/*` - Authenticated users only

### 8.2 Webhook Integration

**Clerk Webhook (`/api/webhooks/clerk`):**
- Syncs user creation/updates to Supabase
- Handles user.created, user.updated events
- Creates corresponding records in `users` table

### 8.3 Admin Credentials

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

### 9.4 Offers (`/admin/offers`)

- Create/Edit/Delete offers
- Set discount type and value
- Configure validity dates
- Toggle active status
- Track usage

### 9.5 Users (`/admin/users`)

- View all registered users
- Manage user roles and permissions
- View user order history
- User account management

### 9.6 Sales Reports (`/admin/sales`)

- Date range filtering
- Status-based filtering
- Sales analytics and metrics
- CSV export (summary and detailed)
- Revenue tracking and trends

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

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://naveentextiles.online
NEXT_PUBLIC_CURRENCY=INR
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210

# Security
CRON_SECRET=xxx
```

---

## 12. Recent Updates (v4.0.0)

### Major Features Added:
1. ✅ **Clerk Authentication Integration** - Modern auth system with social login
2. ✅ **Sales Reports & Analytics** - Comprehensive sales dashboard with CSV export
3. ✅ **Customer Support Pages** - Contact, FAQs, Shipping, Returns, Privacy, Terms
4. ✅ **Order Tracking System** - Track orders by number, phone, or email
5. ✅ **Hero Carousel** - Homepage banner carousel for promotions
6. ✅ **Product Filters** - Advanced filtering by category, price, availability
7. ✅ **SEO Optimization** - Dynamic sitemap generation
8. ✅ **Webhook System** - Clerk user sync and order status webhooks
9. ✅ **CRON Jobs** - Automated cleanup and maintenance tasks
10. ✅ **Testing Suite** - Comprehensive Playwright E2E tests
11. ✅ **User Management** - Admin panel for user role management
12. ✅ **Google Drive Images** - Support for Google Drive image hosting

### Technical Improvements:
- ✅ Upgraded to Next.js 16.0.x
- ✅ Implemented middleware-based route protection
- ✅ Added comprehensive error handling
- ✅ Improved database query optimization
- ✅ Enhanced mobile responsiveness
- ✅ Added health monitoring endpoints

### Bug Fixes:
- Fixed authentication flow and user sync
- Improved page load performance
- Fixed image loading issues
- Enhanced error handling across all APIs
- Improved mobile navigation experience

---

## 13. Future Roadmap

### Phase 2 (Planned):
- [ ] Online payment integration (Razorpay/Stripe)
- [ ] Email notifications for orders
- [ ] Customer reviews and ratings system
- [ ] Wishlist functionality
- [ ] Advanced product search with autocomplete
- [ ] SMS notifications for order updates
- [ ] Multi-language support (Hindi, Gujarati)
- [ ] Inventory management alerts
- [ ] Customer loyalty program
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Social media integration

---

## 14. Testing & Quality Assurance

### 14.1 Test Coverage

**Playwright E2E Tests:**
- ✅ API endpoint testing (9/9 passing)
- ✅ Basic functionality tests (10/10 passing)
- ✅ Mobile responsiveness testing
- ✅ Authentication flow testing
- ✅ Database connectivity testing
- ⚠️ Products page performance optimization needed

**Test Categories:**
- API validation and error handling
- User interface functionality
- Authentication and authorization
- Database operations
- Mobile responsiveness
- Performance benchmarking

### 14.2 Performance Metrics

| Component | Load Time | Status |
|-----------|-----------|---------|
| Homepage | 2-3s | ✅ Good |
| Products API | 1-2s | ✅ Good |
| Products Page | 10-30s | ⚠️ Needs optimization |
| Product Detail | 3-5s | ✅ Acceptable |
| Authentication | <1s | ✅ Excellent |

### 14.3 Quality Standards

- **Code Quality:** TypeScript strict mode, ESLint configuration
- **Security:** Clerk authentication, protected routes, input validation
- **Performance:** Next.js optimization, image optimization, caching
- **Accessibility:** Semantic HTML, ARIA labels, keyboard navigation
- **SEO:** Dynamic sitemap, meta tags, structured data

---

*Document maintained by Naveen Textiles Development Team*
