import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function ProductCard({ product }: { product: Product }) {
  const inStock = product.variations.some(v => v.stock > 0);

  return (
    <Link href={`/products/${product.id}`} className="group glossy-card rounded-xl overflow-hidden hover:gold-glow transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-square bg-dark-500 overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {/* Glossy overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-white/5 opacity-60 group-hover:opacity-40 transition" />
        
        {!inStock && (
          <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm flex items-center justify-center">
            <span className="text-dark-200 font-medium px-4 py-2 glass-card rounded-full">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-4 relative">
        <p className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-primary to-gold-300 uppercase tracking-wider font-medium">{product.category}</p>
        <h3 className="font-medium text-dark-100 truncate mt-1 group-hover:text-white transition">{product.name}</h3>
        <p className="text-lg font-bold mt-2 text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-primary">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
