'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class MarketplaceErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Marketplace Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="border-2 border-red-500/30 rounded-2xl p-12 text-center bg-red-500/5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-6">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          
          <h3 className="text-2xl font-bold mb-4">Something went wrong</h3>
          <p className="text-[#9D9D9D] mb-6 max-w-md mx-auto">
            We encountered an error while loading this section. Please try refreshing the page.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.location.reload()}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Page
            </Button>
            
            <Button
              variant="outline"
              onClick={() => this.setState({ hasError: false })}
              className="rounded-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function ErrorFallback({ 
  error, 
  resetError, 
  title = "Something went wrong",
  description = "Please try again or contact support if the problem persists."
}: {
  error?: Error
  resetError?: () => void
  title?: string
  description?: string
}) {
  return (
    <div className="border border-red-500/30 rounded-xl p-8 text-center bg-red-500/5">
      <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-[#9D9D9D] mb-4">{description}</p>
      
      {resetError && (
        <Button
          onClick={resetError}
          size="sm"
          variant="outline"
          className="rounded-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
        >
          Try Again
        </Button>
      )}
    </div>
  )
}

export default MarketplaceErrorBoundary