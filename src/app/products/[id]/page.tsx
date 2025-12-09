'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { Minus, Plus, ShoppingCart, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase, DbProduct, DbProductVariant } from '@/lib/supabase';
import { Product } from '@/lib/types';
import GoogleDriveImage from '@/components/GoogleDriveImage';

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

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error: fetchError } = await supabase
          .from('products')
          .select(`*, product_variants (*)`)
          .eq('id', productId)
          .single();

        if (fetchError || !data) {
          setError(true);
          return;
        }

        const transformed = transformProduct(data);
        setProduct(transformed);
        setSelectedSize(transformed.variations[0]?.size || '');
        setSelectedColor(transformed.variations[0]?.color || '');
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-dark-400">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    notFound();
  }

  const sizes = Array.from(new Set(product.variations.map(v => v.size)));
  const colors = Array.from(new Set(product.variations.filter(v => v.size === selectedSize).map(v => v.color)));
  const currentVariation = product.variations.find(v => v.size === selectedSize && v.color === selectedColor);
  const inStock = currentVariation && currentVariation.stock > 0;

  const handleAddToCart = () => {
    if (!inStock || !currentVariation) return;
    addItem({
      productId: product.id,
      name: product.name,
      image: product.images[0],
      size: selectedSize,
      color: selectedColor,
      price: product.price,
      quantity,
      maxStock: currentVariation.stock
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="glossy-card relative aspect-square rounded-2xl overflow-hidden gold-glow">
          <GoogleDriveImage 
            src={product.images[0] || ''} 
            alt={product.name} 
            fill 
            sizes="(max-width: 768px) 100vw, 50vw" 
            className="object-cover" 
            priority 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 via-transparent to-white/5" />
        </div>

        {/* Details */}
        <div>
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gold-400 uppercase tracking-wider text-sm font-medium">{product.category}</p>
          <h1 className="text-3xl md:text-4xl font-serif text-white mt-2">{product.name}</h1>
          <p className="text-3xl font-bold mt-4 text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-primary to-gold-500">{formatPrice(product.price)}</p>
          <p className="text-dark-300 mt-6 leading-relaxed">{product.description}</p>

          <div className="h-px bg-gradient-to-r from-transparent via-dark-500 to-transparent my-6" />

          {/* Size Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-dark-200 mb-3">Size</label>
            <div className="flex flex-wrap gap-2">
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => { setSelectedSize(size); setSelectedColor(product.variations.find(v => v.size === size)?.color || ''); }}
                  className={`px-5 py-2 rounded-lg transition-all ${selectedSize === size
                    ? 'bg-gradient-to-r from-primary/20 to-gold-700/20 border border-primary/50 text-primary shadow-lg shadow-primary/10'
                    : 'glass-card text-dark-300 hover:text-white hover:border-white/20'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          {colors.length > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-dark-200 mb-3">Color</label>
              <div className="flex flex-wrap gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-5 py-2 rounded-lg transition-all ${selectedColor === color
                      ? 'bg-gradient-to-r from-primary/20 to-gold-700/20 border border-primary/50 text-primary shadow-lg shadow-primary/10'
                      : 'glass-card text-dark-300 hover:text-white hover:border-white/20'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-dark-200 mb-3">Quantity</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 glass-card rounded-lg text-dark-300 hover:text-white hover:bg-white/10 transition">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-medium text-dark-100 text-lg">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="p-3 glass-card rounded-lg text-dark-300 hover:text-white hover:bg-white/10 transition">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stock Status */}
          <p className={`text-sm mb-6 ${inStock ? 'text-green-400' : 'text-red-400'}`}>
            {inStock ? `✓ ${currentVariation?.stock} in stock` : '✗ Out of stock'}
          </p>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${added
                ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/30'
                : inStock
                  ? 'btn-glossy text-dark-900 hover:scale-[1.02]'
                  : 'bg-dark-600 text-dark-400 cursor-not-allowed'
              }`}
          >
            {added ? <><Check className="w-5 h-5" /> Added to Cart!</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
          </button>

          <Link href="/cart" className="block text-center mt-4 text-primary text-sm hover:text-primary-light transition">
            View Cart →
          </Link>
        </div>
      </div>
    </div>
  );
}
