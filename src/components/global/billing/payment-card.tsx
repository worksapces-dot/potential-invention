'use client'

import { Button } from '@/components/ui/button'
import { PLANS } from '@/constants/pages'
import { CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Props = {
  label: string
  current: 'PRO' | 'FREE'
  landing?: boolean
}

const PaymentCard = ({ current, label, landing }: Props) => {
  const router = useRouter()
  const plan = PLANS[label === 'PRO' ? 1 : 0]
  const isPro = label === 'PRO'
  const isCurrentPlan = label === current

  const handleUpgrade = async () => {
    if (isPro && !isCurrentPlan) {
      try {
        const response = await fetch('/api/payment')
        const data = await response.json()
        if (data.session_url) {
          router.push(data.session_url)
        }
      } catch (error) {
        console.error('Failed to create checkout:', error)
      }
    }
  }

  return (
    <div
      className={`relative rounded-3xl border p-8 transition-all ${
        isPro 
          ? 'border-foreground bg-foreground/5' 
          : 'border-border bg-background'
      }`}
    >
      {/* Current plan badge or Popular badge */}
      {isCurrentPlan ? (
        <span className="absolute -top-3 left-6 rounded-full bg-green-500 px-4 py-1 text-xs font-semibold text-white">
          Current Plan
        </span>
      ) : isPro ? (
        <span className="absolute -top-3 left-6 rounded-full bg-foreground px-4 py-1 text-xs font-semibold text-background">
          Recommended
        </span>
      ) : null}
      
      {/* Plan name & description */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
        <p className="text-sm text-muted-foreground">{plan.description}</p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <span className="text-5xl font-bold">{isPro ? '$29' : '$0'}</span>
        <span className="text-muted-foreground">/month</span>
      </div>

      {/* Features */}
      <ul className="mb-8 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Button
        onClick={handleUpgrade}
        disabled={isCurrentPlan}
        className={`w-full h-12 rounded-full font-medium transition-all ${
          isCurrentPlan
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : isPro
            ? 'bg-foreground text-background hover:bg-foreground/90'
            : 'bg-muted text-foreground hover:bg-muted/80'
        }`}
      >
        {isCurrentPlan 
          ? 'Active' 
          : isPro 
          ? 'Upgrade to Pro' 
          : 'Downgrade'}
      </Button>

      {/* Cancel anytime text for Pro */}
      {isPro && !isCurrentPlan && (
        <p className="text-center text-xs text-muted-foreground mt-3">
          Cancel anytime
        </p>
      )}
    </div>
  )
}

export default PaymentCard
