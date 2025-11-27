'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Loader2 } from 'lucide-react'

export function BuyButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)

  const handleBuy = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/marketplace/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })

      const data = await res.json()

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl
      } else {
        console.error('No session URL returned')
        setLoading(false)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setLoading(false)
    }
  }

  return (
    <Button
      className="w-full"
      size="lg"
      onClick={handleBuy}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-5 w-5" />
          Buy Now
        </>
      )}
    </Button>
  )
}
