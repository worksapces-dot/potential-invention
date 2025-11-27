"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  Zap,
  Menu,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Gift,
  Wrench,
  Bug,
  Sparkles,
  Rocket,
  Shield,
  Gauge,
} from "lucide-react"

// ============================================================================
// HEADER (reused from landing page style)
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
                href={`/#${item.toLowerCase().replace(/ /g, "-")}`}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item}
              </Link>
            ))}
            <Link
              href="/changelog"
              className="text-sm font-medium text-foreground transition-colors"
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
                  href={`/#${item.toLowerCase().replace(/ /g, "-")}`}
                  className="text-lg font-medium py-2 transition-colors hover:text-muted-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
              <Link
                href="/changelog"
                className="text-lg font-medium py-2 text-foreground"
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
// CHANGELOG DATA
// ============================================================================

const changelogEntries = [
  {
    version: "2.4.0",
    date: "November 27, 2024",
    type: "feature",
    title: "AI Automation Builder",
    description: "Build complex automation flows with our new visual AI builder. Drag, drop, and let AI handle the logic. Create sophisticated workflows without writing a single line of code.",
    highlights: ["Visual flow builder", "AI-powered suggestions", "Template library", "Drag & drop interface"],
  },
  {
    version: "2.3.0",
    date: "October 15, 2024",
    type: "feature",
    title: "Template Marketplace",
    description: "Buy and sell automation templates. Monetize your expertise or jumpstart your automations with proven templates from top creators.",
    highlights: ["Creator storefronts", "Instant delivery", "Revenue sharing", "Template ratings"],
  },
  {
    version: "2.2.1",
    date: "October 3, 2024",
    type: "fix",
    title: "Bug Fixes & Stability",
    description: "Fixed several issues reported by our community including DM delivery delays and analytics sync problems.",
    highlights: ["DM delivery fixes", "Analytics sync", "Performance improvements"],
  },
  {
    version: "2.2.0",
    date: "September 20, 2024",
    type: "improvement",
    title: "Enhanced Analytics Dashboard",
    description: "Deeper insights into your automation performance with new metrics, charts, and export capabilities. Track what matters for your growth.",
    highlights: ["Conversion tracking", "A/B testing", "Custom reports", "CSV exports"],
  },
  {
    version: "2.1.0",
    date: "August 28, 2024",
    type: "feature",
    title: "Smart AI Responses",
    description: "Our AI now understands context better than ever. Responses feel more natural and personalized to match your brand voice.",
    highlights: ["Context awareness", "Brand voice matching", "Multi-language support", "Tone customization"],
  },
  {
    version: "2.0.0",
    date: "August 1, 2024",
    type: "feature",
    title: "Slide 2.0 Launch",
    description: "A complete redesign of Slide with a new dashboard, improved automation engine, and faster response times. The biggest update yet.",
    highlights: ["New dashboard UI", "2x faster responses", "Improved reliability", "New API"],
  },
  {
    version: "1.5.0",
    date: "July 10, 2024",
    type: "feature",
    title: "Comment Automation",
    description: "Auto-reply to comments on your posts. Turn engagement into conversations and sales opportunities automatically.",
    highlights: ["Comment triggers", "Auto-replies", "Keyword filtering", "Spam protection"],
  },
  {
    version: "1.4.0",
    date: "June 15, 2024",
    type: "improvement",
    title: "Performance Boost",
    description: "Major performance improvements across the platform. Automations now trigger 50% faster with improved reliability.",
    highlights: ["50% faster triggers", "99.9% uptime", "Reduced latency", "Better caching"],
  },
]

const typeConfig = {
  feature: { icon: Gift, label: "New Feature", color: "bg-foreground" },
  improvement: { icon: Wrench, label: "Improvement", color: "bg-muted-foreground" },
  fix: { icon: Bug, label: "Bug Fix", color: "bg-muted-foreground/70" },
}


// ============================================================================
// HERO SECTION
// ============================================================================

function HeroSection() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-muted/50 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-muted/50 rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-muted px-5 py-2.5 text-sm font-medium text-foreground">
              <Calendar className="h-4 w-4" />
              Changelog
            </span>
          </div>

          <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            {"What's new in Slide"}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We ship fast and listen to our users. Here are all the latest updates, improvements, and fixes.
          </p>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {[
              { icon: Rocket, label: "Updates this year", value: "24+" },
              { icon: Sparkles, label: "New features", value: "15" },
              { icon: Shield, label: "Uptime", value: "99.9%" },
              { icon: Gauge, label: "Faster responses", value: "2x" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl md:text-3xl font-bold">{stat.value}</span>
                </div>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


// ============================================================================
// CHANGELOG LIST
// ============================================================================

function ChangelogList() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-border hidden md:block" />

            <div className="space-y-8">
              {changelogEntries.map((entry, index) => {
                const TypeIcon = typeConfig[entry.type as keyof typeof typeConfig].icon
                const typeLabel = typeConfig[entry.type as keyof typeof typeConfig].label
                const typeColor = typeConfig[entry.type as keyof typeof typeConfig].color

                return (
                  <div
                    key={entry.version}
                    className="group relative md:pl-20"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-6 top-8 hidden md:flex h-5 w-5 items-center justify-center">
                      <div className={`h-3 w-3 rounded-full ${typeColor} ring-4 ring-background`} />
                    </div>

                    <div className="rounded-3xl border border-border bg-background p-8 md:p-10 transition-all duration-300 hover:shadow-lg hover:border-border/80">
                      <div className="flex flex-wrap items-center gap-3 mb-5">
                        <span className={`inline-flex items-center gap-2 rounded-full ${typeColor} px-4 py-1.5 text-xs font-semibold text-background`}>
                          <TypeIcon className="h-3.5 w-3.5" />
                          {typeLabel}
                        </span>
                        <span className="text-sm font-medium text-foreground bg-muted px-3 py-1 rounded-full">
                          v{entry.version}
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {entry.date}
                        </span>
                      </div>

                      <h3 className="text-2xl font-semibold mb-3">{entry.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-lg mb-6">{entry.description}</p>

                      <div className="flex flex-wrap gap-2">
                        {entry.highlights.map((highlight) => (
                          <span
                            key={highlight}
                            className="inline-flex items-center gap-1.5 rounded-full bg-foreground/10 px-4 py-2 text-sm font-medium text-foreground"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
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
    <section className="bg-muted/30 py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-muted/50 rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-5 text-3xl md:text-4xl font-bold tracking-tight">
            Ready to try the latest features?
          </h2>
          <p className="mb-10 text-lg text-muted-foreground">
            Start automating your Instagram DMs today. Free plan available.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="group h-12 px-8 bg-foreground text-background hover:bg-foreground/90 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                Get started free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/">
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 rounded-full"
              >
                Learn more
              </Button>
            </Link>
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
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground transition-transform group-hover:scale-105">
              <Zap className="h-4 w-4 text-background" fill="currentColor" />
            </div>
            <span className="font-bold">Slide</span>
          </Link>
          <p className="text-sm text-muted-foreground">2025 Slide. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <ChangelogList />
      <CtaSection />
      <Footer />
    </main>
  )
}
