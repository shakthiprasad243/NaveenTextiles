# Clerk Production Setup Guide

Your site is currently using Clerk development keys in production, which causes warnings and has usage limits. Here's how to set up production keys:

## Step 1: Create Production Instance in Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Sign in to your account
3. Click "Create Application" or select your existing app
4. If you have a development instance, create a new **Production** instance

## Step 2: Configure Production Domain

1. In your Clerk production instance
2. Go to **Domains** in the sidebar
3. Add your production domain: `naveentextiles.online`
4. Add the www version: `www.naveentextiles.online`
5. Save the configuration

## Step 3: Get Production Keys

1. In your Clerk dashboard, go to **API Keys**
2. Make sure you're viewing the **Production** instance (not Development)
3. Copy the following keys:
   - **Publishable Key** (starts with `pk_live_`)
   - **Secret Key** (starts with `sk_live_`)

## Step 4: Update Vercel Environment Variables

Replace the development keys with production keys:

```bash
# Remove old development keys
npx vercel env rm NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
npx vercel env rm CLERK_SECRET_KEY production

# Add new production keys
echo "pk_live_YOUR_PRODUCTION_PUBLISHABLE_KEY" | npx vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
echo "sk_live_YOUR_PRODUCTION_SECRET_KEY" | npx vercel env add CLERK_SECRET_KEY production
```

## Step 5: Configure Webhooks (Optional)

If you want to sync user data with Supabase:

1. In Clerk dashboard, go to **Webhooks**
2. Create a new webhook endpoint: `https://naveentextiles.online/api/webhooks/clerk`
3. Select events: `user.created`, `user.updated`, `user.deleted`
4. Copy the webhook secret and add to Vercel:
```bash
echo "whsec_YOUR_WEBHOOK_SECRET" | npx vercel env add CLERK_WEBHOOK_SECRET production
```

## Step 6: Deploy Changes

After updating the environment variables:
```bash
npx vercel --prod
```

## Step 7: Test Production Setup

1. Visit your site: https://www.naveentextiles.online
2. Try signing up/signing in
3. Check browser console - no more development key warnings
4. Test admin access by logging in with configured admin email

## Current Status

**Development Keys (Current):**
- ✅ Working but with warnings and limits
- ⚠️ Shows "development keys" warning in console
- ⚠️ Has usage limits for production

**Production Keys (Recommended):**
- ✅ No warnings or limits
- ✅ Full production features
- ✅ Better performance and reliability

## Troubleshooting

### If login stops working after switching keys:
1. Clear browser cookies and localStorage
2. Make sure production domain is configured in Clerk
3. Check that webhook endpoint is accessible

### Admin Access:
- Admin access is automatically assigned based on email configuration
- Configured admin emails: shakthiprasad243@gmail.com
- Admin panel appears in header when logged in with admin email
- No manual admin assignment needed

## Benefits of Production Keys

- **No usage limits** - unlimited users and sessions
- **Better performance** - optimized for production
- **No console warnings** - clean browser console
- **Full feature access** - all Clerk features available
- **Better security** - production-grade security features

The site will continue working with development keys, but production keys are recommended for the best experience.