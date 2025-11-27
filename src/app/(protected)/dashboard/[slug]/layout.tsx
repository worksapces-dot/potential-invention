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

type Props = {
  children: React.ReactNode
  params: { slug: string }
}

import { trackUserLogin } from '@/actions/user/streak'

// ...

const Layout = async ({ children, params }: Props) => {
  const query = new QueryClient()

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
