'use client'

import { useState, useEffect } from 'react'
import { getReferralStats, generateReferralCode, applyReferralCode, claimReferralReward } from '@/actions/referral'

interface ReferralStats {
  referralCode: string | null
  totalReferrals: number
  totalRewards: number
  unclaimedRewards: number
  referrals: Array<{
    id: string
    firstname: string | null
    lastname: string | null
    email: string
    createdAt: Date | string
    subscription: { plan: string } | null
  }>
  rewards: Array<{
    id: string
    type: string
    amount: number
    description: string
    claimed: boolean
    claimedAt: Date | string | null
    createdAt: Date | string
  }>
}

export const useReferral = () => {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getReferralStats()
      
      if (result.status === 200 && result.data) {
        setStats(result.data as unknown as ReferralStats)
      } else {
        setError(result.message || null)
      }
    } catch (err) {
      setError('Failed to load referral stats')
      console.error('Error loading referral stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const generateCode = async () => {
    try {
      const result = await generateReferralCode()
      if (result.status === 200) {
        await loadStats() // Reload stats to get the new code
        return { success: true, message: result.message }
      } else {
        return { success: false, message: result.message }
      }
    } catch (err) {
      return { success: false, message: 'Failed to generate referral code' }
    }
  }

  const applyCode = async (referralCode: string) => {
    try {
      const result = await applyReferralCode(referralCode)
      if (result.status === 200) {
        await loadStats() // Reload stats
        return { success: true, message: result.message }
      } else {
        return { success: false, message: result.message }
      }
    } catch (err) {
      return { success: false, message: 'Failed to apply referral code' }
    }
  }

  const claimReward = async (rewardId: string) => {
    try {
      const result = await claimReferralReward(rewardId)
      if (result.status === 200) {
        await loadStats() // Reload stats
        return { success: true, message: result.message }
      } else {
        return { success: false, message: result.message }
      }
    } catch (err) {
      return { success: false, message: 'Failed to claim reward' }
    }
  }

  const getReferralLink = () => {
    if (!stats?.referralCode) return null
    return `${window.location.origin}?ref=${stats.referralCode}`
  }

  const copyReferralLink = () => {
    const link = getReferralLink()
    if (!link) return false
    
    navigator.clipboard.writeText(link)
    return true
  }

  const shareReferralLink = () => {
    const link = getReferralLink()
    if (!link) return false
    
    const text = `Join me on Slide - the best Instagram DM automation tool! Use my referral link and we both get rewards: ${link}`
    
    if (navigator.share) {
      navigator.share({
        title: 'Join Slide with my referral link',
        text,
        url: link
      })
      return true
    } else {
      // Fallback to copying
      navigator.clipboard.writeText(text)
      return true
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  return {
    stats,
    loading,
    error,
    loadStats,
    generateCode,
    applyCode,
    claimReward,
    getReferralLink,
    copyReferralLink,
    shareReferralLink
  }
}