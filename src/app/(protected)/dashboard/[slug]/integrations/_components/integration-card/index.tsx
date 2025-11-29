'use client'
import { onOAuthInstagram, onDisconnectInstagram } from '@/actions/integrations'
import { onUserInfo } from '@/actions/user'
import { Button } from '@/components/ui/button'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

type Props = {
  title: string
  description: string
  icon: React.ReactNode
  strategy: 'INSTAGRAM' | 'CRM' | 'MARKETPLACE' | 'STRIPE_CONNECT'
}

const IntegrationCard = ({ description, icon, strategy, title }: Props) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const onInstaOAuth = async () => {
    if (strategy === 'MARKETPLACE') {
      const pathParts = window.location.pathname.split('/')
      const slug = pathParts[2]
      router.push(`/dashboard/${slug}/marketplace/sell/onboarding`)
    } else if (strategy === 'STRIPE_CONNECT') {
      // Handle Stripe Connect
      try {
        const response = await fetch('/api/stripe/connect/onboard', {
          method: 'POST',
        })
        const data = await response.json()
        if (response.ok && data.url) {
          window.location.href = data.url
        } else {
          toast.error('Failed to connect Stripe')
        }
      } catch (error) {
        toast.error('Failed to connect Stripe')
      }
    } else {
      onOAuthInstagram(strategy)
    }
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      const result = await onDisconnectInstagram()
      if (result.status === 200) {
        toast.success('Instagram disconnected')
        queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      } else {
        toast.error('Failed to disconnect')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsDisconnecting(false)
    }
  }

  const { data } = useQuery({
    queryKey: ['user-profile'],
    queryFn: onUserInfo,
  })

  // Check Stripe Connect status
  const { data: stripeStatus } = useQuery({
    queryKey: ['stripe-connect-status'],
    queryFn: async () => {
      if (strategy !== 'STRIPE_CONNECT') return null
      const res = await fetch('/api/stripe/connect/status')
      return res.json()
    },
    enabled: strategy === 'STRIPE_CONNECT',
  })

  const integrated = strategy === 'STRIPE_CONNECT'
    ? stripeStatus?.connected
    : data?.data?.integrations.find((integration) => integration.name === strategy)

  // Check if token is expired
  const isExpired = integrated?.expiresAt 
    ? new Date(integrated.expiresAt).getTime() < Date.now() 
    : false
  
  // For Stripe, check if onboarding is complete
  const stripeNeedsOnboarding = strategy === 'STRIPE_CONNECT' && stripeStatus?.connected && !stripeStatus?.onboardingComplete

  return (
    <div className="border-2 border-[#3352CC] rounded-2xl gap-x-5 p-5 flex items-center justify-between">
      {icon}
      <div className="flex flex-col flex-1">
        <h3 className="text-xl">{title}</h3>
        <p className="text-[#9D9D9D] text-base">{description}</p>
        {integrated && isExpired && (
          <p className="text-red-500 text-sm mt-1">⚠️ Token expired - please reconnect</p>
        )}
      </div>
      
      {strategy === 'MARKETPLACE' ? (
        <Button
          onClick={onInstaOAuth}
          className="bg-gradient-to-br text-white rounded-full text-lg from-[#3352CC] font-medium to-[#1C2D70] hover:opacity-70 transition duration-100"
        >
          Get Started
        </Button>
      ) : integrated ? (
        <div className="flex gap-2">
          {isExpired && (
            <Button
              onClick={onInstaOAuth}
              className="bg-gradient-to-br text-white rounded-full from-[#3352CC] font-medium to-[#1C2D70] hover:opacity-70"
            >
              Reconnect
            </Button>
          )}
          <Button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            variant="outline"
            className="rounded-full border-red-500/50 text-red-500 hover:bg-red-500/10"
          >
            {isDisconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Disconnect'}
          </Button>
        </div>
      ) : (
        <Button
          onClick={onInstaOAuth}
          className="bg-gradient-to-br text-white rounded-full text-lg from-[#3352CC] font-medium to-[#1C2D70] hover:opacity-70 transition duration-100"
        >
          Connect
        </Button>
      )}
    </div>
  )
}

export default IntegrationCard