# Google Analytics Setup Guide

This guide will help you set up Google Analytics 4 (GA4) for your Naveen Textiles website.

## Step 1: Create a Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click "Start measuring"
4. Create an account name (e.g., "Naveen Textiles")
5. Choose your data sharing settings

## Step 2: Set up a Property

1. Enter property name: "Naveen Textiles Website"
2. Select your reporting time zone: "India Standard Time"
3. Select currency: "Indian Rupee (₹)"
4. Click "Next"

## Step 3: Choose Business Information

1. Select your industry category: "Retail/Ecommerce"
2. Select business size: Choose appropriate size
3. Select how you plan to use Analytics: "Examine user behavior"
4. Click "Create"

## Step 4: Set up Data Stream

1. Choose "Web" platform
2. Enter your website URL: `https://www.naveentextiles.online`
3. Enter stream name: "Naveen Textiles Website"
4. Click "Create stream"

## Step 5: Get Your Measurement ID

1. After creating the stream, you'll see your **Measurement ID** (starts with G-)
2. Copy this ID (e.g., `G-XXXXXXXXXX`)

## Step 6: Configure Environment Variables

### For Local Development:
Update your `.env.local` file:
```bash
# Replace G-XXXXXXXXXX with your actual Measurement ID
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### For Production (Vercel):
Add the environment variable to Vercel:
```bash
npx vercel env add NEXT_PUBLIC_GA_ID production
# Enter your Measurement ID when prompted
```

## Step 7: Deploy and Test

1. Commit and push your changes:
```bash
git add .
git commit -m "Add Google Analytics integration"
git push origin main
```

2. Deploy to Vercel:
```bash
npx vercel --prod
```

3. Test Analytics:
   - Visit your website
   - Go to Google Analytics > Reports > Realtime
   - You should see your visit in real-time

## Features Included

### Automatic Page Tracking
- All page views are automatically tracked
- Route changes in Next.js are tracked

### E-commerce Tracking
- **Add to Cart**: Tracked when items are added to cart
- **Purchase**: Can be tracked when orders are completed
- **Product Views**: Can be tracked on product pages

### Custom Events
Use the `useAnalytics` hook in your components:

```tsx
import { useAnalytics } from '@/hooks/useAnalytics';

function MyComponent() {
  const { trackEvent, trackProductView, trackAddToCartEvent } = useAnalytics();

  const handleProductClick = () => {
    trackProductView('product-123', 'Cotton Saree', 'Sarees');
  };

  const handleCustomEvent = () => {
    trackEvent('button_click', 'engagement', 'header_cta');
  };

  return (
    <button onClick={handleProductClick}>
      View Product
    </button>
  );
}
```

## Available Analytics Functions

### Basic Event Tracking
```tsx
trackEvent('action', 'category', 'label', value);
```

### E-commerce Events
```tsx
// Track product view
trackProductView(productId, productName, category);

// Track add to cart
trackAddToCartEvent(productId, productName, category, price, quantity);

// Track purchase
trackPurchaseEvent(orderId, totalValue, items);

// Track search
trackSearch(searchTerm);

// Track form submission
trackContactForm(formType);
```

## Privacy Considerations

1. **Cookie Consent**: Consider adding a cookie consent banner
2. **Data Retention**: Configure data retention settings in GA4
3. **IP Anonymization**: GA4 automatically anonymizes IP addresses
4. **GDPR Compliance**: Ensure compliance with local privacy laws

## Troubleshooting

### Analytics Not Working?
1. Check that `NEXT_PUBLIC_GA_ID` is set correctly
2. Verify the Measurement ID format (should start with G-)
3. Check browser console for errors
4. Use Google Analytics Debugger extension

### Real-time Data Not Showing?
1. Wait 24-48 hours for full data processing
2. Check that you're looking at the correct property
3. Verify the website URL matches your stream configuration

## Advanced Configuration

### Enhanced E-commerce
To track more detailed e-commerce data, you can extend the tracking functions in `src/lib/gtag.ts`.

### Custom Dimensions
Add custom dimensions in GA4 to track:
- User type (new vs returning)
- Product categories
- Geographic regions
- Device types

### Goals and Conversions
Set up goals in GA4 for:
- Newsletter signups
- Contact form submissions
- Product purchases
- WhatsApp clicks

## Support

For more information, visit:
- [Google Analytics Help Center](https://support.google.com/analytics)
- [GA4 Setup Guide](https://support.google.com/analytics/answer/9304153)
- [Next.js Analytics Documentation](https://nextjs.org/docs/basic-features/built-in-css-support#adding-a-global-stylesheet)