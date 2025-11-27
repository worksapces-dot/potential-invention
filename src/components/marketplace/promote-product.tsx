'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Rocket, Zap, Star, Crown, Check, Loader2, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  productId: string
  productName: string
  currentPromotion?: {
    tier: string
    status: string
    endsAt: string
    viewsDelivered: number
    boostViews: number
  } | null
}

const TIERS = [
  {
    id: 'BASIC',
    name: 'Basic Boost',
    price: 2,
    views: 500,
    days: 3,
    icon: Zap,
    color: 'from-blue-500 to-blue-600',
    popular: false
  },
  {
    id: 'STANDARD',
    name: 'Standard Boost',
    price: 5,
    views: 1500,
    days: 7,
    icon: Star,
    color: 'from-purple-500 to-purple-600',
    popular: true
  },
  {
    id: 'PREMIUM',
    name: 'Premium Boost',
    price: 10,
    views: 5000,
    days: 14,
    icon: Crown,
    color: 'from-yellow-500 to-orange-500',
    popular: false
  }
]

export default function PromoteProduct({ productId, productName, currentPromotion }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  const handlePromote = async (tier: string) => {
    setLoading(tier)
    try {
      const response = await fetch('/api/marketplace/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, tier })
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        toast.error(data.error || 'Failed to create promotion')
        return
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      toast.error('Failed to start promotion')
    } finally {
      setLoading(null)
    }
  }

  // Show active promotion status
  if (currentPromotion && currentPromotion.status === 'ACTIVE') {
    const progress = (currentPromotion.viewsDelivered / currentPromotion.boostViews) * 100
    const endsAt = new Date(currentPromotion.endsAt)
    const daysLeft = Math.ceil((endsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-500">
            <Rocket className="h-5 w-5" />
            Active Promotion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#9D9D9D]">Tier</span>
            <Badge className="bg-green-500">{currentPromotion.tier}</Badge>
          </div>
          
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-[#9D9D9D]">Views Delivered</span>
              <span>{currentPromotion.viewsDelivered} / {currentPromotion.boostViews}</span>
            </div>
            <div className="h-2 bg-[#1A1A1D] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-[#9D9D9D]">Time Remaining</span>
            <span className="text-green-500 font-medium">{daysLeft} days left</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-[#3352CC]/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-[#3352CC]" />
          Promote Your Product
        </CardTitle>
        <p className="text-sm text-[#9D9D9D]">
          Boost visibility and get more sales with promoted listings
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIERS.map((tier) => {
            const Icon = tier.icon
            return (
              <div
                key={tier.id}
                className={`relative border rounded-xl p-4 transition-all hover:border-[#3352CC]/60 ${
                  tier.popular ? 'border-[#3352CC] bg-[#3352CC]/5' : 'border-[#3352CC]/20'
                }`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#3352CC]">
                    Most Popular
                  </Badge>
                )}
                
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tier.color} flex items-center justify-center mb-3`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                
                <h3 className="font-bold mb-1">{tier.name}</h3>
                
                <div className="text-2xl font-bold text-[#3352CC] mb-3">
                  ${tier.price}
                </div>
                
                <ul className="space-y-2 mb-4 text-sm">
                  <li className="flex items-center gap-2 text-[#9D9D9D]">
                    <Check className="h-4 w-4 text-green-500" />
                    {tier.views.toLocaleString()} views
                  </li>
                  <li className="flex items-center gap-2 text-[#9D9D9D]">
                    <Check className="h-4 w-4 text-green-500" />
                    {tier.days} days duration
                  </li>
                  <li className="flex items-center gap-2 text-[#9D9D9D]">
                    <Check className="h-4 w-4 text-green-500" />
                    Featured badge
                  </li>
                </ul>
                
                <Button
                  onClick={() => handlePromote(tier.id)}
                  disabled={loading !== null}
                  className={`w-full rounded-full ${
                    tier.popular 
                      ? 'bg-gradient-to-r from-[#3352CC] to-[#5577FF] text-white' 
                      : 'bg-[#1A1A1D] hover:bg-[#3352CC] border border-[#3352CC]/30'
                  }`}
                >
                  {loading === tier.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Boost Now
                    </>
                  )}
                </Button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}