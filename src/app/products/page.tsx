'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import ProductFilters from '@/components/ProductFilters';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Package, ChevronDown, Loader2, X } from 'lucide-react';
import { supabase, DbProduct, DbProductVariant } from '@/lib/supabase';
import { Product } from '@/lib/types';

// Partial product type for optimized query
interface PartialDbProduct {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  category: string | null;
  main_category: string | null;
  active: boolean;
  product_variants: Array<{
    id: string;
    size: string | null;
    color: string | null;
    stock_qty: number;
    reserved_qty: number;
    images: string[];
  }>;
}

// Transform Supabase data to local Product type
function transformProduct(dbProduct: PartialDbProduct): Product {
  // Get first available image from variants
  const firstVariantWithImage = dbProduct.product_variants?.find(v => v.images?.length > 0);
  
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    images: firstVariantWithImage?.images || [],
    category: dbProduct.category || '',
    mainCategory: dbProduct.main_category || '',
    price: dbProduct.base_price,
    variations: (dbProduct.product_variants || []).map(v => ({
      size: v.size || '',
      color: v.color || '',
      stock: (v.stock_qty || 0) - (v.reserved_qty || 0)
    })),
    active: dbProduct.active
  };
}

const mainCategories = ['Men', 'Women', 'Kids', 'Home & Living'];
const subCategoriesMap: Record<string, string[]> = {
  'Men': ['Shirts', 'Pants', 'Trousers', 'Kurtas', 'Ethnic Wear', 'Fabrics', 'Jeans', 'T-Shirts', 'Jackets'],
  'Women': ['Sarees', 'Kurtas', 'Dress Materials', 'Dupattas', 'Blouses', 'Lehengas', 'Salwar Suits', 'Tops', 'Pants', 'Skirts'],
  'Kids': ['Boys Wear', 'Girls Wear', 'School Uniforms', 'Ethnic Kids', 'T-Shirts', 'Pants', 'Dresses'],
  'Home & Living': ['Bedsheets', 'Curtains', 'Cushion Covers', 'Table Linen', 'Towels', 'Blankets', 'Pillow Covers']
};

// Loading fallback component
function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20 flex flex-col items-center justify-center">
      <Loader2 className="w-8 h-8 lg:w-10 lg:h-10 text-primary animate-spin mb-3 lg:mb-4" />
      <p className="text-dark-400 text-sm lg:text-base">Loading products...</p>
    </div>
  );
}

// Main products content component
function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mainCategory = searchParams.get('main');
  const subCategory = searchParams.get('sub');
  const category = searchParams.get('category');
  const searchQuery = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Fetch products from Supabase with timeout
  useEffect(() => {
    let isCancelled = false;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        // Build query - only select needed fields for faster response
        let query = supabase
          .from('products')
          .select(`id, name, description, base_price, category, main_category, active, product_variants (id, size, color, stock_qty, reserved_qty, images)`)
          .eq('active', true);

        if (mainCategory) {
          query = query.eq('main_category', mainCategory);
        }
        if (subCategory || category) {
          query = query.eq('category', subCategory || category);
        }
        
        // Add search filter using ilike for case-insensitive search
        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`);
        }

        // Add limit for better performance
        const { data, error: fetchError } = await query
          .order('created_at', { ascending: false })
          .limit(50);

        if (isCancelled) return;

        if (fetchError) throw fetchError;

        const transformedProducts = (data || []).map(transformProduct);
        setProducts(transformedProducts);
      } catch (err) {
        if (isCancelled) return;
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchProducts();

    return () => {
      isCancelled = true;
    };
  }, [mainCategory, subCategory, category, searchQuery]);



  // const categories = mainCategories;
  const subCategories = subCategoriesMap;

  // Filter states
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState({ min: 0, max: 50000 });
  const [sortBy, setSortBy] = useState('featured');

  // Products are already filtered by category from Supabase query
  const categoryFiltered = useMemo(() => {
    return products.filter(p => p.active);
  }, [products]);

  // Extract available filters from category-filtered products
  const { availableColors, availableSizes, priceRange } = useMemo(() => {
    const colors = new Set<string>();
    const sizes = new Set<string>();
    let minPrice = Infinity;
    let maxPrice = 0;

    categoryFiltered.forEach(product => {
      product.variations.forEach(v => {
        colors.add(v.color);
        sizes.add(v.size);
      });
      if (product.price < minPrice) minPrice = product.price;
      if (product.price > maxPrice) maxPrice = product.price;
    });

    return {
      availableColors: Array.from(colors).sort(),
      availableSizes: Array.from(sizes).sort((a, b) => {
        const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2-3Y', '4-5Y', '6-7Y', 'Free', 'King', '5m'];
        return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
      }),
      priceRange: { min: minPrice === Infinity ? 0 : minPrice, max: maxPrice || 50000 }
    };
  }, [categoryFiltered]);

  // Apply additional filters and sorting
  const filteredProducts = useMemo(() => {
    let filtered = [...categoryFiltered];

    // Filter by colors (case-insensitive)
    if (selectedColors.length > 0) {
      const lowerColors = selectedColors.map(c => c.toLowerCase());
      filtered = filtered.filter(p =>
        p.variations.some(v => lowerColors.includes(v.color.toLowerCase()))
      );
    }

    // Filter by sizes (case-insensitive)
    if (selectedSizes.length > 0) {
      const lowerSizes = selectedSizes.map(s => s.toLowerCase());
      filtered = filtered.filter(p =>
        p.variations.some(v => lowerSizes.includes(v.size.toLowerCase()))
      );
    }

    // Filter by price range
    filtered = filtered.filter(p =>
      p.price >= selectedPriceRange.min && p.price <= selectedPriceRange.max
    );

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-az':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        filtered.reverse();
        break;
      default:
        break;
    }

    return filtered;
  }, [categoryFiltered, selectedColors, selectedSizes, selectedPriceRange, sortBy]);

  const handleClearAll = () => {
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedPriceRange({ min: priceRange.min, max: priceRange.max });
  };

  // Get page title
  let pageTitle = 'All Products';
  if (subCategory) pageTitle = subCategory;
  else if (mainCategory) pageTitle = mainCategory;
  else if (category) pageTitle = category;

  // Get available subcategories for current main category
  const availableSubCategories = mainCategory ? subCategories[mainCategory] || [] : [];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="mb-6 md:mb-8 space-y-2 md:space-y-3">
          <div className="h-3 md:h-4 w-24 md:w-32 skeleton rounded" />
          <div className="h-6 md:h-8 w-36 md:w-48 skeleton rounded" />
        </div>
        
        {/* Category pills skeleton */}
        <div className="flex gap-2 md:gap-3 mb-3 md:mb-4 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 md:h-10 w-16 md:w-24 skeleton rounded-full flex-shrink-0" />
          ))}
        </div>

        {/* Mobile filter button skeleton */}
        <div className="lg:hidden mb-4">
          <div className="h-12 w-full skeleton rounded-lg" />
        </div>
        
        {/* Products grid skeleton - Mobile optimized */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20 text-center">
        <Package className="w-12 h-12 lg:w-16 lg:h-16 text-dark-300 mx-auto mb-3 lg:mb-4" />
        <p className="text-dark-300 text-base lg:text-lg mb-2">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-glossy px-4 lg:px-6 py-2.5 rounded-lg text-xs lg:text-sm font-medium text-dark-900 mt-4">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Enhanced Page Header - Better mobile spacing */}
      <div className="mb-6 md:mb-8">
        <p className="text-primary text-xs md:text-sm uppercase tracking-wider font-bold">
          Browse Collection
        </p>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-white mt-2 mb-2">{pageTitle}</h1>
        {products.length > 0 && (
          <p className="text-dark-400 text-xs md:text-sm">
            Showing {filteredProducts.length} of {categoryFiltered.length} products
          </p>
        )}
      </div>



      {/* Main Category Pills - Better mobile scroll */}
      <div className="flex gap-2 md:gap-3 overflow-x-auto pb-3 md:pb-4 mb-3 md:mb-4 scrollbar-hide -mx-4 px-4">
        <Link
          href="/products"
          className={`flex-shrink-0 px-4 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm transition-all min-h-[40px] md:min-h-[44px] flex items-center ${!mainCategory && !category
              ? 'btn-glossy text-dark-900 font-medium'
              : 'glass-card-gold text-dark-200 hover:text-primary'
            }`}
        >
          All
        </Link>
        {mainCategories.map(cat => (
          <Link
            key={cat}
            href={`/products?main=${encodeURIComponent(cat)}`}
            className={`flex-shrink-0 px-4 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm transition-all min-h-[40px] md:min-h-[44px] flex items-center whitespace-nowrap ${mainCategory === cat
                ? 'btn-glossy text-dark-900 font-medium'
                : 'glass-card-gold text-dark-200 hover:text-primary'
              }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Sub Category Pills - Better mobile scroll */}
      {mainCategory && availableSubCategories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 md:pb-4 mb-4 md:mb-6 scrollbar-hide -mx-4 px-4">
          <Link
            href={`/products?main=${encodeURIComponent(mainCategory)}`}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs transition-all ${!subCategory
                ? 'bg-primary/20 text-primary gold-border'
                : 'glass-card text-dark-300 hover:text-primary'
              }`}
          >
            All {mainCategory}
          </Link>
          {availableSubCategories.map(sub => (
            <Link
              key={sub}
              href={`/products?main=${encodeURIComponent(mainCategory)}&sub=${encodeURIComponent(sub)}`}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs transition-all ${subCategory === sub
                  ? 'bg-primary/20 text-primary gold-border'
                  : 'glass-card text-dark-300 hover:text-primary'
                }`}
            >
              {sub}
            </Link>
          ))}
        </div>
      )}

      {/* Mobile Filter Button - At the top for better accessibility */}
      <div className="lg:hidden mb-4">
        <MobileFilterSheet
          availableColors={availableColors}
          availableSizes={availableSizes}
          priceRange={priceRange}
          selectedColors={selectedColors}
          selectedSizes={selectedSizes}
          selectedPriceRange={selectedPriceRange}
          sortBy={sortBy}
          onColorChange={setSelectedColors}
          onSizeChange={setSelectedSizes}
          onPriceChange={setSelectedPriceRange}
          onSortChange={setSortBy}
          onClearAll={handleClearAll}
          totalProducts={categoryFiltered.length}
          filteredCount={filteredProducts.length}
        />
      </div>

      {/* Main Content - Sidebar + Products Grid */}
      <div className="lg:flex lg:gap-6">
        {/* Left Sidebar Filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <ProductFilters
            availableColors={availableColors}
            availableSizes={availableSizes}
            priceRange={priceRange}
            selectedColors={selectedColors}
            selectedSizes={selectedSizes}
            selectedPriceRange={selectedPriceRange}
            onColorChange={setSelectedColors}
            onSizeChange={setSelectedSizes}
            onPriceChange={setSelectedPriceRange}
            onClearAll={handleClearAll}
            totalProducts={categoryFiltered.length}
            filteredCount={filteredProducts.length}
          />
        </aside>

        {/* Products Section */}
        <div className="lg:flex-1 lg:min-w-0">
          {/* Sort Bar - Simplified on mobile */}
          <div className="flex items-center justify-between mb-4 lg:mb-6 pb-3 lg:pb-4 border-b border-dark-700/50">
            <p className="text-dark-400 text-xs lg:text-sm">
              Showing <span className="text-dark-200 font-medium">{filteredProducts.length}</span> products
            </p>
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-dark-400 text-sm">Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none glass-card pl-4 pr-10 py-2 rounded-lg text-dark-200 text-sm bg-transparent border border-primary/20 focus:border-primary/50 outline-none cursor-pointer"
                >
                  <option value="featured" className="bg-dark-800">Featured</option>
                  <option value="newest" className="bg-dark-800">Newest</option>
                  <option value="price-low" className="bg-dark-800">Price: Low to High</option>
                  <option value="price-high" className="bg-dark-800">Price: High to Low</option>
                  <option value="name-az" className="bg-dark-800">Name: A to Z</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Products Grid with stagger animation - Optimized mobile grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
              {filteredProducts.map((product, index) => (
                <div 
                  key={product.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${(index % 12) * 0.05}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 lg:py-20 glass-card-gold rounded-xl mx-2 lg:mx-0">
              <Package className="w-12 h-12 lg:w-16 lg:h-16 text-dark-300 mx-auto mb-3 lg:mb-4" />
              <p className="text-dark-300 text-base lg:text-lg mb-2">No products found</p>
              <p className="text-dark-300 text-xs lg:text-sm mb-4 lg:mb-6 px-4">Try adjusting your filters or browse all products</p>
              <button
                onClick={handleClearAll}
                className="btn-glossy px-4 lg:px-6 py-2.5 rounded-lg text-xs lg:text-sm font-medium text-dark-900"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}


// Mobile Filter Sheet Component
function MobileFilterSheet({
  availableColors,
  availableSizes,
  priceRange,
  selectedColors,
  selectedSizes,
  selectedPriceRange,
  sortBy,
  onColorChange,
  onSizeChange,
  onPriceChange,
  onSortChange,
  onClearAll,
  totalProducts,
  filteredCount
}: {
  availableColors: string[];
  availableSizes: string[];
  priceRange: { min: number; max: number };
  selectedColors: string[];
  selectedSizes: string[];
  selectedPriceRange: { min: number; max: number };
  sortBy: string;
  onColorChange: (colors: string[]) => void;
  onSizeChange: (sizes: string[]) => void;
  onPriceChange: (range: { min: number; max: number }) => void;
  onSortChange: (sort: string) => void;
  onClearAll: () => void;
  totalProducts: number;
  filteredCount: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = selectedColors.length + selectedSizes.length +
    (selectedPriceRange.min > priceRange.min || selectedPriceRange.max < priceRange.max ? 1 : 0);

  const handleColorToggle = (color: string) => {
    if (selectedColors.includes(color)) {
      onColorChange(selectedColors.filter(c => c !== color));
    } else {
      onColorChange([...selectedColors, color]);
    }
  };

  const handleSizeToggle = (size: string) => {
    if (selectedSizes.includes(size)) {
      onSizeChange(selectedSizes.filter(s => s !== size));
    } else {
      onSizeChange([...selectedSizes, size]);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full glass-card-gold px-4 py-3 rounded-lg text-sm font-medium text-dark-200 hover:text-primary border border-primary/20 hover:border-primary/40 transition-all flex items-center justify-center gap-2 min-h-[48px]"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span>Filters & Sort</span>
        {activeFiltersCount > 0 && (
          <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sheet */}
      <div className={`fixed inset-y-0 left-0 w-full max-w-sm bg-dark-800 z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-dark-700">
            <div>
              <h3 className="text-primary font-medium text-lg">Filters & Sort</h3>
              <p className="text-dark-300 text-sm">{filteredCount} of {totalProducts} products</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-2 text-dark-400 hover:text-white rounded-lg hover:bg-dark-700 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close filters"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Sort */}
            <div>
              <h4 className="text-dark-200 font-medium text-sm mb-3">Sort By</h4>
              <div className="space-y-2">
                {[
                  { value: 'featured', label: 'Featured' },
                  { value: 'newest', label: 'Newest' },
                  { value: 'price-low', label: 'Price: Low to High' },
                  { value: 'price-high', label: 'Price: High to Low' },
                  { value: 'name-az', label: 'Name: A to Z' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onSortChange(option.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      sortBy === option.value ? 'bg-primary/20 text-primary' : 'text-dark-300 hover:bg-dark-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <h4 className="text-dark-200 font-medium text-sm mb-3">Price Range</h4>
              <div className="space-y-2">
                {[
                  { label: 'Under ₹1,000', min: 0, max: 1000 },
                  { label: '₹1,000 - ₹2,000', min: 1000, max: 2000 },
                  { label: '₹2,000 - ₹5,000', min: 2000, max: 5000 },
                  { label: 'Above ₹5,000', min: 5000, max: 50000 }
                ].map((range) => (
                  <button
                    key={range.label}
                    onClick={() => onPriceChange({ min: range.min, max: range.max })}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${selectedPriceRange.min === range.min && selectedPriceRange.max === range.max
                        ? 'bg-primary/20 text-primary'
                        : 'text-dark-300 hover:bg-dark-700'
                      }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <h4 className="text-dark-200 font-medium text-sm mb-3">Colors</h4>
              <div className="space-y-2">
                {availableColors.map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorToggle(color)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${selectedColors.includes(color)
                        ? 'bg-primary/20 text-primary'
                        : 'text-dark-300 hover:bg-dark-700'
                      }`}
                  >
                    <span className="w-4 h-4 rounded-full border border-dark-500" style={{ backgroundColor: getColorHex(color) }} />
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h4 className="text-dark-200 font-medium text-sm mb-3">Sizes</h4>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map(size => (
                  <button
                    key={size}
                    onClick={() => handleSizeToggle(size)}
                    className={`px-4 py-2 rounded-lg text-sm transition ${selectedSizes.includes(size)
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'glass-card text-dark-300'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-dark-700 flex gap-3">
            <button
              onClick={onClearAll}
              className="flex-1 py-4 rounded-lg text-sm text-dark-300 border border-dark-600 hover:border-dark-500 transition min-h-[48px] flex items-center justify-center"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 btn-glossy py-4 rounded-lg text-sm font-medium text-dark-900 min-h-[48px] flex items-center justify-center"
            >
              Show Results ({filteredCount})
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function getColorHex(colorName: string): string {
  const colors: Record<string, string> = {
    'White': '#FFFFFF',
    'Blue': '#3B82F6',
    'Light Blue': '#93C5FD',
    'Red': '#EF4444',
    'Green': '#22C55E',
    'Pink': '#EC4899',
    'Yellow': '#EAB308',
    'Gold': '#D4AF37',
    'Floral': '#F472B6',
    'Plain': '#9CA3AF',
    'Blue Floral': '#60A5FA'
  };
  return colors[colorName] || '#9CA3AF';
}

// Main page component with Suspense wrapper
export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>
  );
}
