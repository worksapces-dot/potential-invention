'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Gift, X, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { applyReferralCode } from '@/actions/referral'

interface ReferralWelcomeBannerProps {
  onDismiss?: () => void
}

const ReferralWelcomeBanner = ({ onDismiss }: ReferralWelcomeBannerProps) => {
  const [referralCode, setReferralCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [hasReferralCode, setHasReferralCode] = useState(false)

  useEffect(() => {
    // Check if there's a referral code in localStorage or URL
    const urlParams = new URLSearchParams(window.location.search)
    const refFromUrl = urlParams.get('ref')
    const refFromStorage = localStorage.getItem('pending_referral_code')
    
    if (refFromUrl) {
      setReferralCode(refFromUrl)
      setHasReferralCode(true)
      localStorage.setItem('pending_referral_code', refFromUrl)
    } else if (refFromStorage) {
      setReferralCode(refFromStorage)
      setHasReferralCode(true)
    }

    // Check if user has already dismissed this banner
    const isDismissed = localStorage.getItem('referral_banner_dismissed')
    if (isDismissed) {
      setDismissed(true)
    }
  }, [])

  const handleApplyCode = async () => {
    if (!referralCode.trim()) {
      toast.error('Please enter a referral code')
      return
    }

    setLoading(true)
    try {
      const result = await applyReferralCode(referralCode.trim())
      
      if (result.status === 200) {
        toast.success(result.message)
        localStorage.removeItem('pending_referral_code')
        localStorage.setItem('referral_banner_dismissed', 'true')
        setDismissed(true)
        onDismiss?.()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to apply referral code')
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('referral_banner_dismissed', 'true')
    localStorage.removeItem('pending_referral_code')
    setDismissed(true)
    onDismiss?.()
  }

  if (dismissed) return null

  return (
    <Card className="border-keyword-yellow/50 bg-gradient-to-r from-keyword-yellow/5 to-keyword-green/5 mb-6">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-2 rounded-lg bg-keyword-yellow/10">
              <Gift className="h-6 w-6 text-keyword-yellow" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-white">Welcome Bonus Available!</h3>
                <Sparkles className="h-4 w-4 text-keyword-yellow" />
              </div>
              <p className="text-text-secondary mb-4">
                {hasReferralCode 
                  ? `Someone shared Slide with you! Apply the referral code "${referralCode}" to get $5 credit.`
                  : 'Have a referral code? Apply it now to get $5 credit and help your friend earn $10!'
                }
              </p>
              <div className="flex gap-2 max-w-md">
                <Input
                  placeholder="Enter referral code"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="bg-background-90 border-in-active/50 text-white"
                  maxLength={8}
                />
                <Button
                  onClick={handleApplyCode}
                  disabled={loading || !referralCode.trim()}
                  className="bg-keyword-yellow text-black hover:bg-keyword-yellow/90"
                >
                  {loading ? 'Applying...' : 'Apply Code'}
                </Button>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="text-text-secondary hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ReferralWelcomeBanner