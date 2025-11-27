'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Crown } from 'lucide-react'

interface ProBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  variant?: 'default' | 'outline' | 'gradient'
}

const ProBadge = ({ size = 'md', className, variant = 'default' }: ProBadgeProps) => {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-0.5',
    md: 'text-xs px-2 py-1 gap-1',
    lg: 'text-sm px-3 py-1.5 gap-1.5'
  }

  const iconSizes = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  }

  const variantClasses = {
    default: 'bg-gradient-to-r from-[#3352CC] to-[#5577FF] text-white',
    outline: 'border border-[#3352CC] text-[#3352CC] bg-transparent',
    gradient: 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white'
  }

  return (
    <span 
      className={cn(
        "inline-flex items-center font-bold rounded-full",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      <Crown className={iconSizes[size]} />
      PRO
    </span>
  )
}

export default ProBadge