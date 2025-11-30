'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Send,
  Users,
  Target,
  TrendingUp,
  Play,
  Pause,
  RefreshCw,
  XCircle,
  MessageCircle,
  ExternalLink,
  Rocket,
  Plus,
  UserPlus,
  Zap,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

type Prospect = {
  id: string
  username: string
  fullName: string | null
  followers: number | null
  bio: string | null
  status: string
  relevanceScore: number | null
  painPoint: string | null
  sentAt: string | null
  repliedAt: string | null
}

type Campaign = {
  id: string
  name: string
  status: string
  searchMode: string
  keywords: string[]
  hashtags: string[]
  pitchStyle: string
  dailyLimit: number
  totalSent: number
  totalReplied: number
  totalInterested: number
  dealsWon: number
  prospects: Prospect[]
  _count: { prospects: number }
}

export default function CampaignDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const campaignId = params.id as string

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isFinding, setIsFinding] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [showAddProspect, setShowAddProspect] = useState(false)
  const [newProspect, setNewProspect] = useState({ username: '', bio: '' })

  useEffect(() => {
    fetchCampaign()
  }, [campaignId])

  const fetchCampaign = async () => {
    try {
      const response = await fetch(`/api/deal-finder/campaigns/${campaignId}`)
      const data = await response.json()
      if (response.ok) {
        setCampaign(data.campaign)
      } else {
        toast.error('Campaign not found')
      }
    } catch (error) {
      console.error('Failed to fetch campaign:', error)
      toast.error('Failed to load campaign')
    } finally {
      setIsLoading(false)
    }
  }

  // Run campaign - finds prospects AND sends DMs automatically
  const runCampaign = async () => {
    setIsRunning(true)
    try {
      const response = await fetch('/api/deal-finder/run-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success(data.message || `Found prospects and sent ${data.dmsSent} DMs!`)
        fetchCampaign()
      } else {
        toast.error(data.error || 'Failed to run campaign')
      }
    } catch (error) {
      toast.error('Failed to run campaign')
    } finally {
      setIsRunning(false)
    }
  }

  // Just find prospects without sending DMs
  const findProspects = async () => {
    setIsFinding(true)
    try {
      const response = await fetch('/api/deal-finder/find-prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, limit: 20 }),
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success(data.message || 'Found new prospects!')
        fetchCampaign()
      } else {
        toast.error(data.error || 'Failed to find prospects')
      }
    } catch (error) {
      toast.error('Failed to find prospects')
    } finally {
      setIsFinding(false)
    }
  }

  // Send DMs to all pending prospects
  const sendAllDMs = async () => {
    setIsSending(true)
    try {
      const response = await fetch('/api/deal-finder/run-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, action: 'send-pending' }),
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success(data.message || `Sent ${data.dmsSent} DMs!`)
        fetchCampaign()
      } else {
        toast.error(data.error || 'Failed to send DMs')
      }
    } catch (error) {
      toast.error('Failed to send DMs')
    } finally {
      setIsSending(false)
    }
  }

  const sendDM = async (prospectId: string) => {
    setIsSending(true)
    try {
      const response = await fetch('/api/deal-finder/send-dm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectId, campaignId }),
      })

      if (response.ok) {
        toast.success('DM sent successfully!')
        fetchCampaign()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to send DM')
      }
    } catch (error) {
      toast.error('Failed to send DM')
    } finally {
      setIsSending(false)
    }
  }

  const addProspect = async () => {
    if (!newProspect.username) {
      toast.error('Username is required')
      return
    }

    try {
      const response = await fetch('/api/deal-finder/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          username: newProspect.username,
          bio: newProspect.bio,
        }),
      })

      if (response.ok) {
        toast.success('Prospect added!')
        setNewProspect({ username: '', bio: '' })
        setShowAddProspect(false)
        fetchCampaign()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to add prospect')
      }
    } catch (error) {
      toast.error('Failed to add prospect')
    }
  }

  const toggleCampaignStatus = async () => {
    if (!campaign) return

    const newStatus = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    try {
      const response = await fetch(`/api/deal-finder/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success(`Campaign ${newStatus.toLowerCase()}`)
        fetchCampaign()
      }
    } catch (error) {
      toast.error('Failed to update campaign')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FOUND':
        return 'bg-gray-500/10 text-gray-500'
      case 'QUEUED':
        return 'bg-blue-500/10 text-blue-500'
      case 'DM_SENT':
        return 'bg-yellow-500/10 text-yellow-500'
      case 'REPLIED':
        return 'bg-green-500/10 text-green-500'
      case 'INTERESTED':
        return 'bg-purple-500/10 text-purple-500'
      case 'DEAL_CLOSED':
        return 'bg-emerald-500/10 text-emerald-500'
      case 'NOT_INTERESTED':
        return 'bg-red-500/10 text-red-500'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pb-10">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <XCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Campaign not found</h2>
        <Link href={`/dashboard/${slug}/deal-finder`}>
          <Button variant="outline">Go back</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/${slug}/deal-finder`}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge className={campaign.status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'}>
                {campaign.status}
              </Badge>
              <span className="text-muted-foreground">
                {campaign.searchMode.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={toggleCampaignStatus}
            className="rounded-full"
          >
            {campaign.status === 'ACTIVE' ? (
              <>
                <Pause className="mr-2 h-4 w-4" /> Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" /> Activate
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={findProspects}
            disabled={isFinding}
            className="rounded-full"
          >
            {isFinding ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Finding...
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" /> Find Only
              </>
            )}
          </Button>
          <Button
            onClick={runCampaign}
            disabled={isRunning || isFinding}
            className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"
          >
            {isRunning ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Running...
              </>
            ) : (
              <>
                <Rocket className="mr-2 h-4 w-4" /> Run Campaign
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total Prospects', value: campaign._count.prospects, icon: Users, color: 'text-blue-500' },
          { label: 'DMs Sent', value: campaign.totalSent, icon: Send, color: 'text-purple-500' },
          { label: 'Replied', value: campaign.totalReplied, icon: MessageCircle, color: 'text-green-500' },
          { label: 'Deals Won', value: campaign.dealsWon, icon: TrendingUp, color: 'text-orange-500' },
        ].map((stat) => (
          <Card key={stat.label} className="p-6 border-border/50">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Prospects List */}
      <Card className="p-6 border-border/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Prospects</h2>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">
              {campaign.prospects.length} prospects
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddProspect(!showAddProspect)}
              className="rounded-full"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Manually
            </Button>
            {campaign.prospects.filter(p => p.status === 'FOUND').length > 0 && (
              <Button
                size="sm"
                onClick={sendAllDMs}
                disabled={isSending}
                className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
              >
                <Zap className="mr-2 h-4 w-4" />
                Send All DMs ({campaign.prospects.filter(p => p.status === 'FOUND').length})
              </Button>
            )}
          </div>
        </div>

        {/* Add Prospect Form */}
        {showAddProspect && (
          <div className="mb-6 p-4 rounded-xl border border-border/50 bg-muted/30">
            <h3 className="font-semibold mb-3">Add Prospect Manually</h3>
            <div className="flex gap-3">
              <Input
                placeholder="@username"
                value={newProspect.username}
                onChange={(e) =>
                  setNewProspect({ ...newProspect, username: e.target.value })
                }
                className="flex-1"
              />
              <Input
                placeholder="Bio or notes (optional)"
                value={newProspect.bio}
                onChange={(e) =>
                  setNewProspect({ ...newProspect, bio: e.target.value })
                }
                className="flex-1"
              />
              <Button onClick={addProspect}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
        )}

        {campaign.prospects.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No prospects yet</h3>
            <p className="text-muted-foreground mb-6">
              Click &quot;Run Campaign&quot; to find clients and send DMs automatically
            </p>
            <Button 
              onClick={runCampaign} 
              disabled={isRunning}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              <Rocket className="mr-2 h-4 w-4" />
              Run Campaign
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {campaign.prospects.map((prospect) => (
              <div
                key={prospect.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {prospect.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">@{prospect.username}</span>
                      {prospect.relevanceScore && (
                        <Badge variant="outline" className="text-xs">
                          {prospect.relevanceScore}% match
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {prospect.bio || prospect.painPoint || 'No bio'}
                    </p>
                    {prospect.followers && (
                      <span className="text-xs text-muted-foreground">
                        {prospect.followers.toLocaleString()} followers
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(prospect.status)}>
                    {prospect.status.replace('_', ' ')}
                  </Badge>
                  
                  {prospect.status === 'FOUND' && (
                    <Button
                      size="sm"
                      onClick={() => sendDM(prospect.id)}
                      disabled={isSending}
                      className="rounded-full"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Send DM
                    </Button>
                  )}
                  
                  <a
                    href={`https://instagram.com/${prospect.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
