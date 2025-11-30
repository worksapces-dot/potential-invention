'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Brain,
  Target,
  Send,
  TrendingUp,
  Sparkles,
  Plus,
  ArrowRight,
  Users,
  MessageCircle,
  DollarSign,
  Zap,
  Play,
  CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

export default function DealFinderPage() {
  const params = useParams()
  const slug = params.slug as string

  const [stats, setStats] = useState({
    totalSent: 0,
    totalOpened: 0,
    totalReplied: 0,
    totalInterested: 0,
    dealsWon: 0,
    totalRevenue: 0,
    activeCampaigns: 0,
  })
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, campaignsRes] = await Promise.all([
        fetch('/api/deal-finder/stats'),
        fetch('/api/deal-finder/campaigns'),
      ])

      const statsData = await statsRes.json()
      const campaignsData = await campaignsRes.json()

      setStats(statsData)
      setCampaigns(campaignsData.campaigns || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(cents / 100)
  }

  const statsData = [
    { label: 'DMs Sent', value: stats.totalSent, icon: Send, color: 'text-blue-500' },
    { label: 'Opened', value: stats.totalOpened, icon: MessageCircle, color: 'text-green-500' },
    { label: 'Replied', value: stats.totalReplied, icon: Users, color: 'text-purple-500' },
    { label: 'Deals Won', value: stats.dealsWon, icon: TrendingUp, color: 'text-orange-500' },
  ]

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 shadow-lg">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Deal Finder AI</h1>
              <p className="text-muted-foreground text-lg">
                Your personal business development agent
              </p>
            </div>
          </div>
          <Link href={`/dashboard/${slug}/deal-finder/campaigns/new`}>
            <Button size="lg" className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg">
              <Plus className="mr-2 h-5 w-5" />
              New Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6 border-border/50 bg-background/50">
              <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </Card>
          ))
        ) : (
          statsData.map((stat) => (
            <Card key={stat.label} className="group p-6 border-border/50 bg-background/50 hover:shadow-xl hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-muted to-muted/50 ${stat.color} transition-transform group-hover:scale-110`}>
                  <stat.icon className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Revenue Card */}
      {stats.totalRevenue > 0 && (
        <Card className="p-8 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 border-green-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                <DollarSign className="h-8 w-8" />
              </div>
              <div>
                <p className="text-4xl font-bold text-green-600 mb-1">
                  {formatCurrency(stats.totalRevenue)}
                </p>
                <p className="text-muted-foreground text-lg">Total Revenue Generated 🎉</p>
              </div>
            </div>
            <Sparkles className="h-10 w-10 text-green-500 animate-pulse" />
          </div>
        </Card>
      )}

      {/* AI Profile Section */}
      <Card className="p-8 border-2 border-dashed border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-pink-500/5 hover:shadow-xl transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
              <Brain className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">AI Profile Analysis</h3>
              <p className="text-muted-foreground">
                Let AI learn your business from your Instagram content
              </p>
            </div>
          </div>
          <Link href={`/dashboard/${slug}/deal-finder/analyze`}>
            <Button size="lg" className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg">
              <Sparkles className="mr-2 h-5 w-5" />
              Analyze Profile
            </Button>
          </Link>
        </div>
      </Card>

      {/* Active Campaigns */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Active Campaigns</h2>
            <p className="text-muted-foreground text-lg mt-1">
              {stats.activeCampaigns} campaign{stats.activeCampaigns !== 1 ? 's' : ''} running
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="p-8 border-border/50">
                <Skeleton className="h-32 w-full" />
              </Card>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <Card className="p-16 text-center border-2 border-dashed border-border/50 bg-muted/20">
            <Target className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
            <h3 className="text-2xl font-bold mb-3">No campaigns yet</h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Create your first campaign to start finding deals automatically
            </p>
            <Link href={`/dashboard/${slug}/deal-finder/campaigns/new`}>
              <Button size="lg" className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg">
                <Plus className="mr-2 h-5 w-5" />
                Create Campaign
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {campaigns.slice(0, 4).map((campaign) => (
              <Link
                key={campaign.id}
                href={`/dashboard/${slug}/deal-finder/campaigns/${campaign.id}`}
              >
                <Card className="group p-8 border-border/50 bg-background/50 hover:shadow-2xl hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-2 cursor-pointer">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-xl mb-2">{campaign.name}</h3>
                      <span className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 font-medium">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        {campaign.status}
                      </span>
                    </div>
                    <ArrowRight className="h-6 w-6 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>

                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <p className="text-3xl font-bold mb-1">{campaign.totalSent}</p>
                      <p className="text-sm text-muted-foreground">Sent</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold mb-1">{campaign.totalReplied}</p>
                      <p className="text-sm text-muted-foreground">Replied</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold mb-1 text-green-600">{campaign.dealsWon}</p>
                      <p className="text-sm text-muted-foreground">Deals</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* How it works */}
      <Card className="p-10 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border-purple-500/30 shadow-lg">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="text-2xl font-bold">How It Works</h3>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: '01',
              icon: Brain,
              title: 'AI Learns Your Business',
              description: 'Analyzes your Instagram posts, reels, and bio to understand what you offer',
            },
            {
              step: '02',
              icon: Target,
              title: 'Finds Perfect Prospects',
              description: 'Searches Instagram using hashtags, keywords, and location to find ideal clients',
            },
            {
              step: '03',
              icon: Send,
              title: 'Sends Personalized DMs',
              description: 'AI writes custom pitches for each prospect and sends them automatically',
            },
          ].map((item) => (
            <div key={item.step} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
                    <item.icon className="h-8 w-8" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background text-sm font-bold shadow-lg">
                    {item.step}
                  </span>
                </div>
                <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
