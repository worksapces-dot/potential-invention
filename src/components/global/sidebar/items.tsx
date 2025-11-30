'use client'

import { getFilteredMenu, UserType } from '@/constants/menu'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

type Props = {
  page: string
  slug: string
}

const Items = ({ page, slug }: Props) => {
  const [userType, setUserType] = useState<UserType>(null)
  const [isLoading, setIsLoading] = useState(true)

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
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserType()
  }, [])

  const filteredMenu = getFilteredMenu(userType)
  const isColdCaller = userType === 'COLD_CALLER'

  if (isLoading) {
    return (
      <div className="space-y-2 px-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={cn(
            "h-10 animate-pulse",
            isColdCaller ? "bg-muted/50 rounded-xl" : "bg-[#1a1a1a] rounded-full"
          )} />
        ))}
      </div>
    )
  }

  const formatLabel = (label: string) => {
    if (label === 'cold-call') return 'Cold Call'
    if (label === 'home') return isColdCaller ? 'Dashboard' : 'home'
    return label
  }

  // Cold Caller - new clean style
  if (isColdCaller) {
    return (
      <div className="space-y-1">
        {filteredMenu.map((item) => {
          const isActive = page === item.label || (page === slug && item.label === 'home')
          
          return (
            <Link
              key={item.id}
              href={`/dashboard/${slug}/${item.label === 'home' ? '' : item.label}`}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-foreground text-background font-medium shadow-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <span className={cn(
                'flex items-center justify-center',
                isActive ? 'text-background' : 'text-muted-foreground'
              )}>
                {item.icon}
              </span>
              <span className="text-sm capitalize">{formatLabel(item.label)}</span>
            </Link>
          )
        })}
      </div>
    )
  }

  // Creator / BOTH - original gradient style
  return filteredMenu.map((item) => (
    <Link
      key={item.id}
      href={`/dashboard/${slug}/${item.label === 'home' ? '/' : item.label}`}
      className={cn(
        'capitalize flex gap-x-2 rounded-full p-3',
        page === item.label && 'bg-[#0f0f0f]',
        page === slug && item.label === 'home'
          ? 'bg-[#0f0f0f]'
          : 'text-[#9B9CA0]'
      )}
    >
      {item.icon}
      {formatLabel(item.label)}
    </Link>
  ))
}

export default Items
