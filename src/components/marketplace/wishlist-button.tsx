'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Heart, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  productId: string
  className?: string
}

export default function WishlistButton({ productId, className }: Props) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if product is in wishlist
    const wishlist = JSON.parse(localStorage.getItem('marketplace_wishlist') || '[]')
    setIsWishlisted(wishlist.includes(productId))
  }, [productId])

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setLoading(true)
    try {
      const wishlist = JSON.parse(localStorage.getItem('marketplace_wishlist') || '[]')
      
      if (isWishlisted) {
        // Remove from wishlist
        const newWishlist = wishlist.filter((id: string) => id !== productId)
        localStorage.setItem('marketplace_wishlist', JSON.stringify(newWishlist))
        setIsWishlisted(false)
        toast.success('Removed from wishlist')
      } else {
        // Add to wishlist
        const newWishlist = [...wishlist, productId]
        localStorage.setItem('marketplace_wishlist', JSON.stringify(newWishlist))
        setIsWishlisted(true)
        toast.success('Added to wishlist')
      }
    } catch (error) {
      toast.error('Failed to update wishlist')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleWishlist}
      disabled={loading}
      className={`p-2 rounded-full hover:bg-black/20 transition-all ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart 
          className={`h-4 w-4 transition-colors ${
            isWishlisted 
              ? 'fill-red-500 text-red-500' 
              : 'text-white hover:text-red-500'
          }`} 
        />
      )}
    </Button>
  )
}