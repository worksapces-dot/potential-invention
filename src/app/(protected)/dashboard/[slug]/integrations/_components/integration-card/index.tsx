'use client'
import { onOAuthInstagram } from '@/actions/integrations'
import { onUserInfo } from '@/actions/user'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  title: string
  description: string
  icon: React.ReactNode
  strategy: 'INSTAGRAM' | 'CRM' | 'MARKETPLACE'
}

const IntegrationCard = ({ description, icon, strategy, title }: Props) => {
  const router = useRouter()

  const onInstaOAuth = () => {
    if (strategy === 'MARKETPLACE') {
      // Get current slug from URL
      const pathParts = window.location.pathname.split('/')
      const slug = pathParts[2] // /dashboard/[slug]/...
      router.push(`/dashboard/${slug}/marketplace/sell/onboarding`)
    } else {
      onOAuthInstagram(strategy)
    }
  }

  const { data } = useQuery({
    queryKey: ['user-profile'],
    queryFn: onUserInfo,
  })

  const integrated = data?.data?.integrations.find(
    (integration) => integration.name === strategy
  )

  return (
    <div className="border-2 border-[#3352CC] rounded-2xl gap-x-5 p-5 flex items-center justify-between">
      {icon}
      <div className="flex flex-col flex-1">
        <h3 className="text-xl"> {title}</h3>
        <p className="text-[#9D9D9D] text-base ">{description}</p>
      </div>
      <Button
        onClick={onInstaOAuth}
        disabled={strategy !== 'MARKETPLACE' && integrated?.name === strategy}
        className="bg-gradient-to-br text-white rounded-full text-lg from-[#3352CC] font-medium to-[#1C2D70] hover:opacity-70 transition duration-100"
      >
        {strategy === 'MARKETPLACE' ? 'Get Started' : integrated ? 'Connected' : 'Connect'}
      </Button>
    </div>
  )
}

export default IntegrationCard
