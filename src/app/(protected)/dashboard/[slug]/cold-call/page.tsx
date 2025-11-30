'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Search, 
  Globe, 
  Mail, 
  DollarSign, 
  ArrowRight,
  Sparkles,
  MapPin,
  Building2,
  Phone,
  CheckCircle2,
  Lock
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import UpgradeModal from '@/components/global/upgrade-modal'
import { onUserInfo } from '@/actions/user'

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Find Leads',
    description: 'Discover small businesses without websites using AI-powered search',
    href: 'cold-call/find-leads',
    active: true,
  },
  {
    number: '02',
    icon: Globe,
    title: 'Generate Website',
    description: 'AI creates a stunning website preview for the business',
    href: 'cold-call/leads',
    active: true,
  },
  {
    number: '03',
    icon: Mail,
    title: 'Send Outreach',
    description: 'Email the business owner with their new website preview',
    href: 'cold-call/outreach',
    active: true,
  },
  {
    number: '04',
    icon: DollarSign,
    title: 'Close Deal',
    description: 'Client pays, you deliver the website and profit',
    href: 'cold-call/deals',
    active: true,
  },
]

export default function ColdCallPage() {
  const params = useParams()
  const slug = params.slug as string

  const [stats, setStats] = useState({
    totalLeads: 0,
    emailsSent: 0,
    dealsClosed: 0,
    revenue: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isPro, setIsPro] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    fetchStats()
    checkSubscription()
  }, [])

  const checkSubscription = async () => {
    try {
      const result = await onUserInfo()
      if (result.status === 200 && result.data) {
        setIsPro(result.data.subscription?.plan === 'PRO')
      }
    } catch (error) {
      console.error('Failed to check subscription:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/cold-call/stats')
      const data = await response.json()
      if (response.ok) {
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
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
    { label: 'Total Leads', value: stats.totalLeads, icon: Building2 },
    { label: 'Emails Sent', value: stats.emailsSent, icon: Mail },
    { label: 'Deals Closed', value: stats.dealsClosed, icon: CheckCircle2 },
    { label: 'Revenue', value: formatCurrency(stats.revenue), icon: DollarSign },
  ]

  // Show paywall for free users
  if (!isPro && !isLoading) {
    return (
      <div className="flex flex-col gap-8 p-6">
        <UpgradeModal 
          isOpen={showUpgradeModal} 
          onClose={() => setShowUpgradeModal(false)}
          feature="Cold Outreach"
        />
        
        {/* Clean paywall matching landing page style */}
        <div className="relative min-h-[80vh] flex items-center justify-center">
          {/* Background blur circles like landing page */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-muted/30 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-muted/30 rounded-full blur-3xl" />
          </div>

          {/* Main card with chains */}
          <div className="relative">
            {/* Chain links wrapping around card */}
            <div className="absolute -inset-8 pointer-events-none">
              {/* Top chain */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-1">
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={`top-${i}`}
                    className="w-8 h-12 border-4 border-foreground/20 rounded-full"
                    style={{ 
                      animation: `pulse 2s ease-in-out ${i * 0.1}s infinite`,
                    }}
                  />
                ))}
              </div>
              
              {/* Left chain */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={`left-${i}`}
                    className="w-12 h-8 border-4 border-foreground/20 rounded-full"
                    style={{ 
                      animation: `pulse 2s ease-in-out ${i * 0.1}s infinite`,
                    }}
                  />
                ))}
              </div>
              
              {/* Right chain */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={`right-${i}`}
                    className="w-12 h-8 border-4 border-foreground/20 rounded-full"
                    style={{ 
                      animation: `pulse 2s ease-in-out ${i * 0.1}s infinite`,
                    }}
                  />
                ))}
              </div>
              
              {/* Bottom chain */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1">
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={`bottom-${i}`}
                    className="w-8 h-12 border-4 border-foreground/20 rounded-full"
                    style={{ 
                      animation: `pulse 2s ease-in-out ${i * 0.1}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Lock icon floating above card */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-foreground shadow-2xl">
                <Lock className="h-10 w-10 text-background" />
              </div>
            </div>

            {/* Main upgrade card - matching landing page style */}
            <div className="relative rounded-3xl border border-border bg-background p-10 shadow-2xl max-w-lg">
              <div className="text-center">
                {/* Badge */}
                <span className="inline-flex items-center gap-2 rounded-full bg-muted px-5 py-2.5 text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4" />
                  Pro Feature
                </span>

                <h2 className="text-3xl font-bold tracking-tight mb-4">
                  Unlock Cold Outreach
                </h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  Find businesses without websites and sell them one. Generate leads and close deals on autopilot.
                </p>
                
                {/* Features grid */}
                <div className="grid grid-cols-2 gap-4 mb-8 text-left">
                  {[
                    { icon: Search, text: 'AI lead discovery' },
                    { icon: Globe, text: 'Website previews' },
                    { icon: Mail, text: 'Email templates' },
                    { icon: DollarSign, text: 'Deal tracking' },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button - matching landing page style */}
                <Button 
                  onClick={() => setShowUpgradeModal(true)}
                  size="lg"
                  className="w-full h-14 text-lg bg-foreground text-background hover:bg-foreground/90 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  Upgrade to Pro
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <p className="mt-4 text-sm text-muted-foreground">
                  $29/month • Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background">
            <Phone className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cold Call</h1>
            <p className="text-muted-foreground">
              Find businesses without websites and sell them one
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {isLoading ? (
          // Skeleton loading
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6 bg-background/50 border-border/50">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </Card>
          ))
        ) : (
          // Real stats
          statsData.map((stat) => (
            <Card key={stat.label} className="p-6 bg-background/50 border-border/50">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <stat.icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* How it works - Onboarding style */}
      <div className="mt-4">
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            How it works
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Link 
              key={step.title} 
              href={`/dashboard/${slug}/${step.href}`}
              className="group"
            >
              <Card className={`relative p-6 h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${
                step.active 
                  ? 'border-foreground/50 bg-foreground/5' 
                  : 'border-border/50 bg-background/50 opacity-60'
              }`}>
                {/* Step number badge */}
                <span className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background shadow-lg">
                  {step.number}
                </span>

                {/* Icon */}
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${
                  step.active ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
                }`}>
                  <step.icon className="h-7 w-7" />
                </div>

                {/* Content */}
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow */}
                {step.active && (
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-foreground">
                    Get started
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                )}

                {!step.active && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    Coming soon
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick start CTA */}
      <Card className="p-8 bg-gradient-to-r from-foreground/5 to-foreground/10 border-foreground/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground text-background">
              <MapPin className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Ready to find your first leads?</h3>
              <p className="text-muted-foreground">
                Search for businesses in any city and start selling websites today
              </p>
            </div>
          </div>
          <Link href={`/dashboard/${slug}/cold-call/find-leads`}>
            <Button size="lg" className="rounded-full px-8">
              <Search className="mr-2 h-5 w-5" />
              Find Leads
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
