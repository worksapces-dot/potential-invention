'use client'

import { PAGE_BREAD_CRUMBS } from '@/constants/pages'
import { usePaths } from '@/hooks/user-nav'
import { HelpCircle, Menu, Settings } from 'lucide-react'
import React from 'react'
import Sheet from '../sheet'
import Items from '../sidebar/items'
import ClerkAuthState from '../clerk-auth-state'
import { SubscriptionPlan } from '../subscription-plan'
import UpgradeCard from '../sidebar/upgrade'
import { LogoSmall } from '@/svgs/logo-small'
import CreateAutomation from '../create-automation'
import Search from './search'
import { Notifications } from './notifications'
import { StreakCounter } from '../streak-counter'
import VerifiedBadge from '../verified-badge'
import Link from 'next/link'

type Props = {
  slug: string
  streak?: {
    currentStreak: number
    longestStreak: number
    isAtRisk: boolean
    milestone?: number
  }
}

const InfoBar = ({ slug, streak }: Props) => {
  const { page } = usePaths()
  const currentPage = PAGE_BREAD_CRUMBS.includes(page) || page == slug

  return (
    currentPage && (
      <div className="flex flex-col gap-4 mb-2">
        <div className="flex gap-3 lg:gap-4 justify-end items-center">
          {/* Mobile menu */}
          <span className="lg:hidden flex items-center flex-1 gap-x-2">
            <Sheet
              trigger={<Menu className="h-6 w-6" />}
              className="lg:hidden"
              side="left"
            >
              <div className="flex flex-col h-full p-4 bg-background">
                {/* Logo */}
                <div className="flex items-center justify-center py-4 mb-4">
                  <LogoSmall />
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4">
                  <Items page={page} slug={slug} />
                </nav>

                {/* Bottom section */}
                <div className="border-t border-border/50 pt-4 space-y-3">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
                    <ClerkAuthState />
                    <span className="text-sm text-muted-foreground">Profile</span>
                    <SubscriptionPlan type="PRO">
                      <VerifiedBadge size="sm" />
                    </SubscriptionPlan>
                  </div>

                  <Link
                    href="#"
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground"
                  >
                    <HelpCircle className="h-5 w-5" />
                    <span className="text-sm">Help</span>
                  </Link>

                  <Link
                    href={`/dashboard/${slug}/settings`}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground"
                  >
                    <Settings className="h-5 w-5" />
                    <span className="text-sm">Settings</span>
                  </Link>

                  <SubscriptionPlan type="FREE">
                    <UpgradeCard />
                  </SubscriptionPlan>
                </div>
              </div>
            </Sheet>
          </span>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {streak && <StreakCounter initialStreak={streak} />}
            <Search />
            <CreateAutomation />
            <Notifications />
          </div>
        </div>
      </div>
    )
  )
}

export default InfoBar
