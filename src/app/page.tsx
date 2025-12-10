import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import HeroCarousel from '@/components/HeroCarousel';
import OffersSection from '@/components/OffersSection';
import { ArrowRight, Truck, Shield, MessageCircle } from 'lucide-react';
import { DbProduct, DbProductVariant, DbOffer } from '@/lib/supabase';
import { getAdminClient } from '@/lib/supabase-admin';
import { Product } from '@/lib/types';

const mainCategories = ['Men', 'Women', 'Kids', 'Home & Living'];

// Transform Supabase data to local Product type
function transformProduct(dbProduct: DbProduct & { product_variants: DbProductVariant[] }): Product {
  // Collect all unique images from all variants
  const allImages: string[] = [];
  dbProduct.product_variants.forEach(v => {
    if (v.images && Array.isArray(v.images)) {
      v.images.forEach(img => {
        if (img && !allImages.includes(img)) {
          allImages.push(img);
        }
      });
    }
  });

  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    images: allImages,
    category: dbProduct.category || '',
    mainCategory: dbProduct.main_category || '',
    price: dbProduct.base_price,
    variations: dbProduct.product_variants.map(v => ({
      size: v.size || '',
      color: v.color || '',
      stock: v.stock_qty - v.reserved_qty,
      variantId: v.id
    })),
    active: dbProduct.active
  };
}

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    // Use admin client to bypass RLS
    const client = getAdminClient();
    
    const { data, error } = await client
      .from('products')
      .select(`*, product_variants (*)`)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(4);
    
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    
    return (data || []).map(transformProduct);
  } catch (err) {
    console.error('Error fetching products:', err);
    return [];
  }
}

async function getActiveOffers(): Promise<DbOffer[]> {
  try {
    // Use admin client to bypass RLS
    const client = getAdminClient();
    const now = new Date().toISOString();
    
    const { data, error } = await client
      .from('offers')
      .select('*')
      .eq('active', true)
      .lte('valid_from', now)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (error) {
      console.error('Error fetching offers:', error);
      return [];
    }
    
    // Filter valid_till in JS
    const validOffers = (data || []).filter(offer => 
      !offer.valid_till || new Date(offer.valid_till) >= new Date()
    );
    
    return validOffers;
  } catch (err) {
    console.error('Error fetching offers:', err);
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeaturedProducts();
  const offers = await getActiveOffers();

  return (
    <div>
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Enhanced Features - Better mobile spacing */}
      <section className="max-w-6xl mx-auto px-4 py-8 md:py-12 -mt-8 md:-mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
          {[
            { icon: Truck, title: 'Free Delivery', desc: 'Orders above ₹1000', color: 'from-blue-500/20 to-blue-600/20', hoverColor: 'from-blue-500/30 to-blue-600/30' },
            { icon: Shield, title: 'Quality Assured', desc: 'Handpicked fabrics', color: 'from-primary/20 to-gold-600/20', hoverColor: 'from-primary/30 to-gold-500/30' },
            { icon: MessageCircle, title: 'WhatsApp Order', desc: 'Easy checkout', color: 'from-green-500/20 to-green-600/20', hoverColor: 'from-green-500/30 to-green-600/30' }
          ].map((item, i) => (
            <div 
              key={i} 
              className="glass-card-enhanced rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 text-center group hover:gold-glow-strong transition-all duration-300 hover-lift cursor-pointer"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-xl md:rounded-2xl bg-gradient-to-br ${item.color} group-hover:${item.hoverColor} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg`}>
                <item.icon className="w-6 h-6 md:w-8 md:h-8 text-primary group-hover:text-primary-light transition" />
              </div>
              <p className="font-bold text-dark-100 group-hover:text-white text-base md:text-lg transition">{item.title}</p>
              <p className="text-xs md:text-sm text-dark-400 group-hover:text-dark-300 mt-1 md:mt-2 transition">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Enhanced Shop by Category - Better mobile grid */}
      <section className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-6 md:mb-10">
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gold-400 text-xs md:text-sm uppercase tracking-wider font-medium">Discover</p>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif text-white mt-2">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {mainCategories.map((cat, i) => (
            <Link
              key={cat}
              href={`/products?main=${encodeURIComponent(cat)}`}
              className="group relative overflow-hidden rounded-xl md:rounded-2xl aspect-square min-h-[140px] md:min-h-0"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-dark-700 to-dark-800 group-hover:from-dark-600 group-hover:to-dark-700 transition-all duration-300" />
              
              {/* Decorative circle */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-300" />
              
              {/* Border */}
              <div className="absolute inset-0 rounded-2xl border border-primary/20 group-hover:border-primary/40 transition-all duration-300" />
              
              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-center p-4 md:p-6 text-center">
                <p className="font-serif text-lg md:text-xl lg:text-2xl text-white group-hover:text-primary transition-all duration-300 mb-1 md:mb-2">{cat}</p>
                <div className="flex items-center gap-1 text-dark-400 group-hover:text-primary text-xs md:text-sm transition-all duration-300">
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          ))}
        </div>
      </section>

      {/* Ongoing Offers */}
      {offers.length > 0 && (
        <OffersSection offers={offers} />
      )}

      {/* Featured Products - Better mobile layout */}
      <section className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-10">
          <div>
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gold-400 text-xs md:text-sm uppercase tracking-wider font-medium">Curated Selection</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif text-white mt-2">Featured Products</h2>
          </div>
          <Link href="/products" className="glass-card-gold px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-primary text-xs md:text-sm font-semibold flex items-center justify-center gap-2 hover:gold-glow transition-all group hover-lift min-h-[44px]">
            View All <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>
        {featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-card-gold rounded-xl">
            <p className="text-dark-400">No products available yet. Check back soon!</p>
          </div>
        )}
      </section>
    </div>
  );
}
