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
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

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

  useEffect(() => {
    fetchStats()
  }, [])

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
