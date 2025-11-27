'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type Product = {
  id: string
  name: string
  price: number
  thumbnail?: string
  rating: number
}

export default function RecentlyViewed() {
  const [recentProducts, setRecentProducts] = useState<Product[]>([])

  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('marketplace_recently_viewed') || '[]')
    setRecentProducts(recent.slice(0, 4))
  }, [])

  if (recentProducts.length === 0) return null

  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Recently Viewed</h2>
            <p className="text-sm text-[#9D9D9D]">Continue where you left off</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            localStorage.removeItem('marketplace_recently_viewed')
            setRecentProducts([])
          }}
          className="text-[#9D9D9D] hover:text-white"
        >
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recentProducts.map((product) => (
          <Link key={product.id} href={`/marketplace/${product.id}`}>
            <div className="group border border-[#3352CC]/20 rounded-xl overflow-hidden bg-[#0e0e0e]/50 hover:border-[#3352CC]/40 transition-all">
              <div className="relative h-32 overflow-hidden">
                {product.thumbnail ? (
                  <Image
                    src={product.thumbnail}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-[#1A1A1D]">
                    <Clock className="h-8 w-8 text-[#9D9D9D]" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-[#3352CC] transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-[#3352CC]">
                    ${(product.price / 100).toFixed(2)}
                  </span>
                  <span className="text-xs text-[#9D9D9D]">
                    ⭐ {product.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function useRecentlyViewed() {
  const addToRecentlyViewed = (product: Product) => {
    const recent = JSON.parse(localStorage.getItem('marketplace_recently_viewed') || '[]')
    const filtered = recent.filter((p: Product) => p.id !== product.id)
    const updated = [product, ...filtered].slice(0, 10)
    localStorage.setItem('marketplace_recently_viewed', JSON.stringify(updated))
  }

  return { addToRecentlyViewed }
}