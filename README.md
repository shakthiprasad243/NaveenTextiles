# Naveen Textiles - E-commerce Store

Premium textile e-commerce store built with Next.js 14, Supabase, and Tailwind CSS.

**Live Site:** [https://naveentextiles.store](https://naveentextiles.store)

## Features

- 🛍️ Product catalog with categories (Men, Women, Kids, Home & Living)
- 🔍 Advanced filtering (price, color, size)
- 🛒 Shopping cart with WhatsApp checkout
- 👤 User authentication and account management
- 📦 Order tracking
- 🔐 Admin panel for product/order/user management
- 📱 Fully responsive design
- 🎨 Premium dark theme with gold accents

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Deployment:** Vercel

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/naveen-textiles.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `NEXT_PUBLIC_SITE_URL` - https://naveentextiles.store
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` - Your WhatsApp business number (with country code)
5. Click "Deploy"

### 3. Configure Custom Domain

1. In Vercel project settings, go to "Domains"
2. Add `naveentextiles.store`
3. Update your domain's DNS settings:
   - Add an A record pointing to `76.76.21.21`
   - Or add a CNAME record pointing to `cname.vercel-dns.com`

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://naveentextiles.store
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
NEXT_PUBLIC_CURRENCY=INR
CART_RESERVATION_TIMEOUT=15
```

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Admin Access

- URL: `/admin`
- Default admin: `admin@naveentextiles.com`

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── admin/          # Admin panel
│   ├── api/            # API routes
│   ├── products/       # Product pages
│   └── ...
├── components/         # React components
├── context/           # React contexts (Auth, Cart)
└── lib/               # Utilities and Supabase client
```

## License

Private - Naveen Textiles © 2024
