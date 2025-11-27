'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import VerifiedBadge from '../verified-badge'

interface UserDisplayNameProps {
  firstname?: string | null
  lastname?: string | null
  email?: string
  isPro?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showBadge?: boolean
}

const UserDisplayName = ({ 
  firstname, 
  lastname, 
  email,
  isPro = false,
  size = 'md',
  className,
  showBadge = true
}: UserDisplayNameProps) => {
  const displayName = firstname && lastname 
    ? `${firstname} ${lastname}`
    : firstname || email?.split('@')[0] || 'Unknown'

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <span className={cn("inline-flex items-center gap-1", textSizeClasses[size], className)}>
      <span>{displayName}</span>
      {isPro && showBadge && <VerifiedBadge size={size} />}
    </span>
  )
}

export default UserDisplayName