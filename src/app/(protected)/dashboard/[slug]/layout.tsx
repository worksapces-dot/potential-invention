import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import InfoBar from '@/components/global/infobar'
import Sidebar from '@/components/global/sidebar'
import React from 'react'
import {
  PrefetchUserAutnomations,
  PrefetchUserProfile,
} from '@/react-query/prefetch'
import { Metadata } from 'next'
import { trackUserLogin } from '@/actions/user/streak'
import { redirect } from 'next/navigation'
import { onCurrentUser } from '@/actions/user'
import { client } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your Instagram automations, view analytics, and grow your engagement with Slide.',
  robots: {
    index: false,
    follow: false,
  },
}

type Props = {
  children: React.ReactNode
  params: { slug: string }
}

const Layout = async ({ children, params }: Props) => {
  const query = new QueryClient()

  // Check if user has completed onboarding
  const user = await onCurrentUser()
  const dbUser = await (client.user as any).findUnique({
    where: { clerkId: user.id },
    select: { onboardingComplete: true },
  })

  if (dbUser && !dbUser.onboardingComplete) {
    redirect('/onboarding')
  }

  await PrefetchUserProfile(query)
  await PrefetchUserAutnomations(query)

  const loginResult = await trackUserLogin()
  const streakData = loginResult.success ? {
    currentStreak: loginResult.streak || 0,
    longestStreak: loginResult.longestStreak || 0,
    isAtRisk: loginResult.isAtRisk || false,
    milestone: loginResult.milestone || undefined
  } : undefined

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <div className="p-3">
        <Sidebar slug={params.slug} />
        <div
          className="
      lg:ml-[250px] 
      lg:pl-10 
      lg:py-5 
      flex 
      flex-col 
      overflow-auto
      "
        >
          <InfoBar slug={params.slug} streak={streakData} />
          {children}
        </div>
      </div>
    </HydrationBoundary>
  )
}

export default Layout
