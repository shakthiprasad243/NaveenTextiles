import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/account(.*)',
  '/checkout(.*)',
]);

const isPublicApiRoute = createRouteMatcher([
  '/api/health',              // Public health check
  '/api/offers',              // Public offers
  '/api/products(.*)',        // Public product operations (including by ID)
  '/api/setup',               // Public setup
  '/api/reset-database',      // Public reset (with secret)
  '/api/webhooks(.*)',        // Public webhooks
  '/api/cron(.*)',            // Public cron jobs
  '/api/orders(.*)',          // Allow public access for testing (consider removing in production)
  '/api/auth(.*)',            // Public auth endpoints
  '/api/debug(.*)',           // Public debug endpoints for testing
]);

const isAdminApiRoute = createRouteMatcher([
  '/api/admin(.*)',           // Admin API routes that should be protected
]);

// Special handling for admin routes in test mode
const shouldProtectAdminInTest = process.env.PROTECT_ADMIN_IN_TEST === 'true';

// Check if we're in test mode
const isTestMode = process.env.NODE_ENV === 'test' || process.env.SKIP_AUTH === 'true';

export default clerkMiddleware(async (auth, req) => {
  // Skip authentication for public API routes
  if (isPublicApiRoute(req)) {
    return;
  }
  
  // Handle admin API routes
  if (isAdminApiRoute(req)) {
    // In test mode, only protect admin routes if explicitly requested
    if (isTestMode && !shouldProtectAdminInTest) {
      return;
    }
    // Otherwise protect admin routes
    await auth.protect();
    return;
  }
  
  // Skip authentication in test mode for other routes
  if (isTestMode) {
    return;
  }
  
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};