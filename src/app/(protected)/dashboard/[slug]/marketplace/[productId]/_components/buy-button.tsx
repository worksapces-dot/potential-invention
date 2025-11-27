'use client'

import { Button } from '@/components/ui/button'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type Props = {
  productId: string
  price: number
  slug: string
}

export default function BuyButton({ productId, price, slug }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleBuy = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/marketplace/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })

      const data = await response.json()

      if (data.error) {
        if (data.error === 'Already purchased') {
          toast.error('You already own this product!')
          router.push(`/dashboard/${slug}/marketplace/my-purchases`)
          return
        }
        toast.error(data.error)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleBuy}
      disabled={loading}
      className="w-full bg-gradient-to-br text-white rounded-full from-[#3352CC] to-[#1C2D70] hover:opacity-70 py-6 text-lg"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          <ShoppingCart className="mr-2 h-5 w-5" />
          Buy Now - ${(price / 100).toFixed(2)}
        </>
      )}
    </Button>
  )
}
