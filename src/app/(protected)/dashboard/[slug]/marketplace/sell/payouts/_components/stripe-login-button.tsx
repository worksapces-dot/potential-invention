'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function StripeLoginButton() {
  const [loading, setLoading] = useState(false)

  const handleStripeLogin = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/marketplace/stripe-login', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.error) {
        toast.error(data.error)
        return
      }

      if (data.url) {
        window.open(data.url, '_blank')
      }
    } catch (error) {
      toast.error('Failed to access Stripe dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleStripeLogin}
      disabled={loading}
      variant="outline"
      className="rounded-full border-[#3352CC] text-[#3352CC] hover:bg-[#3352CC] hover:text-white"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <ExternalLink className="h-4 w-4 mr-2" />
      )}
      Stripe Dashboard
    </Button>
  )
}