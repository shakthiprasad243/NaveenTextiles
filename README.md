# Naveen Textiles - E-commerce Platform

A modern e-commerce platform built with Next.js 15, featuring authentication, cart management, order processing, and coupon system. Updated with latest fixes!

## Features

- 🛍️ **Product Catalog** - Browse and filter textile products
- 🛒 **Shopping Cart** - Persistent cart with localStorage
- 🎟️ **Coupon System** - Apply discount codes at checkout
- 📦 **Order Management** - Track orders and order history
- 👤 **User Authentication** - Secure login with Clerk
- 📱 **WhatsApp Integration** - Order notifications via WhatsApp
- 🔐 **Admin Panel** - Manage products, orders, and users
- 📊 **Real-time Updates** - Live inventory and order status

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Authentication**: Clerk
- **Database**: PostgreSQL (Supabase)
- **Deployment**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
```

## Database Setup

Run the SQL commands in `scripts/complete-supabase-setup.sql` in your Supabase dashboard to set up the database schema.

## Deployment

The app is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel and it will deploy automatically.

## License

MIT License