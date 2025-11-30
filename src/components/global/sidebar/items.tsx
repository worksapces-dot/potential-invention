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

  if (isLoading) {
    return (
      <div className="space-y-2 px-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-[#1a1a1a] rounded-full animate-pulse" />
        ))}
      </div>
    )
  }

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
      {item.label === 'cold-call' ? 'Cold Call' : item.label}
    </Link>
  ))
}

export default Items
