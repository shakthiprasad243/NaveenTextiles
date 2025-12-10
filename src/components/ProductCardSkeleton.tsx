export default function ProductCardSkeleton() {
  return (
    <div className="glossy-card rounded-2xl overflow-hidden">
      {/* Image skeleton */}
      <div className="aspect-square bg-dark-600 skeleton" />
      
      {/* Content skeleton */}
      <div className="p-4 md:p-5 space-y-3">
        {/* Category */}
        <div className="h-3 w-20 skeleton rounded" />
        
        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 w-full skeleton rounded" />
          <div className="h-4 w-3/4 skeleton rounded" />
        </div>
        
        {/* Colors */}
        <div className="flex gap-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-5 h-5 rounded-full skeleton" />
          ))}
        </div>
        
        {/* Price */}
        <div className="h-6 w-24 skeleton rounded" />
      </div>
    </div>
  );
}