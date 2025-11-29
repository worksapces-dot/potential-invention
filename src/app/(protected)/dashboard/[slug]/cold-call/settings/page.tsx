'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CreditCard,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export default function SettingsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string

  const [stripeStatus, setStripeStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    checkStripeStatus()

    // Handle return from Stripe onboarding
    if (searchParams.get('success') === 'true') {
      toast.success('Stripe account connected successfully!')
    } else if (searchParams.get('refresh') === 'true') {
      toast.info('Please complete your Stripe onboarding')
    }
  }, [])

  const checkStripeStatus = async () => {
    try {
      const response = await fetch('/api/stripe/connect/status')
      const data = await response.json()
      setStripeStatus(data)
    } catch (error) {
      console.error('Failed to check Stripe status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnectStripe = async () => {
    setIsConnecting(true)
    try {
      const response = await fetch('/api/stripe/connect/onboard', {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create onboarding link')
      }

      // Redirect to Stripe onboarding
      window.location.href = data.url
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to connect Stripe')
      setIsConnecting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/${slug}/cold-call`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your Cold Call settings and payouts
          </p>
        </div>
      </div>

      {/* Stripe Connect Card */}
      <Card className="p-6 bg-background/50 border-border/50">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
            <CreditCard className="h-6 w-6 text-purple-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-1">Stripe Connect</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your Stripe account to receive automatic payouts when deals close
            </p>

            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking status...
              </div>
            ) : stripeStatus?.onboardingComplete ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-green-500">Connected</span>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg text-sm">
                  <p className="text-green-700 dark:text-green-400">
                    Your Stripe account is connected and ready to receive payouts!
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleConnectStripe}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="mr-2 h-4 w-4" />
                    )}
                    Manage Stripe Account
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkStripeStatus}
                  >
                    Refresh Status
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span className="font-medium text-orange-500">Not Connected</span>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-lg text-sm">
                  <p className="text-orange-700 dark:text-orange-400 mb-2">
                    Connect your Stripe account to receive automatic payouts (90% of each sale)
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-orange-600 dark:text-orange-500">
                    <li>Instant payouts when deals close</li>
                    <li>Secure and automated</li>
                    <li>Track all earnings in one place</li>
                  </ul>
                </div>
                <Button
                  onClick={handleConnectStripe}
                  disabled={isConnecting}
                  className="w-full sm:w-auto"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Connect Stripe Account
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-6 bg-muted/50 border-border/50">
        <h3 className="font-semibold mb-3">How Payouts Work</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>1. Client pays for website via Stripe payment link</p>
          <p>2. Platform fee (10%) is deducted automatically</p>
          <p>3. Your payout (90%) is transferred to your Stripe account</p>
          <p>4. Stripe deposits to your bank account (2-7 business days)</p>
        </div>
      </Card>
    </div>
  )
}
