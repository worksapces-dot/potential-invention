'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { BadgeCheck } from 'lucide-react'

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showTooltip?: boolean
}

const VerifiedBadge = ({ size = 'md', className, showTooltip = true }: VerifiedBadgeProps) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <div 
      className={cn("relative inline-flex items-center group", className)}
      title={showTooltip ? "Pro Member" : undefined}
    >
      <BadgeCheck 
        className={cn(
          sizeClasses[size],
          "text-[#3352CC] fill-[#3352CC]/20"
        )} 
      />
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#1D1D1D] border border-[#545454] rounded-md text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          <span className="flex items-center gap-1">
            <BadgeCheck className="h-3 w-3 text-[#3352CC]" />
            Pro Member
          </span>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#1D1D1D]" />
        </div>
      )}
    </div>
  )
}

export default VerifiedBadge