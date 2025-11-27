"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  Zap,
  Menu,
  X,
  ArrowRight,
  Eye,
  Sparkles,
  Calendar,
  Database,
  FileText,
  Share2,
  Bot,
  Link2,
  Play,
  Rocket,
  CheckCircle2,
  Clock,
  Code2,
  TrendingUp,
  ArrowUpRight,
  Building2,
  Code,
  Users,
  Star,
  Quote,
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
            <span className="text-lg font-bold tracking-tight">Fortress</span>
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
      </div>

      <div className="container relative mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          {/* Top badge */}
          <div className="mb-8 md:mb-12 animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full bg-muted px-5 py-2.5 text-sm font-medium text-foreground">
              <Sparkles className="h-4 w-4" />
              Automation guide
            </span>
          </div>

          {/* Main headline */}
          <div className="mb-8 md:mb-10">
            <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.1] animate-slide-up">
              How to go from
            </h1>

            {/* Pills with floating icons inline */}
            <div className="mt-4 md:mt-6 flex flex-wrap items-center justify-center gap-3 md:gap-4 lg:gap-5 animate-slide-up delay-100">
              {/* TikTok icon */}
              <div className="animate-float hidden sm:block">
                <div className="flex h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 items-center justify-center rounded-2xl bg-background shadow-2xl border border-border/50 hover-lift">
                  <TikTokIcon className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-foreground" />
                </div>
              </div>

              {/* 0 tasks pill */}
              <span className="inline-flex items-center gap-2 md:gap-3 rounded-full bg-foreground px-5 py-2.5 md:px-7 md:py-3.5 text-background shadow-xl">
                <Eye className="h-4 w-4 md:h-5 md:w-5" />
                <span className="text-xl md:text-2xl lg:text-3xl font-bold">0 tasks</span>
              </span>

              <span className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold">to</span>

              {/* 10K+ pill */}
              <span className="inline-flex items-center gap-2 md:gap-3 rounded-full bg-foreground px-5 py-2.5 md:px-7 md:py-3.5 text-background shadow-xl">
                <Eye className="h-4 w-4 md:h-5 md:w-5" />
                <span className="text-xl md:text-2xl lg:text-3xl font-bold">10K+</span>
              </span>

              {/* Instagram icon */}
              <div className="animate-float-reverse delay-200 hidden sm:block">
                <div className="flex h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 items-center justify-center rounded-2xl bg-background shadow-2xl border border-border/50 hover-lift">
                  <InstagramIcon className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12" />
                </div>
              </div>
            </div>
          </div>

          {/* Subtitle */}
          <p className="mx-auto mb-10 md:mb-12 max-w-2xl text-lg md:text-xl lg:text-2xl italic text-muted-foreground leading-relaxed animate-slide-up delay-200">
            Using the system that automated 500M+ tasks across businesses...
            <br className="hidden md:block" />
            Leading to 100K+ hours saved & $2M+ in revenue generated
          </p>

          {/* Feature bullets */}
          <div className="mb-10 md:mb-14 animate-slide-up delay-300">
            <p className="mb-5 text-sm text-muted-foreground tracking-wider uppercase">In this guide...</p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 md:gap-x-8 gap-y-3 text-sm md:text-base font-medium">
              {["30-day action plan", "Workflow templates", "How to find winning automations", "Using AI tools"].map(
                (item) => (
                  <span key={item} className="text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                    {item}
                  </span>
                ),
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 md:gap-x-8 gap-y-3 text-sm md:text-base font-medium">
              {["Converting automation to revenue", "How to scale while solo/small team"].map((item) => (
                <span key={item} className="text-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-5 animate-slide-up delay-400">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="group h-14 md:h-16 px-10 md:px-14 text-base md:text-lg bg-foreground text-background hover:bg-foreground/90 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                Get started
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <p className="text-sm md:text-base text-muted-foreground">for free. no signup. no email.</p>
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
    icon: InstagramIcon,
    title: "Social Media Automation",
    description: "Schedule posts, track engagement, and grow your audience across Instagram, TikTok, and more.",
    tag: "Popular",
  },
  {
    icon: Database,
    title: "Data Extraction",
    description: "Pull data from websites, PDFs, and APIs without manual copy-pasting or complex scripts.",
    tag: null,
  },
  {
    icon: Calendar,
    title: "Content Scheduling",
    description: "Plan your content calendar and publish automatically at the perfect times for your audience.",
    tag: null,
  },
  {
    icon: FileText,
    title: "Document Generation",
    description: "Create contracts, invoices, and reports automatically from your templates and data.",
    tag: null,
  },
  {
    icon: Share2,
    title: "500+ Integrations",
    description: "Connect all your favorite apps and services to create seamless cross-platform workflows.",
    tag: "New",
  },
  {
    icon: Bot,
    title: "AI-Powered Workflows",
    description: "Let AI handle complex decisions and optimize your automation for maximum efficiency.",
    tag: "Beta",
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
            Powerful automations for every workflow
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            From simple tasks to complex multi-step processes, automate anything your business needs.
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
    title: "Connect",
    description: "Link your favorite apps and tools in seconds. No complex setup or technical knowledge required.",
  },
  {
    number: "02",
    icon: Play,
    title: "Automate",
    description: "Build powerful workflows using our visual editor. Drag, drop, and configure your automation logic.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Launch",
    description: "Activate your automation and watch it work 24/7. Monitor performance and optimize as you grow.",
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
            Get started in minutes
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Our simple three-step process gets you automating faster than ever.
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
    title: "Save 20+ Hours Weekly",
    description: "Reclaim your time by automating repetitive tasks that drain your productivity.",
  },
  {
    icon: TrendingUp,
    title: "Scale Without Limits",
    description: "Handle 10x the workload without hiring. Your automations work around the clock.",
  },
  {
    icon: CheckCircle2,
    title: "99.9% Accuracy",
    description: "Eliminate human error with precise, consistent automation every single time.",
  },
  {
    icon: Code2,
    title: "No Coding Required",
    description: "Build sophisticated workflows with our intuitive visual builder. Zero technical skills needed.",
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
                Why Fortress
              </span>
              <h2 className="mb-6 text-balance text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight">
                Why teams choose Fortress
              </h2>
              <p className="mb-10 text-lg md:text-xl text-muted-foreground leading-relaxed">
                Join thousands of businesses that have transformed their operations with intelligent automation.
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
                    { label: "Tasks Completed", value: "12,847", width: "85%" },
                    { label: "Time Saved", value: "342 hours", width: "72%" },
                    { label: "Success Rate", value: "99.8%", width: "99%" },
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
    title: "Creators",
    description: "Automate content publishing, engagement tracking, and audience growth across all platforms.",
    examples: ["Auto-post to Instagram", "Track analytics", "Manage sponsorships"],
  },
  {
    icon: Code,
    title: "Developers",
    description: "Streamline deployment pipelines, monitoring alerts, and development workflows.",
    examples: ["CI/CD triggers", "Error notifications", "Code reviews"],
  },
  {
    icon: Building2,
    title: "Agencies",
    description: "Scale client work with automated reporting, task management, and deliverable tracking.",
    examples: ["Client onboarding", "Report generation", "Project updates"],
  },
  {
    icon: Users,
    title: "Small Businesses",
    description: "Run your operations on autopilot with customer communications and order processing.",
    examples: ["Invoice automation", "Customer follow-ups", "Inventory alerts"],
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
            Built for every team
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            {"Whether you're a solo creator or a growing agency, Fortress adapts to your needs."}
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
      "Fortress saved our team 30 hours per week. We've automated our entire client onboarding process and it runs flawlessly.",
    author: "Sarah Chen",
    role: "Operations Lead",
    company: "Bright Agency",
    avatar: "SC",
  },
  {
    quote:
      "The no-code builder is incredibly intuitive. I set up complex workflows in minutes that would have taken days to code.",
    author: "Marcus Rodriguez",
    role: "Founder",
    company: "TechScale",
    avatar: "MR",
  },
  {
    quote:
      "We've processed over 50,000 orders automatically with zero errors. This tool has been a game-changer for our e-commerce business.",
    author: "Emily Watson",
    role: "CEO",
    company: "Bloom Commerce",
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
            Loved by thousands of teams
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            See what our customers have to say about transforming their workflows.
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

function CtaSection() {
  return (
    <section id="pricing" className="bg-muted/30 py-24 lg:py-36 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-muted/50 rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-8 inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-medium text-foreground shadow-sm">
            <Sparkles className="h-4 w-4" />
            Start automating in minutes
          </span>

          <h2 className="mb-6 text-balance text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight">
            Ready to Transform Your Workflow?
          </h2>
          <p className="mx-auto mb-12 max-w-xl text-lg md:text-xl text-muted-foreground leading-relaxed">
            {"Join 10,000+ businesses automating their workflows. Get started for free—no credit card required."}
          </p>

          <div className="flex flex-col items-center gap-5">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="group h-14 md:h-16 px-10 md:px-14 text-base md:text-lg bg-foreground text-background hover:bg-foreground/90 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <p className="text-sm md:text-base text-muted-foreground">Free plan includes 1,000 tasks/month</p>
          </div>
        </div>
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
              <span className="text-xl font-bold tracking-tight">Fortress</span>
            </Link>
            <p className="mt-5 max-w-xs text-muted-foreground leading-relaxed">
              Automate everything. Grow faster. Join thousands of teams scaling their operations with intelligent
              automation.
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
            { title: "Product", links: ["Features", "Integrations", "Pricing", "Changelog"] },
            { title: "Resources", links: ["Documentation", "Tutorials", "Blog", "Support"] },
            { title: "Company", links: ["About", "Careers", "Privacy", "Terms"] },
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
          <p className="text-sm text-muted-foreground">2025 Fortress. All rights reserved.</p>
          <p className="text-sm text-muted-foreground">Made with love for automation enthusiasts.</p>
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
      <CtaSection />
      <Footer />
    </main>
  )
}
