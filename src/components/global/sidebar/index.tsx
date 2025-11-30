'use client'
import { usePaths } from '@/hooks/user-nav'
import { LogoSmall } from '@/svgs/logo-small'
import React, { useEffect, useState } from 'react'
import Items from './items'
import ClerkAuthState from '../clerk-auth-state'
import { SubscriptionPlan } from '../subscription-plan'
import UpgradeCard from './upgrade'
import VerifiedBadge from '../verified-badge'
import { HelpCircle, Settings } from 'lucide-react'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { HelpDuoToneWhite } from '@/icons'
import { UserType } from '@/constants/menu'

type Props = {
  slug: string
}

const Sidebar = ({ slug }: Props) => {
  const { page } = usePaths()
  const [userType, setUserType] = useState<UserType>(null)

  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const res = await fetch('/api/user/onboarding')
        if (res.ok) {
          const data = await res.json()
          setUserType(data.userType)
        }
      } catch (error) {
        console.error('Failed to fetch user type:', error)
      }
    }
    fetchUserType()
  }, [])

  // Cold Caller gets the new clean style
  if (userType === 'COLD_CALLER') {
    return (
      <div className="w-[250px] fixed left-0 lg:inline-block hidden bottom-0 top-0 m-3 rounded-3xl overflow-hidden border border-border/50 bg-background/70 backdrop-blur-xl shadow-lg shadow-black/5">
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-center py-4 mb-2">
            <LogoSmall />
          </div>
          <nav className="flex-1 py-4">
            <Items page={page} slug={slug} />
          </nav>
          <div className="border-t border-border/50 pt-4 space-y-3">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted/50 transition-colors">
              <ClerkAuthState />
              <span className="text-sm text-muted-foreground">Profile</span>
              <SubscriptionPlan type="PRO">
                <VerifiedBadge size="sm" />
              </SubscriptionPlan>
            </div>
            <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
              <HelpCircle className="h-5 w-5" />
              <span className="text-sm">Help & Support</span>
            </Link>
            <Link href={`/dashboard/${slug}/settings`} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
              <Settings className="h-5 w-5" />
              <span className="text-sm">Settings</span>
            </Link>
            <SubscriptionPlan type="FREE">
              <UpgradeCard />
            </SubscriptionPlan>
          </div>
        </div>
      </div>
    )
  }

  // Creator and BOTH get the original gradient style
  return (
    <div className="w-[250px] border-[1px] radial fixed left-0 lg:inline-block border-[#545454] bg-gradient-to-b from-[#768BDD] via-[#171717] to-[#768BDD] hidden bottom-0 top-0 m-3 rounded-3xl overflow-hidden">
      <div className="flex flex-col gap-y-5 w-full h-full p-3 bg-[#0e0e0e] bg-opacity-90 bg-clip-padding backdrop-filter backdrop--blur__safari backdrop-blur-3xl">
        <div className="flex gap-x-2 items-center p-5 justify-center">
          <LogoSmall />
        </div>
        <div className="flex flex-col py-3">
          <Items page={page} slug={slug} />
        </div>
        <div className="px-16">
          <Separator orientation="horizontal" className="bg-[#333336]" />
        </div>
        <div className="px-3 flex flex-col gap-y-5">
          <div className="flex gap-x-2 items-center">
            <ClerkAuthState />
            <p className="text-[#9B9CA0]">Profile</p>
            <SubscriptionPlan type="PRO">
              <VerifiedBadge size="sm" />
            </SubscriptionPlan>
          </div>
          <div className="flex gap-x-3">
            <HelpDuoToneWhite />
            <p className="text-[#9B9CA0]">Help</p>
          </div>
        </div>
        <SubscriptionPlan type="FREE">
          <div className="flex-1 flex flex-col justify-end">
            <UpgradeCard />
          </div>
        </SubscriptionPlan>
      </div>
    </div>
  )
}

export default Sidebar
