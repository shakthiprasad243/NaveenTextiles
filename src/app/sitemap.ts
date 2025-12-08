import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://naveentextiles.store';

  // Static pages
  const staticPages = [
    '',
    '/products',
    '/cart',
    '/login',
    '/contact',
    '/faqs',
    '/shipping',
    '/returns',
    '/privacy',
    '/terms'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8
  }));

  // Category pages
  const categories = ['Men', 'Women', 'Kids', 'Home & Living'];
  const categoryPages = categories.map((cat) => ({
    url: `${baseUrl}/products?main=${encodeURIComponent(cat)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7
  }));

  // Product pages from Supabase
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const { data: products } = await supabase
      .from('products')
      .select('id, created_at')
      .eq('active', true);

    if (products) {
      productPages = products.map((product) => ({
        url: `${baseUrl}/products/${product.id}`,
        lastModified: new Date(product.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6
      }));
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  return [...staticPages, ...categoryPages, ...productPages];
}
