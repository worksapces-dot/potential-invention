'use client'

import { Button } from '@/components/ui/button'
import { Crown, Sparkles, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = {
  currentCount: number
  maxCount: number
  feature: string
}

export default function FreeTierBanner({ currentCount, maxCount, feature }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const percentage = Math.min((currentCount / maxCount) * 100, 100)
  const isAtLimit = currentCount >= maxCount

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/payment')
      const data = await response.json()
      if (data.session_url) {
        router.push(data.session_url)
      }
    } catch (error) {
      console.error('Failed to create checkout:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`rounded-xl border p-4 mb-5 ${
      isAtLimit 
        ? 'border-yellow-500/50 bg-yellow-500/10' 
        : 'border-border/50 bg-muted/30'
    }`}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
            isAtLimit ? 'bg-yellow-500' : 'bg-muted'
          }`}>
            {isAtLimit ? (
              <Crown className="h-5 w-5 text-white" />
            ) : (
              <Zap className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="font-medium">
              {isAtLimit ? `${feature} limit reached` : `Free Plan`}
            </p>
            <p className="text-sm text-muted-foreground">
              {currentCount} of {maxCount} {feature.toLowerCase()} used
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress bar */}
          <div className="hidden sm:block w-32">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isAtLimit ? 'bg-yellow-500' : 'bg-foreground'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <Button 
            onClick={handleUpgrade}
            disabled={isLoading}
            size="sm"
            className={`rounded-full ${
              isAtLimit 
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white' 
                : 'bg-foreground text-background hover:bg-foreground/90'
            }`}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isAtLimit ? 'Upgrade Now' : 'Go Pro'}
          </Button>
        </div>
      </div>
    </div>
  )
}
