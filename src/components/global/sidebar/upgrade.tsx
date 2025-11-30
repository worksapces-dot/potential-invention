'use client'

import React, { useEffect, useState } from 'react'
import PaymentButton from '../payment-button'
import { Sparkles } from 'lucide-react'
import { UserType } from '@/constants/menu'

const UpgradeCard = () => {
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

  // Cold Caller - new clean style
  if (userType === 'COLD_CALLER') {
    return (
      <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-foreground/5 to-foreground/10 border border-border/50">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
            <Sparkles className="h-4 w-4 text-background" />
          </div>
          <span className="text-sm font-semibold">Upgrade to Pro</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Unlock AI features, unlimited automations, and more.
        </p>
        <PaymentButton />
      </div>
    )
  }

  // Creator / BOTH - original gradient style
  return (
    <div className="bg-[#252525] p-3 rounded-2xl flex flex-col gap-y-3">
      <span className="text-sm">
        Upgrade to{' '}
        <span className="bg-gradient-to-r from-[#CC3BD4] to-[#D064AC] font-bold bg-clip-text text-transparent">
          Smart AI
        </span>
      </span>
      <p className="text-[#9B9CA0] font-light text-sm">
        Unlock all features <br /> including AI and more
      </p>
      <PaymentButton />
    </div>
  )
}

export default UpgradeCard
