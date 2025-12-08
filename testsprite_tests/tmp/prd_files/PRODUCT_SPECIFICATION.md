# Naveen Textiles - Product Specification Document

**Version:** 1.0.0  
**Last Updated:** December 8, 2025  
**Product URL:** [https://naveentextiles.store](https://naveentextiles.store)  
**Repository:** [github.com/shakthiprasad243/NaveenTextiles](https://github.com/shakthiprasad243/NaveenTextiles)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Technical Architecture](#3-technical-architecture)
4. [Feature Specifications](#4-feature-specifications)
5. [Data Models](#5-data-models)
6. [User Roles & Permissions](#6-user-roles--permissions)
7. [API Specifications](#7-api-specifications)
8. [User Interface Design](#8-user-interface-design)
9. [Third-Party Integrations](#9-third-party-integrations)
10. [Performance & Scalability](#10-performance--scalability)
11. [Security Specifications](#11-security-specifications)
12. [Deployment & Infrastructure](#12-deployment--infrastructure)
13. [Future Roadmap](#13-future-roadmap)

---

## 1. Executive Summary

### 1.1 Product Vision
Naveen Textiles is a premium e-commerce platform designed specifically for a textile retail business. The platform enables customers to browse, filter, and purchase textile products through an intuitive interface with WhatsApp-integrated checkout for a seamless purchasing experience tailored to the Indian market.

### 1.2 Business Objectives
- Provide a modern, mobile-first e-commerce experience for textile shopping
- Integrate WhatsApp for order communication and customer support
- Enable efficient inventory and order management for store administrators
- Support multiple product categories including Men, Women, Kids, and Home & Living
- Deliver a premium dark-themed UI with gold accents reflecting brand identity

### 1.3 Target Audience
- **Primary:** Indian consumers looking for quality textiles and fabrics
- **Secondary:** Bulk buyers and small business owners
- **Demographics:** Age 18-55, primarily urban and semi-urban areas
- **Geographic Focus:** India (with INR currency support)

---

## 2. Product Overview

### 2.1 Core Value Proposition
- **Curated Selection:** Handpicked premium textiles across multiple categories
- **Easy Ordering:** WhatsApp-based checkout for familiar, convenient ordering
- **Quality Assurance:** Focus on premium fabrics and materials
- **Free Delivery:** Complimentary shipping for orders above ₹1000

### 2.2 Key Features Summary

| Feature | Description | Status |
|---------|-------------|--------|
| Product Catalog | Browse products with images, variants, pricing | ✅ Complete |
| Advanced Filtering | Filter by category, price, color, size | ✅ Complete |
| Shopping Cart | Add, remove, update cart items | ✅ Complete |
| WhatsApp Checkout | Order via WhatsApp integration | ✅ Complete |
| User Authentication | Login, registration, profile management | ✅ Complete |
| Order Tracking | Track order status | ✅ Complete |
| Admin Dashboard | Product, order, user management | ✅ Complete |
| Responsive Design | Mobile-first design approach | ✅ Complete |

---

## 3. Technical Architecture

### 3.1 Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Framework** | Next.js (App Router) | 14.2.x |
| **Runtime** | Node.js | 18.x+ |
| **Language** | TypeScript | 5.x |
| **Database** | Supabase (PostgreSQL) | Latest |
| **Styling** | Tailwind CSS | 3.4.x |
| **Icons** | Lucide React | 0.400.x |
| **State Management** | React Context API | - |
| **Hosting** | Vercel | - |

### 3.2 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Browser   │  │   Mobile    │  │   Tablet    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Next.js App Router                      │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │  │
│  │  │  Pages  │  │Components│  │ Context │  │  Hooks  │       │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Next.js API Routes                       │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │  │
│  │  │ /orders  │  │/products │  │ /webhooks│                 │  │
│  │  └──────────┘  └──────────┘  └──────────┘                 │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      Supabase                              │  │
│  │  ┌──────┐  ┌──────────┐  ┌────────┐  ┌─────────┐         │  │
│  │  │Users │  │ Products │  │ Orders │  │Addresses│         │  │
│  │  └──────┘  └──────────┘  └────────┘  └─────────┘         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌───────────────┐  ┌───────────────┐                           │
│  │    WhatsApp   │  │    Vercel     │                           │
│  │   Business    │  │   (Hosting)   │                           │
│  └───────────────┘  └───────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Directory Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx            # Root layout with providers
│   ├── page.tsx              # Homepage
│   ├── globals.css           # Global styles
│   ├── account/              # User account pages
│   │   ├── page.tsx          # Account dashboard
│   │   ├── addresses/        # Address management
│   │   └── orders/           # Order history
│   ├── admin/                # Admin panel pages
│   │   ├── layout.tsx        # Admin layout with auth check
│   │   ├── page.tsx          # Admin dashboard
│   │   ├── orders/           # Order management
│   │   ├── products/         # Product management
│   │   └── users/            # User management
│   ├── api/                  # API routes
│   │   ├── orders/           # Order endpoints
│   │   ├── products/         # Product endpoints
│   │   ├── webhooks/         # Webhook handlers
│   │   └── cron/             # Scheduled tasks
│   ├── cart/                 # Shopping cart page
│   ├── checkout/             # Checkout flow
│   ├── contact/              # Contact page
│   ├── faqs/                 # FAQs page
│   ├── login/                # Authentication
│   ├── products/             # Product listing & details
│   │   ├── page.tsx          # Product listing
│   │   └── [id]/             # Product detail page
│   └── [static pages]/       # Terms, Privacy, Returns, Shipping
├── components/               # Reusable UI components
│   ├── Header.tsx            # Navigation header
│   ├── Footer.tsx            # Site footer
│   ├── HeroCarousel.tsx      # Homepage carousel
│   ├── ProductCard.tsx       # Product display card
│   └── ProductFilters.tsx    # Filter sidebar
├── context/                  # React Context providers
│   ├── AuthContext.tsx       # Authentication state
│   ├── CartContext.tsx       # Shopping cart state
│   └── ProductContext.tsx    # Product data state
└── lib/                      # Utility functions & types
    ├── data.ts               # Static/demo data
    ├── supabase.ts           # Supabase client & queries
    ├── types.ts              # TypeScript interfaces
    └── utils.ts              # Helper functions
```

---

## 4. Feature Specifications

### 4.1 Product Catalog

#### 4.1.1 Product Listing Page
- **URL Pattern:** `/products`, `/products?main=Men`, `/products?sub=Sarees`
- **Features:**
  - Grid display (2 columns mobile, 4 columns desktop)
  - Category navigation with mega menu
  - Real-time filtering without page reload
  - Product count display
  - Loading states with spinners

#### 4.1.2 Filtering System
| Filter Type | Options | Implementation |
|-------------|---------|----------------|
| Main Category | Men, Women, Kids, Home & Living | URL parameter |
| Sub Category | Dynamic based on main category | URL parameter |
| Price Range | Min-Max slider | Client-side |
| Color | Available colors from products | Client-side |
| Size | XS, S, M, L, XL, XXL, Free, etc. | Client-side |
| Sort | Featured, Price Low-High, Price High-Low, Name A-Z, Newest | Client-side |

#### 4.1.3 Product Detail Page
- **URL Pattern:** `/products/[id]`
- **Features:**
  - Image gallery with thumbnails
  - Size selection with availability indicator
  - Color selection with visual swatches
  - Quantity selector (1-10)
  - Add to cart functionality
  - Stock availability display
  - Related products section

### 4.2 Shopping Cart

#### 4.2.1 Cart Management
| Action | Description | Validation |
|--------|-------------|------------|
| Add Item | Add product with size/color/quantity | Stock check |
| Remove Item | Remove specific variant from cart | - |
| Update Quantity | Change item quantity | Max 10 per item |
| Clear Cart | Remove all items | Confirmation |

#### 4.2.2 Cart State
```typescript
interface CartItem {
  productId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
}
```

### 4.3 Checkout Flow

#### 4.3.1 Checkout Process
```
1. Cart Review
   └── Verify items, quantities, and totals

2. Customer Information
   ├── Full Name (required)
   ├── Phone Number (required, 10 digits)
   └── Email (optional)

3. Shipping Address
   ├── Address Line 1 (required)
   ├── Address Line 2 (optional)
   ├── City (required)
   ├── State (required)
   └── Postal Code (required)

4. Order Confirmation
   ├── Generate Order Number (NT-XXXXXX)
   ├── Create Order in Database
   ├── Reserve Inventory
   └── Open WhatsApp with Order Details

5. WhatsApp Completion
   └── Customer confirms order via WhatsApp
```

#### 4.3.2 Pricing Rules
| Rule | Condition | Value |
|------|-----------|-------|
| Shipping Fee | Order < ₹1000 | ₹50 |
| Free Shipping | Order ≥ ₹1000 | ₹0 |
| Payment Method | Default | Cash on Delivery (COD) |

### 4.4 User Authentication

#### 4.4.1 Authentication Flow
- **Login:** Email + Password authentication
- **Registration:** Name, Email, Phone, Password
- **Session:** localStorage-based persistence
- **Demo Accounts:**
  - Admin: `admin@naveentextiles.com` / `admin123`
  - User: `ravi@example.com` / `user123`

#### 4.4.2 User Profile
- View and edit personal information
- View order history
- Manage delivery addresses
- Admin panel access (for admin users)

### 4.5 Admin Panel

#### 4.5.1 Dashboard (`/admin`)
- **Metrics:**
  - Total Products (with active count)
  - Pending Orders
  - Low Stock Items (< 5 units)
  - Total Revenue
- **Widgets:**
  - Recent Orders list
  - Low Stock Alert list

#### 4.5.2 Product Management (`/admin/products`)
| Operation | Description |
|-----------|-------------|
| Create | Add new product with variants |
| Read | View product list with filters |
| Update | Edit product details and variants |
| Delete | Remove product (soft delete) |
| Toggle Active | Enable/disable product visibility |

#### 4.5.3 Order Management (`/admin/orders`)
| Status | Description | Actions |
|--------|-------------|---------|
| PENDING | New order awaiting confirmation | Confirm, Cancel |
| CONFIRMED | Order confirmed by admin | Pack |
| PACKED | Order packaged for shipping | Ship |
| SHIPPED | Order dispatched | Deliver |
| DELIVERED | Order completed | - |
| CANCELLED | Order cancelled | - |

#### 4.5.4 User Management (`/admin/users`)
- View all registered users
- Toggle admin privileges
- View user orders
- Search and filter users

---

## 5. Data Models

### 5.1 Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│    users     │       │     products     │       │    orders    │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)          │       │ id (PK)      │
│ name         │       │ name             │       │ order_number │
│ email        │       │ slug             │       │ user_id (FK) │
│ phone        │       │ description      │       │ customer_name│
│ is_admin     │       │ base_price       │       │ customer_phone│
│ created_at   │       │ main_category    │       │ shipping_addr│
└──────────────┘       │ category         │       │ total        │
       │               │ active           │       │ status       │
       │               │ created_at       │       │ created_at   │
       ▼               └──────────────────┘       └──────────────┘
┌──────────────┐              │                          │
│  addresses   │              ▼                          ▼
├──────────────┤       ┌──────────────────┐       ┌──────────────┐
│ id (PK)      │       │product_variants  │       │ order_items  │
│ user_id (FK) │       ├──────────────────┤       ├──────────────┤
│ label        │       │ id (PK)          │◄──────│ id (PK)      │
│ line1        │       │ product_id (FK)  │       │ order_id (FK)│
│ line2        │       │ sku              │       │ variant_id   │
│ city         │       │ size             │       │ product_name │
│ state        │       │ color            │       │ qty          │
│ postal_code  │       │ price            │       │ unit_price   │
│ country      │       │ stock_qty        │       │ line_total   │
└──────────────┘       │ reserved_qty     │       └──────────────┘
                       │ images           │
                       └──────────────────┘
```

### 5.2 Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Products Table
```sql
CREATE TABLE products (
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
```

#### Product Variants Table
```sql
CREATE TABLE product_variants (
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
```

#### Orders Table
```sql
CREATE TABLE orders (
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
```

#### Order Items Table
```sql
CREATE TABLE order_items (
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
```

### 5.3 TypeScript Interfaces

```typescript
// Product Types
interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  category: string;
  mainCategory?: string;
  price: number;
  variations: ProductVariation[];
  active: boolean;
}

interface ProductVariation {
  size: string;
  color: string;
  stock: number;
  variantId?: string;
}

// Order Types
type OrderStatus = 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
}

interface OrderItem {
  productId: string;
  productName: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
}

// User Types
interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  isAdmin?: boolean;
  createdAt: Date;
}
```

---

## 6. User Roles & Permissions

### 6.1 Role Definitions

| Role | Description | Access Level |
|------|-------------|--------------|
| Guest | Unauthenticated visitor | Browse, Cart, Checkout |
| Customer | Registered user | Guest + Account, Order History |
| Admin | Store administrator | Customer + Admin Panel |

### 6.2 Permission Matrix

| Feature | Guest | Customer | Admin |
|---------|-------|----------|-------|
| Browse Products | ✅ | ✅ | ✅ |
| View Product Details | ✅ | ✅ | ✅ |
| Add to Cart | ✅ | ✅ | ✅ |
| Checkout | ✅ | ✅ | ✅ |
| View Account | ❌ | ✅ | ✅ |
| View Order History | ❌ | ✅ | ✅ |
| Manage Addresses | ❌ | ✅ | ✅ |
| Admin Dashboard | ❌ | ❌ | ✅ |
| Manage Products | ❌ | ❌ | ✅ |
| Manage Orders | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |

---

## 7. API Specifications

### 7.1 Orders API

#### Create Order
```
POST /api/orders
Content-Type: application/json

Request Body:
{
  "customer_name": "string (required)",
  "customer_phone": "string (required)",
  "customer_email": "string (optional)",
  "shipping_address": {
    "line1": "string",
    "line2": "string",
    "city": "string",
    "state": "string",
    "postal_code": "string",
    "country": "string"
  },
  "items": [
    {
      "product_variant_id": "string",
      "product_name": "string",
      "size": "string",
      "color": "string",
      "qty": "number",
      "unit_price": "number"
    }
  ],
  "payment_method": "string (default: COD)"
}

Response (201):
{
  "success": true,
  "order": { ... },
  "whatsapp_url": "string"
}
```

#### Get Orders
```
GET /api/orders?phone={phone}
GET /api/orders?order_number={orderNumber}

Response (200):
{
  "orders": [ ... ]
}
// or
{
  "order": { ... }
}
```

### 7.2 Products API

#### Get Products
```
GET /api/products
GET /api/products?main_category={category}
GET /api/products?category={subCategory}

Response (200):
{
  "products": [ ... ]
}
```

#### Get Product by ID
```
GET /api/products/{id}

Response (200):
{
  "product": { ... }
}
```

### 7.3 Order Status Update API

```
PATCH /api/orders/{id}/status
Content-Type: application/json

Request Body:
{
  "status": "CONFIRMED" | "PACKED" | "SHIPPED" | "DELIVERED" | "CANCELLED"
}

Response (200):
{
  "success": true,
  "order": { ... }
}
```

---

## 8. User Interface Design

### 8.1 Design System

#### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Primary (Gold) | `#D4AF37` | Accents, CTAs, Highlights |
| Primary Light | `#E5C158` | Hover states |
| Primary Dark | `#B8860B` | Active states |
| Dark 900 | `#0A0A0A` | Background |
| Dark 800 | `#1A1A1A` | Cards |
| Dark 700 | `#2A2A2A` | Elevated surfaces |
| Dark 100 | `#F5F5F5` | Primary text |
| Dark 400 | `#9CA3AF` | Secondary text |

#### Typography
| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 | Serif | 3rem | Bold |
| H2 | Serif | 2rem | Bold |
| H3 | Sans | 1.5rem | Semibold |
| Body | Sans | 1rem | Regular |
| Small | Sans | 0.875rem | Regular |
| Caption | Sans | 0.75rem | Regular |

#### Component Classes
```css
/* Glassmorphism Card */
.glass-card {
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Gold Accent Card */
.glass-card-gold {
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(212, 175, 55, 0.2);
}

/* Glossy Button */
.btn-glossy {
  background: linear-gradient(to bottom right, #E5C158, #D4AF37);
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
}
```

### 8.2 Responsive Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| Mobile | < 640px | Smartphones |
| Tablet | 640px - 1024px | Tablets |
| Desktop | > 1024px | Desktop/Laptop |

### 8.3 Key UI Components

1. **Header** - Sticky navigation with mega menu, cart icon, user menu
2. **Hero Carousel** - Auto-rotating promotional banners
3. **Product Card** - Image, name, price, quick-add functionality
4. **Product Filters** - Collapsible sidebar with filter options
5. **Cart Drawer** - Side panel showing cart items
6. **Footer** - Links, contact info, social media

---

## 9. Third-Party Integrations

### 9.1 Supabase
- **Purpose:** Backend-as-a-Service (PostgreSQL database)
- **Features Used:**
  - Database (PostgreSQL)
  - Real-time subscriptions (future)
  - Row-level security policies
- **Configuration:**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 9.2 WhatsApp Business
- **Purpose:** Order communication and checkout completion
- **Integration Method:** WhatsApp Web URL scheme
- **Message Format:**
```
🛍️ *NEW ORDER* - Naveen Textiles

📋 *Order:* NT-XXXXXX
👤 *Customer:* {name}
📞 *Phone:* {phone}

🏠 *Delivery Address:*
{address}

📦 *Items:*
1. {product} - {size}/{color}
   Qty: {qty} × ₹{price} = ₹{total}

💰 *Order Total:* ₹{grandTotal}
🚚 *Shipping:* {shipping}
💵 *Payment:* COD

Please confirm this order. Thank you! 🙏
```

### 9.3 Vercel
- **Purpose:** Hosting and deployment
- **Features:**
  - Automatic deployments from GitHub
  - Edge functions
  - Analytics
  - Custom domain support

---

## 10. Performance & Scalability

### 10.1 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | < 1.5s | TBD |
| Largest Contentful Paint | < 2.5s | TBD |
| Time to Interactive | < 3.5s | TBD |
| Cumulative Layout Shift | < 0.1 | TBD |
| Lighthouse Score | > 90 | TBD |

### 10.2 Optimization Strategies

1. **Image Optimization**
   - Next.js Image component with automatic optimization
   - WebP format support
   - Lazy loading for off-screen images

2. **Code Splitting**
   - Automatic page-level code splitting
   - Dynamic imports for heavy components

3. **Caching**
   - Static page generation where possible
   - Incremental Static Regeneration (ISR)
   - Browser caching headers

4. **Database**
   - Indexed queries
   - Connection pooling
   - Query optimization

### 10.3 Scalability Considerations

- Serverless architecture (Vercel Functions)
- CDN for static assets
- Database connection limits monitoring
- Rate limiting for API endpoints

---

## 11. Security Specifications

### 11.1 Authentication Security
- Password hashing (bcrypt, future implementation)
- Session management via localStorage (to be upgraded to HTTP-only cookies)
- CSRF protection via Next.js

### 11.2 Data Protection
- HTTPS enforcement
- Input validation and sanitization
- SQL injection prevention via Supabase client
- XSS prevention via React's default escaping

### 11.3 API Security
- Rate limiting (to be implemented)
- Request validation
- Error message sanitization

### 11.4 Infrastructure Security
- Environment variables for secrets
- Vercel's built-in DDoS protection
- Supabase Row Level Security policies

---

## 12. Deployment & Infrastructure

### 12.1 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `NEXT_PUBLIC_SITE_URL` | Production URL | Yes |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp business number | Yes |
| `NEXT_PUBLIC_CURRENCY` | Currency code (INR) | No |
| `CART_RESERVATION_TIMEOUT` | Cart timeout in minutes | No |

### 12.2 Deployment Process

```bash
# Local Development
npm install
npm run dev          # Start dev server at localhost:3000

# Production Build
npm run build        # Build for production
npm start            # Start production server

# Deployment to Vercel
git push origin main # Auto-deploys to Vercel
```

### 12.3 Domain Configuration
- **Primary Domain:** `naveentextiles.store`
- **DNS Configuration:**
  - A Record → `76.76.21.21`
  - CNAME → `cname.vercel-dns.com`

---

## 13. Future Roadmap

### 13.1 Phase 2 Features (Q1 2026)
- [ ] Online payment integration (Razorpay/Stripe)
- [ ] Email notifications (order confirmation, shipping updates)
- [ ] Customer reviews and ratings
- [ ] Wishlist functionality
- [ ] Product search with autocomplete

### 13.2 Phase 3 Features (Q2 2026)
- [ ] Inventory alerts and auto-reorder
- [ ] Discount codes and promotions
- [ ] Bulk ordering for B2B customers
- [ ] Multi-language support (Hindi, Tamil)
- [ ] PWA support for mobile app experience

### 13.3 Phase 4 Features (Q3 2026)
- [ ] AI-powered product recommendations
- [ ] Virtual try-on for fabrics
- [ ] Loyalty points program
- [ ] Advanced analytics dashboard
- [ ] Integration with shipping partners (Delhivery, Shiprocket)

---

## Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| COD | Cash on Delivery |
| SKU | Stock Keeping Unit |
| Variant | Product variation (size/color combination) |
| ISR | Incremental Static Regeneration |
| RLS | Row Level Security (Supabase) |

### B. References

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

### C. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Dec 8, 2025 | Initial release |

---

**Document Prepared By:** Development Team  
**Reviewed By:** -  
**Approved By:** -

*This document is subject to updates as the product evolves.*
