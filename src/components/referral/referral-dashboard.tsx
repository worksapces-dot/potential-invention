'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Copy, 
  Share2, 
  Users, 
  DollarSign, 
  Gift, 
  ExternalLink,
  Check,
  Trophy,
  Calendar,
  Mail
} from 'lucide-react'
import { toast } from 'sonner'
import { generateReferralCode, getReferralStats, claimReferralReward } from '@/actions/referral'

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
    createdAt: string
    subscription: { plan: string } | null
  }>
  rewards: Array<{
    id: string
    type: string
    amount: number
    description: string
    claimed: boolean
    claimedAt: string | null
    createdAt: string
  }>
}

const ReferralDashboard = () => {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const result = await getReferralStats()
      if (result.status === 200 && result.data) {
        setStats(result.data as unknown as ReferralStats)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateCode = async () => {
    setGenerating(true)
    try {
      const result = await generateReferralCode()
      if (result.status === 200) {
        await loadStats() // Reload to get the new code
        toast.success('Referral code generated!')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to generate referral code')
    } finally {
      setGenerating(false)
    }
  }

  const copyReferralLink = () => {
    if (!stats?.referralCode) return
    
    const referralLink = `${window.location.origin}?ref=${stats.referralCode}`
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success('Referral link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const shareReferralLink = () => {
    if (!stats?.referralCode) return
    
    const referralLink = `${window.location.origin}?ref=${stats.referralCode}`
    const text = `Join me on Slide - the best Instagram DM automation tool! Use my referral link and we both get rewards: ${referralLink}`
    
    if (navigator.share) {
      navigator.share({
        title: 'Join Slide with my referral link',
        text,
        url: referralLink
      })
    } else {
      // Fallback to copying
      navigator.clipboard.writeText(text)
      toast.success('Referral message copied!')
    }
  }

  const handleClaimReward = async (rewardId: string) => {
    try {
      const result = await claimReferralReward(rewardId)
      if (result.status === 200) {
        toast.success('Reward claimed!')
        await loadStats() // Reload to update the UI
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to claim reward')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-light-blue"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-light-blue/10">
          <Users className="h-6 w-6 text-light-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Referral Program</h1>
          <p className="text-text-secondary">Earn rewards by inviting friends to Slide</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-in-active/50 bg-background-80">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-light-blue/10">
                <Users className="h-5 w-5 text-light-blue" />
              </div>
              <div>
                <p className="text-text-secondary text-sm">Total Referrals</p>
                <p className="text-2xl font-bold text-white">{stats?.totalReferrals || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-in-active/50 bg-background-80">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-keyword-green/10">
                <DollarSign className="h-5 w-5 text-keyword-green" />
              </div>
              <div>
                <p className="text-text-secondary text-sm">Total Earned</p>
                <p className="text-2xl font-bold text-white">${stats?.totalRewards?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-in-active/50 bg-background-80">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-keyword-yellow/10">
                <Gift className="h-5 w-5 text-keyword-yellow" />
              </div>
              <div>
                <p className="text-text-secondary text-sm">Unclaimed Rewards</p>
                <p className="text-2xl font-bold text-white">{stats?.unclaimedRewards || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Section */}
      <Card className="border-in-active/50 bg-background-80">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Your Referral Code
          </CardTitle>
          <CardDescription>
            Share your unique referral code and earn $10 for each friend who joins!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats?.referralCode ? (
            <>
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}?ref=${stats.referralCode}`}
                  readOnly
                  className="bg-background-90 border-in-active/50 text-white"
                />
                <Button
                  onClick={copyReferralLink}
                  variant="outline"
                  size="icon"
                  className="border-in-active/50 hover:bg-light-blue/10"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={shareReferralLink}
                  variant="outline"
                  size="icon"
                  className="border-in-active/50 hover:bg-light-blue/10"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-light-blue/10 text-light-blue">
                  Code: {stats.referralCode}
                </Badge>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-text-secondary mb-4">You don't have a referral code yet</p>
              <Button
                onClick={handleGenerateCode}
                disabled={generating}
                className="bg-light-blue hover:bg-light-blue/90"
              >
                {generating ? 'Generating...' : 'Generate Referral Code'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card className="border-in-active/50 bg-background-80">
        <CardHeader>
          <CardTitle className="text-white">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-light-blue/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-light-blue font-bold">1</span>
              </div>
              <h3 className="font-semibold text-white mb-2">Share Your Link</h3>
              <p className="text-text-secondary text-sm">Send your referral link to friends via social media, email, or messaging</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-keyword-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-keyword-green font-bold">2</span>
              </div>
              <h3 className="font-semibold text-white mb-2">They Sign Up</h3>
              <p className="text-text-secondary text-sm">Your friend creates an account using your referral link</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-keyword-yellow/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-keyword-yellow font-bold">3</span>
              </div>
              <h3 className="font-semibold text-white mb-2">Earn Rewards</h3>
              <p className="text-text-secondary text-sm">You get $10 credit, they get $5 credit. Win-win!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rewards History */}
      {stats?.rewards && stats.rewards.length > 0 && (
        <Card className="border-in-active/50 bg-background-80">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Rewards History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.rewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-3 rounded-lg bg-background-90 border border-in-active/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-keyword-green/10">
                      <Gift className="h-4 w-4 text-keyword-green" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{reward.description}</p>
                      <p className="text-text-secondary text-sm flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(reward.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={reward.claimed ? "default" : "secondary"}>
                      {reward.type === 'CREDIT' ? `$${(reward.amount / 100).toFixed(2)}` : `${reward.amount} days`}
                    </Badge>
                    {!reward.claimed && (
                      <Button
                        size="sm"
                        onClick={() => handleClaimReward(reward.id)}
                        className="bg-light-blue hover:bg-light-blue/90"
                      >
                        Claim
                      </Button>
                    )}
                    {reward.claimed && (
                      <Badge variant="outline" className="text-keyword-green border-keyword-green">
                        Claimed
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referrals List */}
      {stats?.referrals && stats.referrals.length > 0 && (
        <Card className="border-in-active/50 bg-background-80">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Referrals ({stats.referrals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-3 rounded-lg bg-background-90 border border-in-active/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-light-blue/10 rounded-full flex items-center justify-center">
                      <Mail className="h-4 w-4 text-light-blue" />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {referral.firstname && referral.lastname 
                          ? `${referral.firstname} ${referral.lastname}`
                          : referral.email
                        }
                      </p>
                      <p className="text-text-secondary text-sm flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Joined {new Date(referral.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={referral.subscription?.plan === 'PRO' ? "default" : "secondary"}>
                    {referral.subscription?.plan || 'FREE'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ReferralDashboard