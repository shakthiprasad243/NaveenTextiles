'use client';

import Link from 'next/link';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import GoogleDriveImage from './GoogleDriveImage';
import { ShoppingCart, Eye } from 'lucide-react';

export default function ProductCard({ product }: { product: Product }) {
  const inStock = product.variations.some(v => v.stock > 0);
  const colors = [...new Set(product.variations.map(v => v.color))].slice(0, 4);

  return (
    <Link 
      href={`/products/${product.id}`} 
      className="group block"
    >
      <div className="glossy-card rounded-2xl overflow-hidden hover:gold-glow-strong transition-all duration-300 hover-lift">
        {/* Image Container */}
        <div className="relative aspect-square bg-dark-500 overflow-hidden">
          <GoogleDriveImage
            src={product.images[0] || ''}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          
          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/20 to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-300" />
          
          {/* Shine effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          {/* Quick action buttons - show on hover */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={(e) => {
                e.preventDefault();
                // Quick view functionality can be added here
              }}
              className="w-10 h-10 rounded-full glass-card-gold flex items-center justify-center text-primary hover:bg-primary hover:text-dark-900 transition-all hover:scale-110"
              aria-label="Quick view"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
          
          {/* Stock status */}
          {!inStock && (
            <div className="absolute inset-0 bg-dark-900/85 backdrop-blur-sm flex items-center justify-center">
              <span className="glass-card-gold text-dark-200 font-semibold px-5 py-2.5 rounded-full border border-primary/30">
                Out of Stock
              </span>
            </div>
          )}
          
          {/* New badge (can be conditional based on product data) */}
          <div className="absolute top-3 left-3">
            <span className="badge text-xs px-3 py-1">New</span>
          </div>
        </div>
        
        {/* Product Info - Responsive height container */}
        <div className="p-3 md:p-4 lg:p-5 relative min-h-[180px] md:min-h-[200px] flex flex-col">
          {/* Category - Fixed height */}
          <div className="h-4 md:h-5 mb-2">
            <p className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-primary via-gold-400 to-primary uppercase tracking-wider font-bold truncate">
              {product.category || product.mainCategory}
            </p>
          </div>
          
          {/* Product Name - Responsive height */}
          <h3 className="font-semibold text-dark-100 group-hover:text-white transition-colors duration-300 line-clamp-2 h-10 md:h-12 text-sm md:text-base lg:text-lg mb-2 md:mb-3 leading-tight">
            {product.name}
          </h3>
          
          {/* Color swatches - Responsive */}
          <div className="h-6 md:h-8 flex items-center gap-1 md:gap-1.5 mb-2 md:mb-3">
            {colors.length > 0 && (
              <>
                {colors.slice(0, 3).map((color, i) => (
                  <div 
                    key={i}
                    className="w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-dark-600 group-hover:border-dark-500 transition-colors"
                    style={{ backgroundColor: getColorHex(color) }}
                    title={color}
                  />
                ))}
                {colors.length > 3 && (
                  <span className="text-xs text-dark-400 ml-1">+{colors.length - 3}</span>
                )}
              </>
            )}
          </div>
          
          {/* Spacer to push price to bottom */}
          <div className="flex-1" />
          
          {/* Price and CTA - Fixed at bottom */}
          <div className="flex items-center justify-between h-8 md:h-10">
            <div>
              <p className="text-lg md:text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-primary to-gold-400 leading-none">
                {formatPrice(product.price)}
              </p>
            </div>
            
            {inStock && (
              <div className="opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-gold-500 flex items-center justify-center text-dark-900 hover:scale-110 transition-transform">
                  <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Helper function for color swatches
function getColorHex(colorName: string): string {
  const colors: Record<string, string> = {
    'White': '#FFFFFF',
    'Black': '#000000',
    'Blue': '#3B82F6',
    'Light Blue': '#93C5FD',
    'Red': '#EF4444',
    'Green': '#22C55E',
    'Pink': '#EC4899',
    'Yellow': '#EAB308',
    'Gold': '#D4AF37',
    'Orange': '#F97316',
    'Purple': '#A855F7',
    'Brown': '#92400E',
    'Gray': '#6B7280',
    'Beige': '#D4C5B9',
    'Cream': '#FFF8DC',
    'Navy': '#1E3A8A',
    'Maroon': '#7F1D1D'
  };
  return colors[colorName] || '#9CA3AF';
}
