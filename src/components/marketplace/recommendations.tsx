'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight } from 'lucide-react'
import ProductCard from './product-card'

type Props = {
  currentProduct?: { id: string }
  category?: string
  className?: string
}

export default function Recommendations({ currentProduct, category, className }: Props) {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const params = new URLSearchParams()
        if (category) params.set('category', category)
        if (currentProduct) params.set('exclude', currentProduct.id)
        params.set('limit', '4')
        params.set('sort', 'popular')

        const response = await fetch(`/api/marketplace/recommendations?${params}`)
        const data = await response.json()
        
        if (data.products) {
          setRecommendations(data.products)
        }
      } catch (error) {
        console.error('Failed to fetch recommendations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [currentProduct, category])

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">You Might Also Like</h2>
            <p className="text-sm text-[#9D9D9D]">Recommended for you</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-80 bg-[#1A1A1D] rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) return null

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">You Might Also Like</h2>
            <p className="text-sm text-[#9D9D9D]">Recommended based on this product</p>
          </div>
        </div>
        {category && (
          <Button
            variant="ghost"
            size="sm"
            className="text-[#3352CC] hover:text-white hover:bg-[#3352CC] rounded-full"
          >
            View More
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}