'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Gift, Check, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { applyReferralCode } from '@/actions/referral'

interface ReferralCodeInputProps {
  onSuccess?: () => void
  className?: string
}

const ReferralCodeInput = ({ onSuccess, className }: ReferralCodeInputProps) => {
  const [referralCode, setReferralCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [applied, setApplied] = useState(false)

  const handleApplyCode = async () => {
    if (!referralCode.trim()) {
      toast.error('Please enter a referral code')
      return
    }

    setLoading(true)
    try {
      const result = await applyReferralCode(referralCode.trim())
      
      if (result.status === 200) {
        setApplied(true)
        toast.success(result.message)
        onSuccess?.()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to apply referral code')
    } finally {
      setLoading(false)
    }
  }

  if (applied) {
    return (
      <Card className={`border-keyword-green/50 bg-keyword-green/5 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-keyword-green">
            <Check className="h-5 w-5" />
            <div>
              <p className="font-medium">Referral code applied successfully!</p>
              <p className="text-sm opacity-80">You and your referrer both earned rewards.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-in-active/50 bg-background-80 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Gift className="h-5 w-5 text-keyword-yellow" />
          Have a Referral Code?
        </CardTitle>
        <CardDescription>
          Enter a referral code to get $5 credit and help your friend earn $10!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
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
            className="bg-light-blue hover:bg-light-blue/90"
          >
            {loading ? 'Applying...' : 'Apply'}
          </Button>
        </div>
        
        <div className="flex items-start gap-2 p-3 rounded-lg bg-light-blue/5 border border-light-blue/20">
          <AlertCircle className="h-4 w-4 text-light-blue mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-light-blue font-medium">Bonus Rewards</p>
            <p className="text-text-secondary">
              You&apos;ll get $5 credit instantly, and the person who referred you gets $10. 
              You can only use one referral code per account.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ReferralCodeInput