export default function ProductSkeleton() {
  return (
    <div className="border border-[#3352CC]/20 rounded-2xl overflow-hidden bg-[#0e0e0e]/80 backdrop-blur-sm h-full animate-pulse">
      {/* Image Skeleton */}
      <div className="h-48 bg-[#1A1A1D]"></div>
      
      {/* Content Skeleton */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <div className="h-6 bg-[#1A1A1D] rounded w-3/4"></div>
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-[#1A1A1D] rounded w-full"></div>
          <div className="h-4 bg-[#1A1A1D] rounded w-2/3"></div>
        </div>
        
        {/* Seller */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#1A1A1D] rounded-full"></div>
          <div className="h-3 bg-[#1A1A1D] rounded w-20"></div>
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-[#1A1A1D] rounded"></div>
            ))}
          </div>
          <div className="h-4 bg-[#1A1A1D] rounded w-16"></div>
        </div>
        
        {/* Price and Button */}
        <div className="flex items-center justify-between">
          <div className="h-8 bg-[#1A1A1D] rounded w-20"></div>
          <div className="h-8 bg-[#1A1A1D] rounded w-24"></div>
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  )
}