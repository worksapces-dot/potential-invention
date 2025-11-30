'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Mail, Check, Loader2, Unlink } from 'lucide-react'
import { toast } from 'sonner'

type GmailStatus = {
  connected: boolean
  email: string | null
  senderName: string | null
}

export function GmailConnect({ redirectTo }: { redirectTo?: string }) {
  const [status, setStatus] = useState<GmailStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/gmail/status')
      const data = await response.json()
      if (response.ok) {
        setStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch Gmail status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = () => {
    const redirect = redirectTo || window.location.pathname
    window.location.href = `/api/gmail/connect?redirect=${encodeURIComponent(redirect)}`
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      const response = await fetch('/api/gmail/disconnect', { method: 'POST' })
      if (response.ok) {
        setStatus({ connected: false, email: null, senderName: null })
        toast.success('Gmail disconnected')
      }
    } catch (error) {
      toast.error('Failed to disconnect')
    } finally {
      setIsDisconnecting(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-4 flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Checking Gmail status...</span>
      </Card>
    )
  }

  if (status?.connected) {
    return (
      <Card className="p-4 bg-green-500/10 border-green-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20">
              <Check className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="font-medium text-green-600 dark:text-green-400">Gmail Connected</p>
              <p className="text-sm text-muted-foreground">{status.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="text-muted-foreground hover:text-destructive"
          >
            {isDisconnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Unlink className="h-4 w-4" />
            )}
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 bg-orange-500/10 border-orange-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20">
            <Mail className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="font-medium text-orange-600 dark:text-orange-400">Connect Gmail</p>
            <p className="text-sm text-muted-foreground">Required to send emails</p>
          </div>
        </div>
        <Button onClick={handleConnect} size="sm">
          Connect
        </Button>
      </div>
    </Card>
  )
}
