"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ChatWidget } from "@/components/landing/chat-widget"
import {
  Zap,
  Menu,
  X,
  ArrowRight,
  MessageCircle,
  Sparkles,
  Target,
  BarChart3,
  Bot,
  Link2,
  Play,
  Rocket,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Building2,
  Megaphone,
  Users,
  Star,
  Quote,
  Send,
  Heart,
} from "lucide-react"

// ============================================================================
// SOCIAL ICONS
// ============================================================================

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFDC80" />
          <stop offset="25%" stopColor="#F77737" />
          <stop offset="50%" stopColor="#F56040" />
          <stop offset="75%" stopColor="#C13584" />
          <stop offset="100%" stopColor="#833AB4" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig-gradient)" strokeWidth="2.5" fill="none" />
      <circle cx="12" cy="12" r="4" stroke="url(#ig-gradient)" strokeWidth="2.5" fill="none" />
      <circle cx="18" cy="6" r="1.8" fill="url(#ig-gradient)" />
    </svg>
  )
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

// ============================================================================
// HEADER
// ============================================================================

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-4 z-50 w-full px-4 lg:px-8">
      <div className="container mx-auto rounded-2xl bg-background/70 backdrop-blur-xl border border-border/50 shadow-lg shadow-black/5">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground transition-transform group-hover:scale-105">
              <Zap className="h-4 w-4 text-background" fill="currentColor" />
            </div>
            <span className="text-lg font-bold tracking-tight">Slide</span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {["Features", "How It Works", "Use Cases", "Pricing"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item}
              </Link>
            ))}
            <Link
              href="/changelog"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Changelog
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" className="hidden text-sm font-medium sm:inline-flex">
                Log in
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6 h-10 font-medium shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                Get started
              </Button>
            </Link>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border/50">
            <nav className="px-4 py-6 flex flex-col gap-4">
              {["Features", "How It Works", "Use Cases", "Pricing"].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                  className="text-lg font-medium py-2 transition-colors hover:text-muted-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
              <Link
                href="/changelog"
                className="text-lg font-medium py-2 transition-colors hover:text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Changelog
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

// ============================================================================
// HERO SECTION
// ============================================================================

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-16 md:py-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-muted/50 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-muted/50 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          {/* Top badges */}
          <div className="mb-8 md:mb-10 flex flex-wrap items-center justify-center gap-3 animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium text-foreground">
              <Sparkles className="h-4 w-4" />
              DM Automation
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 px-4 py-2 text-sm font-medium text-foreground">
              <Target className="h-4 w-4 text-blue-500" />
              Cold Calling AI
            </span>
          </div>

          {/* Main headline */}
          <div className="mb-8 md:mb-10">
            <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.1] animate-slide-up">
              Find clients.
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Close deals.
              </span>
            </h1>

            {/* Pills with floating icons inline */}
            <div className="mt-6 md:mt-8 flex flex-wrap items-center justify-center gap-3 md:gap-4 lg:gap-5 animate-slide-up delay-100">
              {/* Building icon - animated floating */}
              <div className="hidden sm:block animate-float">
                <div className="flex h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl shadow-blue-500/25 transition-all duration-300 hover:scale-110">
                  <Building2 className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-white" />
                </div>
              </div>

              {/* Leads pill */}
              <span className="inline-flex items-center gap-2 md:gap-3 rounded-full bg-foreground px-5 py-2.5 md:px-7 md:py-3.5 text-background shadow-xl">
                <Users className="h-4 w-4 md:h-5 md:w-5" />
                <span className="text-xl md:text-2xl lg:text-3xl font-bold">Leads</span>
              </span>

              <span className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold">→</span>

              {/* Clients pill */}
              <span className="inline-flex items-center gap-2 md:gap-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-5 py-2.5 md:px-7 md:py-3.5 text-white shadow-xl shadow-purple-500/25">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                <span className="text-xl md:text-2xl lg:text-3xl font-bold">Clients</span>
              </span>

              {/* Globe icon - animated floating with delay */}
              <div className="hidden sm:block animate-float-reverse" style={{ animationDelay: "0.5s" }}>
                <div className="flex h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-2xl shadow-purple-500/25 transition-all duration-300 hover:scale-110">
                  <Rocket className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Subtitle */}
          <p className="mx-auto mb-10 md:mb-12 max-w-3xl text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed animate-slide-up delay-200">
            AI-powered cold calling that finds local businesses without websites,
            <br className="hidden md:block" />
            generates stunning previews, and helps you close deals on autopilot.
          </p>

          {/* Feature bullets - Cold Call focused */}
          <div className="mb-10 md:mb-14 animate-slide-up delay-300">
            <p className="mb-5 text-sm text-muted-foreground tracking-wider uppercase">Everything you need to grow...</p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 md:gap-x-8 gap-y-3 text-sm md:text-base font-medium">
              {["AI Lead Discovery", "Website Generator", "Auto Proposals", "Payment Links"].map((item) => (
                <span key={item} className="text-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 md:gap-x-8 gap-y-3 text-sm md:text-base font-medium">
              {["DM Automation", "Comment Replies", "Analytics Dashboard", "Recurring Billing"].map((item) => (
                <span key={item} className="text-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-400">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="group h-14 md:h-16 px-10 md:px-14 text-base md:text-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 rounded-full shadow-xl shadow-purple-500/25 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                Start finding clients
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="group h-14 md:h-16 px-8 md:px-10 text-base md:text-lg rounded-full transition-all duration-300 hover:-translate-y-1"
              >
                <InstagramIcon className="mr-2 h-5 w-5" />
                Automate DMs
              </Button>
            </Link>
          </div>
          <p className="mt-5 text-sm md:text-base text-muted-foreground">Free plan available. No credit card required.</p>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-slide-up delay-500">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold">500+</p>
              <p className="text-sm text-muted-foreground mt-1">Deals Closed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold">10K+</p>
              <p className="text-sm text-muted-foreground mt-1">Leads Found</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold">$2M+</p>
              <p className="text-sm text-muted-foreground mt-1">Revenue Generated</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// FEATURES SECTION
// ============================================================================

const features = [
  {
    icon: MessageCircle,
    title: "Auto DM Replies",
    description: "Automatically respond to Instagram DMs based on keywords. Never miss a lead or customer inquiry again.",
    tag: "Popular",
  },
  {
    icon: Target,
    title: "Keyword Triggers",
    description: "Set up custom keywords that trigger automated responses. Perfect for giveaways, promos, and lead capture.",
    tag: null,
  },
  {
    icon: Bot,
    title: "Smart AI Responses",
    description: "Let AI craft personalized replies based on context. Engage followers with human-like conversations.",
    tag: "Pro",
  },
  {
    icon: Heart,
    title: "Comment Automation",
    description: "Auto-reply to comments on your posts. Turn engagement into conversations and sales opportunities.",
    tag: null,
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track DMs sent, comments replied, and conversion rates. Measure what matters for your growth.",
    tag: "New",
  },
  {
    icon: Rocket,
    title: "Cold Outreach",
    description: "Find and reach potential clients automatically. Generate leads and grow your business with AI-powered outreach.",
    tag: "Pro",
  },
]

function FeaturesSection() {
  return (
    <section id="features" className="py-24 lg:py-36 border-t border-border/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto mb-16 md:mb-20 max-w-2xl text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-muted px-5 py-2.5 text-sm font-medium text-foreground">
            <Zap className="h-4 w-4" />
            Features
          </span>
          <h2 className="mb-5 text-balance text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight">
            Everything you need to automate Instagram
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            From DM automation to AI-powered responses, grow your Instagram on autopilot.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-5 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative rounded-3xl border border-border bg-background p-7 md:p-8 hover-lift cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {feature.tag && (
                <span className="absolute top-5 right-5 rounded-full bg-foreground/10 px-3 py-1 text-xs font-semibold text-foreground">
                  {feature.tag}
                </span>
              )}
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground text-background transition-transform group-hover:scale-110">
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// HOW IT WORKS SECTION
// ============================================================================

const steps = [
  {
    number: "01",
    icon: Link2,
    title: "Connect Instagram",
    description: "Link your Instagram account in seconds. Secure OAuth connection, no password sharing required.",
  },
  {
    number: "02",
    icon: Play,
    title: "Set Up Triggers",
    description: "Create keyword triggers and AI prompts. Define what happens when someone comments or DMs you.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Watch It Work",
    description: "Activate your automation and let it run 24/7. Track performance in your analytics dashboard.",
  },
]

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-muted/30 py-24 lg:py-36">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto mb-16 md:mb-20 max-w-2xl text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-medium text-foreground shadow-sm">
            How It Works
          </span>
          <h2 className="mb-5 text-balance text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight">
            Start automating in 3 steps
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Connect your Instagram, set up triggers, and let AI handle the rest.
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="relative grid gap-8 md:gap-6 md:grid-cols-3">
            <div className="absolute left-[20%] right-[20%] top-12 hidden h-0.5 bg-gradient-to-r from-foreground via-muted-foreground to-foreground md:block" />

            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center group">
                <div className="mb-8 flex justify-center">
                  <div className="relative">
                    <div
                      className={`flex h-24 w-24 items-center justify-center rounded-3xl ${i === 1 ? "bg-muted-foreground" : "bg-foreground"} text-background shadow-2xl transition-all duration-300 group-hover:scale-110`}
                    >
                      <step.icon className="h-10 w-10" strokeWidth={1.5} />
                    </div>
                    <span className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full bg-background text-sm font-bold shadow-lg border-2 border-border">
                      {step.number}
                    </span>
                  </div>
                </div>
                <h3 className="mb-4 text-2xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// BENEFITS SECTION
// ============================================================================

const benefits = [
  {
    icon: Clock,
    title: "Reply Instantly 24/7",
    description: "Never miss a DM or comment again. Respond to followers even while you sleep.",
  },
  {
    icon: TrendingUp,
    title: "Convert More Leads",
    description: "Turn casual commenters into paying customers with automated follow-up sequences.",
  },
  {
    icon: CheckCircle2,
    title: "Grow Engagement",
    description: "Boost your engagement rate by responding to every comment and DM automatically.",
  },
  {
    icon: Bot,
    title: "AI That Sounds Like You",
    description: "Smart AI responses that match your brand voice. Personal touch at scale.",
  },
]

function BenefitsSection() {
  return (
    <section className="py-24 lg:py-36 border-t border-border/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-muted px-5 py-2.5 text-sm font-medium text-foreground">
                Why Slide
              </span>
              <h2 className="mb-6 text-balance text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight">
                Why creators choose Slide
              </h2>
              <p className="mb-10 text-lg md:text-xl text-muted-foreground leading-relaxed">
                Join thousands of creators and businesses automating their Instagram engagement.
              </p>

              <div className="grid gap-6 sm:grid-cols-2">
                {benefits.map((benefit) => (
                  <div
                    key={benefit.title}
                    className="group flex gap-4 p-4 rounded-2xl transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background transition-transform group-hover:scale-105">
                      <benefit.icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="mb-1.5 font-semibold text-lg">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats card */}
            <div className="relative">
              <div className="rounded-[2rem] border border-border bg-background p-8 md:p-10 shadow-2xl hover-lift">
                <div className="mb-8 flex items-center justify-between">
                  <span className="font-semibold text-lg">Automation Performance</span>
                  <span className="flex items-center gap-2 rounded-full bg-foreground/10 px-4 py-1.5 text-xs font-semibold text-foreground">
                    <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
                    Live
                  </span>
                </div>

                <div className="space-y-8">
                  {[
                    { label: "DMs Sent", value: "12,847", width: "85%" },
                    { label: "Comments Replied", value: "8,234", width: "72%" },
                    { label: "Response Rate", value: "99.8%", width: "99%" },
                  ].map((stat, i) => (
                    <div key={stat.label}>
                      <div className="mb-4 flex justify-between items-end">
                        <span className="text-muted-foreground">{stat.label}</span>
                        <span className="font-bold text-2xl flex items-center gap-1">
                          {stat.value}
                          <ArrowUpRight className="h-4 w-4 text-foreground" />
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${i === 1 ? "bg-muted-foreground" : "bg-foreground"} transition-all duration-1000`}
                          style={{ width: stat.width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// USE CASES SECTION
// ============================================================================

const useCases = [
  {
    icon: InstagramIcon,
    title: "Content Creators",
    description: "Engage with your audience automatically. Run giveaways, capture leads, and grow your following.",
    examples: ["Giveaway automation", "Lead magnets", "Fan engagement"],
  },
  {
    icon: Megaphone,
    title: "Influencers",
    description: "Handle brand inquiries and collaboration requests automatically. Never miss an opportunity.",
    examples: ["Brand outreach", "Rate card delivery", "Collab responses"],
  },
  {
    icon: Building2,
    title: "E-commerce Brands",
    description: "Convert Instagram followers into customers with automated product info and support.",
    examples: ["Product inquiries", "Order support", "Promo codes"],
  },
  {
    icon: Users,
    title: "Coaches & Consultants",
    description: "Qualify leads and book calls automatically. Turn DMs into discovery calls.",
    examples: ["Lead qualification", "Calendar booking", "Course sales"],
  },
]

function UseCasesSection() {
  return (
    <section id="use-cases" className="bg-muted/30 py-24 lg:py-36">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto mb-16 md:mb-20 max-w-2xl text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-medium text-foreground shadow-sm">
            Use Cases
          </span>
          <h2 className="mb-5 text-balance text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight">
            Built for Instagram growth
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            {"Whether you're a solo creator or a growing brand, Slide scales with you."}
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {useCases.map((useCase) => (
            <div
              key={useCase.title}
              className="group relative rounded-3xl border border-border bg-background p-8 md:p-10 overflow-hidden hover-lift cursor-pointer"
            >
              <div className="relative">
                <div className="mb-6 flex items-center gap-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground text-background transition-transform group-hover:scale-110">
                    <useCase.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold">{useCase.title}</h3>
                    <ArrowRight className="h-5 w-5 text-muted-foreground mt-1 transition-transform group-hover:translate-x-2" />
                  </div>
                </div>
                <p className="mb-6 text-muted-foreground leading-relaxed text-lg">{useCase.description}</p>
                <div className="flex flex-wrap gap-2">
                  {useCase.examples.map((example) => (
                    <span
                      key={example}
                      className="rounded-full bg-foreground/10 px-4 py-2 text-sm font-medium text-foreground"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// TESTIMONIALS SECTION
// ============================================================================

const testimonials = [
  {
    quote:
      "Slide helped me respond to 500+ DMs during my product launch. I would have missed so many sales without it!",
    author: "Sarah Chen",
    role: "Content Creator",
    company: "150K followers",
    avatar: "SC",
  },
  {
    quote:
      "The AI responses are incredible. My followers can't tell it's automated. Engagement is up 3x since I started using Slide.",
    author: "Marcus Rodriguez",
    role: "Fitness Coach",
    company: "80K followers",
    avatar: "MR",
  },
  {
    quote:
      "We run all our giveaways through Slide now. Automatic DMs to winners, keyword entries, everything. Total game-changer.",
    author: "Emily Watson",
    role: "Brand Manager",
    company: "StyleCo",
    avatar: "EW",
  },
]

function TestimonialsSection() {
  return (
    <section className="py-24 lg:py-36 border-t border-border/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto mb-16 md:mb-20 max-w-2xl text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-muted px-5 py-2.5 text-sm font-medium text-foreground">
            Testimonials
          </span>
          <h2 className="mb-5 text-balance text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight">
            Loved by creators everywhere
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            See how creators are growing their Instagram with Slide.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="group relative rounded-3xl border border-border bg-background p-8 md:p-10 hover-lift"
            >
              <Quote className="absolute top-6 right-6 h-10 w-10 text-muted/30" />

              <div className="mb-6 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-foreground text-foreground" />
                ))}
              </div>

              <p className="mb-10 text-muted-foreground leading-relaxed text-lg">{`"${testimonial.quote}"`}</p>

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-lg font-bold text-background">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-lg">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// CTA SECTION
// ============================================================================

function PricingSection() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for getting started',
      features: [
        '1 automation',
        '50 DMs per month',
        'Basic keyword triggers',
        'Comment auto-replies',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/month',
      description: 'For serious Instagram growth',
      features: [
        'Unlimited automations',
        'Unlimited DMs',
        'AI-powered smart replies',
        'Cold outreach tools',
        'Advanced analytics',
        'Priority support',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
  ]

  return (
    <section id="pricing" className="py-24 lg:py-36 border-t border-border/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto mb-16 md:mb-20 max-w-2xl text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-muted px-5 py-2.5 text-sm font-medium text-foreground">
            <Sparkles className="h-4 w-4" />
            Pricing
          </span>
          <h2 className="mb-5 text-balance text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Start free. Upgrade when you need more power.
          </p>
        </div>

        <div className="mx-auto max-w-4xl grid gap-8 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl border p-8 ${
                plan.popular 
                  ? 'border-foreground bg-foreground/5' 
                  : 'border-border bg-background'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-4 py-1 text-xs font-semibold text-background">
                  Most Popular
                </span>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-5xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/dashboard">
                <Button
                  className={`w-full h-12 rounded-full font-medium ${
                    plan.popular
                      ? 'bg-foreground text-background hover:bg-foreground/90'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          No credit card required. Cancel anytime.
        </p>
      </div>
    </section>
  )
}

// ============================================================================
// FOOTER
// ============================================================================

function Footer() {
  return (
    <footer className="border-t border-border py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground transition-transform group-hover:scale-105">
                <Zap className="h-5 w-5 text-background" fill="currentColor" />
              </div>
              <span className="text-xl font-bold tracking-tight">Slide</span>
            </Link>
            <p className="mt-5 max-w-xs text-muted-foreground leading-relaxed">
              Automate your Instagram DMs. Turn comments into customers. Grow your business on autopilot.
            </p>
            <div className="mt-8 flex items-center gap-3">
              {[InstagramIcon, TikTokIcon, TwitterIcon, YouTubeIcon].map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:bg-foreground hover:text-background hover:border-foreground hover:scale-110"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {[
            { title: "Product", links: ["Features", "Pricing", "Changelog"] },
            { title: "Resources", links: ["Documentation", "Tutorials", "Blog", "Support"] },
            { title: "Company", links: ["About", "Privacy", "Terms"] },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="mb-5 font-semibold">{section.title}</h4>
              <ul className="space-y-4 text-muted-foreground">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="transition-colors hover:text-foreground">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">2025 Slide. All rights reserved.</p>
          <p className="text-sm text-muted-foreground">Made with love for Instagram creators.</p>
        </div>
      </div>
    </footer>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <BenefitsSection />
      <UseCasesSection />
      <TestimonialsSection />
      <PricingSection />
      <Footer />
      <ChatWidget />
    </main>
  )
}
