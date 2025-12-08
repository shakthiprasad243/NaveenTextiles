import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import HeroCarousel from '@/components/HeroCarousel';
import { ArrowRight, Truck, Shield, MessageCircle } from 'lucide-react';
import { supabase, DbProduct, DbProductVariant } from '@/lib/supabase';
import { Product } from '@/lib/types';

const mainCategories = ['Men', 'Women', 'Kids', 'Home & Living'];

// Transform Supabase data to local Product type
function transformProduct(dbProduct: DbProduct & { product_variants: DbProductVariant[] }): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    images: dbProduct.product_variants[0]?.images || [],
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
  const { data, error } = await supabase
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
}

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <div>
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-12 -mt-8 relative z-10">
        <div className="grid grid-cols-3 gap-4 md:gap-6">
          {[
            { icon: Truck, title: 'Free Delivery', desc: 'Orders above ₹1000' },
            { icon: Shield, title: 'Quality Assured', desc: 'Handpicked fabrics' },
            { icon: MessageCircle, title: 'WhatsApp Order', desc: 'Easy checkout' }
          ].map((item, i) => (
            <div key={i} className="glass-card-gold rounded-xl p-4 md:p-6 text-center shine-effect group hover:gold-glow transition-all duration-300">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary/20 to-gold-700/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-gold-600/30 transition gold-border">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <p className="font-medium text-dark-100">{item.title}</p>
              <p className="text-xs text-dark-400 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by Category */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-serif text-dark-100 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mainCategories.map(cat => (
            <Link
              key={cat}
              href={`/products?main=${encodeURIComponent(cat)}`}
              className="glass-card-gold rounded-xl p-6 text-center hover:gold-glow transition-all group"
            >
              <p className="font-serif text-lg text-white group-hover:text-primary transition">{cat}</p>
              <p className="text-xs text-dark-400 mt-1">Explore →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gold-400 text-sm uppercase tracking-wider font-medium">Curated Selection</p>
            <h2 className="text-2xl font-serif text-dark-100 mt-1">Featured Products</h2>
          </div>
          <Link href="/products" className="text-primary text-sm font-medium flex items-center gap-1 hover:text-primary-light transition group">
            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>
        {featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
