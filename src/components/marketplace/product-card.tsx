'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, Eye, ShoppingCart, Heart, Zap, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import VerifiedBadge from '@/components/global/verified-badge'

type Props = {
  product: any
}

export default function ProductCard({ product }: Props) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const categoryColors = {
    AUTOMATION_TEMPLATE: 'from-blue-500 to-blue-600',
    AI_PROMPT_PACK: 'from-purple-500 to-purple-600',
    KEYWORD_LIST: 'from-green-500 to-green-600',
    ANALYTICS_TEMPLATE: 'from-orange-500 to-orange-600',
    INTEGRATION_CONFIG: 'from-pink-500 to-pink-600',
  }

  const categoryIcons = {
    AUTOMATION_TEMPLATE: Zap,
    AI_PROMPT_PACK: Star,
    KEYWORD_LIST: TrendingUp,
    ANALYTICS_TEMPLATE: Eye,
    INTEGRATION_CONFIG: ShoppingCart,
  }

  const CategoryIcon = categoryIcons[product.category as keyof typeof categoryIcons] || Zap
  const categoryColor = categoryColors[product.category as keyof typeof categoryColors] || 'from-gray-500 to-gray-600'

  return (
    <div 
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#3352CC] to-[#5577FF] rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      
      <div className="relative border border-[#3352CC]/20 rounded-2xl overflow-hidden bg-[#0e0e0e]/80 backdrop-blur-sm hover:border-[#3352CC]/40 transition-all duration-300 h-full">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          {product.thumbnail ? (
            <Image 
              src={product.thumbnail} 
              alt={product.name} 
              fill 
              className="object-cover transition-transform duration-300 group-hover:scale-105" 
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#1A1A1D] to-[#0e0e0e]">
              <CategoryIcon className="h-16 w-16 text-[#3352CC]/50" />
            </div>
          )}
          
          {/* Overlay on hover */}
          <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <Link href={`marketplace/${product.id}`}>
              <Button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 rounded-full">
                <Eye className="mr-2 h-4 w-4" />
                Quick View
              </Button>
            </Link>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.featured && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                ⭐ Featured
              </Badge>
            )}
            <Badge className={`bg-gradient-to-r ${categoryColor} text-white border-0 shadow-lg`}>
              <CategoryIcon className="mr-1 h-3 w-3" />
              {product.category.replace(/_/g, ' ')}
            </Badge>
          </div>

          {/* Like Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsLiked(!isLiked)
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 hover:bg-black/70 transition-all"
          >
            <Heart className={`h-4 w-4 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>

          {/* Stats Overlay */}
          <div className="absolute bottom-3 left-3 flex items-center gap-3">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/20">
              <Eye className="h-3 w-3 text-white" />
              <span className="text-xs text-white font-medium">{product.views}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/20">
              <ShoppingCart className="h-3 w-3 text-white" />
              <span className="text-xs text-white font-medium">{product.salesCount}</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-lg line-clamp-2 group-hover:text-[#3352CC] transition-colors">
              {product.name}
            </h3>
          </div>
          
          <p className="text-sm text-[#9D9D9D] mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Seller Info */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#3352CC] to-[#5577FF] flex items-center justify-center">
              <span className="text-xs text-white font-bold">
                {(product.SellerProfile?.User?.firstname?.[0] || 'U').toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-[#9D9D9D] flex items-center gap-1">
              by {product.SellerProfile?.User?.firstname || 'Unknown'} {product.SellerProfile?.User?.lastname || ''}
              {product.SellerProfile?.User?.subscription?.plan === 'PRO' && (
                <VerifiedBadge size="sm" />
              )}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? 'fill-yellow-500 text-yellow-500' : 'text-[#3352CC]/30'}`} 
                />
              ))}
            </div>
            <span className="text-sm font-medium">{(product.rating || 0).toFixed(1)}</span>
            <span className="text-xs text-[#9D9D9D]">({product.reviewCount || 0} reviews)</span>
          </div>

          {/* Price and CTA */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold bg-gradient-to-r from-[#3352CC] to-[#5577FF] bg-clip-text text-transparent">
                ${(product.price / 100).toFixed(2)}
              </p>
              {product.price > 1000 && (
                <p className="text-xs text-[#9D9D9D] line-through">
                  ${((product.price * 1.2) / 100).toFixed(2)}
                </p>
              )}
            </div>
            
            <Link href={`marketplace/${product.id}`}>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-[#3352CC] to-[#5577FF] hover:from-[#2A42B8] hover:to-[#4466EE] text-white rounded-full shadow-lg shadow-[#3352CC]/25 transition-all duration-300 hover:scale-105"
              >
                <ShoppingCart className="mr-1 h-3 w-3" />
                Buy Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}