'use client'

import { Badge } from '@/components/ui/badge'
import { Percent, Clock } from 'lucide-react'

type Props = {
  originalPrice: number
  discountedPrice: number
  discountType?: 'percentage' | 'fixed'
  expiresAt?: string
  className?: string
}

export default function DiscountBadge({ 
  originalPrice, 
  discountedPrice, 
  expiresAt,
  className 
}: Props) {
  const discountAmount = originalPrice - discountedPrice
  const discountPercentage = Math.round((discountAmount / originalPrice) * 100)
  
  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false
  
  if (discountAmount <= 0 || isExpired) return null

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg">
        <Percent className="mr-1 h-3 w-3" />
        {discountPercentage}% OFF
      </Badge>
      
      {expiresAt && !isExpired && (
        <Badge variant="outline" className="border-orange-500 text-orange-500">
          <Clock className="mr-1 h-3 w-3" />
          Limited Time
        </Badge>
      )}
    </div>
  )
}

export function PriceDisplay({ 
  originalPrice, 
  discountedPrice, 
  showOriginal = true,
  className 
}: {
  originalPrice: number
  discountedPrice?: number
  showOriginal?: boolean
  className?: string
}) {
  const hasDiscount = discountedPrice && discountedPrice < originalPrice
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-2xl font-bold bg-gradient-to-r from-[#3352CC] to-[#5577FF] bg-clip-text text-transparent">
        ${((hasDiscount ? discountedPrice : originalPrice) / 100).toFixed(2)}
      </span>
      
      {hasDiscount && showOriginal && (
        <span className="text-sm text-[#9D9D9D] line-through">
          ${(originalPrice / 100).toFixed(2)}
        </span>
      )}
    </div>
  )
}