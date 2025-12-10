# Clerk Development Setup Guide

You're currently getting a Clerk error because you're using production keys in your local development environment. Here's how to fix it:

## The Problem
Production Clerk keys (starting with `pk_live_` and `sk_live_`) are restricted to work only on the production domain `naveentextiles.online`. They won't work on `localhost:3000`.

## The Solution
You need to use development keys for local development.

## Step 1: Get Development Keys from Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Sign in to your account
3. **Important**: Make sure you're in the **Development** instance (not Production)
   - Look for a dropdown or toggle that says "Development" vs "Production"
   - If you only see production, create a new Development instance
4. Go to **API Keys** in the sidebar
5. Copy these keys:
   - **Publishable Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`)

## Step 2: Update Your .env.local File

Replace the placeholder values in your `.env.local` file:

```bash
# Replace these lines:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_DEVELOPMENT_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_test_YOUR_DEVELOPMENT_SECRET_KEY
CLERK_WEBHOOK_SECRET=whsec_YOUR_DEVELOPMENT_WEBHOOK_SECRET

# With your actual development keys:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_[your_actual_key_here]
CLERK_SECRET_KEY=sk_test_[your_actual_key_here]
CLERK_WEBHOOK_SECRET=whsec_[your_actual_key_here]  # Optional for local dev
```

## Step 3: Restart Your Development Server

After updating the keys:
```bash
npm run dev
```

## Key Differences

| Environment | Key Type | Domain Restriction | Usage |
|-------------|----------|-------------------|--------|
| **Development** | `pk_test_`, `sk_test_` | None (works on localhost) | Local development |
| **Production** | `pk_live_`, `sk_live_` | Restricted to naveentextiles.online | Live website |

## Current Status: Authentication Disabled

✅ **Your app is now running without authentication errors!**

I've temporarily disabled Clerk authentication so you can test the app. The app will work normally but without user login/signup functionality.

### What's Currently Happening:
- Clerk keys are commented out in `.env.local`
- `SKIP_AUTH=true` is enabled
- App runs without authentication
- All pages work normally (products, cart, etc.)
- Login/signup pages will be non-functional

### To Enable Authentication:
Uncomment and replace the keys in `.env.local`:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_[your_actual_key]
CLERK_SECRET_KEY=sk_test_[your_actual_key]
CLERK_WEBHOOK_SECRET=whsec_[your_actual_key]
```

## Troubleshooting

### If you don't have a Development instance:
1. In Clerk Dashboard, click "Create Application"
2. Choose "Development" environment
3. Configure it for your local development

### If login stops working after switching:
1. Clear browser cookies and localStorage
2. Make sure you're using the correct development keys
3. Restart your development server

### Still getting errors?
- Double-check that keys start with `pk_test_` and `sk_test_`
- Make sure there are no extra spaces in the .env.local file
- Verify you're in the Development instance in Clerk Dashboard

## Benefits of Development Keys

- ✅ Work on localhost and any domain
- ✅ No domain restrictions
- ✅ Separate user database from production
- ✅ Safe for testing and development
- ✅ No risk of affecting production users

Once you update with the correct development keys, the error should disappear and authentication will work properly in your local environment.