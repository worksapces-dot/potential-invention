'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Zap,
  Phone,
  Sparkles,
  MessageSquare,
  ArrowRight,
  Check,
  Users,
  TrendingUp,
  Bot,
  Target,
  Rocket,
  Send,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

type UserType = 'CREATOR' | 'COLD_CALLER' | 'BOTH'

const userTypes = [
  {
    id: 'CREATOR' as UserType,
    title: 'Creator / Business',
    subtitle: 'Instagram Automation',
    description: 'Automate DMs, reply to comments, and grow your Instagram engagement',
    icon: MessageSquare,
    features: [
      { icon: Bot, text: 'Auto-reply to DMs with AI' },
      { icon: MessageSquare, text: 'Comment automation' },
      { icon: Target, text: 'Keyword triggers' },
      { icon: Users, text: 'Lead capture' },
    ],
  },
  {
    id: 'COLD_CALLER' as UserType,
    title: 'Agency / Freelancer',
    subtitle: 'Cold Outreach',
    description: 'Find businesses without websites and sell them one',
    icon: Phone,
    features: [
      { icon: Target, text: 'AI lead discovery' },
      { icon: Rocket, text: 'Website generation' },
      { icon: Send, text: 'Email outreach' },
      { icon: TrendingUp, text: 'Deal tracking & invoicing' },
    ],
  },
  {
    id: 'BOTH' as UserType,
    title: 'Power User',
    subtitle: 'Full Access',
    description: 'Get access to all features - automation and cold outreach',
    icon: Sparkles,
    features: [
      { icon: Check, text: 'Everything in Creator' },
      { icon: Check, text: 'Everything in Cold Outreach' },
      { icon: Zap, text: 'Priority support' },
      { icon: Rocket, text: 'Early access to new features' },
    ],
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = async () => {
    if (!selected) {
      toast.error('Please select how you want to use Slide')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userType: selected }),
      })

      if (!response.ok) {
        throw new Error('Failed to save preferences')
      }

      const data = await response.json()
      toast.success('Welcome to Slide!')
      router.push(`/dashboard/${data.slug}`)
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - matching landing page */}
      <header className="sticky top-4 z-50 w-full px-4 lg:px-8">
        <div className="container mx-auto max-w-5xl rounded-2xl bg-background/70 backdrop-blur-xl border border-border/50 shadow-lg shadow-black/5">
          <div className="flex h-16 items-center justify-between px-4 lg:px-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground transition-transform group-hover:scale-105">
                <Zap className="h-4 w-4 text-background" fill="currentColor" />
              </div>
              <span className="text-lg font-bold tracking-tight">Slide</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-16 md:py-20">
        {/* Background effects - matching landing page */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-muted/50 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-muted/50 rounded-full blur-3xl" />
        </div>

        <div className="container relative mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-5xl">
            {/* Top badge */}
            <div className="mb-8 md:mb-12 text-center animate-fade-in">
              <span className="inline-flex items-center gap-2 rounded-full bg-muted px-5 py-2.5 text-sm font-medium text-foreground">
                <Sparkles className="h-4 w-4" />
                Welcome to Slide
              </span>
            </div>

            {/* Main headline */}
            <div className="mb-8 md:mb-10 text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] animate-slide-up">
                How will you use
              </h1>
              <div className="mt-4 md:mt-6 flex items-center justify-center gap-3 md:gap-4 animate-slide-up delay-100">
                <span className="inline-flex items-center gap-2 md:gap-3 rounded-full bg-foreground px-5 py-2.5 md:px-7 md:py-3.5 text-background shadow-xl">
                  <Zap className="h-4 w-4 md:h-5 md:w-5" fill="currentColor" />
                  <span className="text-xl md:text-2xl lg:text-3xl font-bold">Slide</span>
                </span>
                <span className="text-3xl md:text-5xl lg:text-6xl font-bold">?</span>
              </div>
            </div>

            {/* Subtitle */}
            <p className="mx-auto mb-10 md:mb-12 max-w-2xl text-center text-lg md:text-xl text-muted-foreground leading-relaxed animate-slide-up delay-200">
              Choose your primary use case. We&apos;ll customize your experience.
              <br className="hidden md:block" />
              You can always change this later in settings.
            </p>

            {/* Options - Card grid */}
            <div className="grid gap-4 md:gap-6 md:grid-cols-3 mb-10 md:mb-12 animate-slide-up delay-300">
              {userTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => setSelected(type.id)}
                  className={`relative rounded-3xl border-2 p-6 md:p-8 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    selected === type.id
                      ? 'border-foreground bg-foreground/5 shadow-xl'
                      : 'border-border/50 bg-background/50 hover:border-foreground/30'
                  }`}
                >
                  {/* Selected indicator */}
                  {selected === type.id && (
                    <div className="absolute top-4 right-4">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground shadow-lg">
                        <Check className="h-4 w-4 text-background" />
                      </div>
                    </div>
                  )}

                  {/* Icon */}
                  <div className="mb-5 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-muted transition-transform group-hover:scale-105">
                    <type.icon className="h-7 w-7 md:h-8 md:w-8 text-foreground" />
                  </div>

                  {/* Title & subtitle */}
                  <h3 className="text-xl md:text-2xl font-bold mb-1">{type.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{type.subtitle}</p>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{type.description}</p>

                  {/* Features */}
                  <ul className="space-y-3">
                    {type.features.map((feature) => (
                      <li key={feature.text} className="flex items-center gap-3 text-sm">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-muted">
                          <feature.icon className="h-3.5 w-3.5 text-foreground" />
                        </div>
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="flex flex-col items-center gap-5 animate-slide-up delay-400">
              <Button
                size="lg"
                onClick={handleContinue}
                disabled={!selected || isLoading}
                className="group h-14 md:h-16 px-10 md:px-14 text-base md:text-lg bg-foreground text-background hover:bg-foreground/90 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  'Setting up your account...'
                ) : (
                  <>
                    Continue to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                You can access all features anytime from settings
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
