import { Metadata } from 'next'
import React from 'react'
import Link from 'next/link'
import { Zap } from 'lucide-react'

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
}

type Props = {
  children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
      <main className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-10">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-muted/50 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-muted/50 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
