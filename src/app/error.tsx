'use client'

import { Button } from '@/components/ui/button'
import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error)
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold text-white">Something went wrong!</h2>
      <Button onClick={() => reset()} variant="outline">
        Try again
      </Button>
    </div>
  )
}
