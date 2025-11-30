'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Globe,
  Loader2,
  Check,
  X,
  Copy,
  ExternalLink,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  websiteId: string
  currentSubdomain: string | null
  onSubdomainChange?: (subdomain: string | null) => void
}

export function SubdomainManager({ websiteId, currentSubdomain, onSubdomainChange }: Props) {
  const [subdomain, setSubdomain] = useState(currentSubdomain || '')
  const [isChecking, setIsChecking] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isReleasing, setIsReleasing] = useState(false)
  const [availability, setAvailability] = useState<{
    available: boolean
    reason: string | null
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const rootDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000'
  const fullUrl = currentSubdomain 
    ? `https://${currentSubdomain}.${rootDomain}`
    : null

  // Debounced availability check
  useEffect(() => {
    if (!subdomain || subdomain === currentSubdomain) {
      setAvailability(null)
      return
    }

    const timer = setTimeout(() => {
      checkAvailability(subdomain)
    }, 500)

    return () => clearTimeout(timer)
  }, [subdomain, currentSubdomain])

  const checkAvailability = async (value: string) => {
    if (!value || value.length < 3) {
      setAvailability({ available: false, reason: 'Minimum 3 characters required' })
      return
    }

    setIsChecking(true)
    try {
      const res = await fetch(`/api/cold-call/subdomain?subdomain=${encodeURIComponent(value)}`)
      const data = await res.json()
      setAvailability(data)
    } catch {
      setAvailability({ available: false, reason: 'Failed to check availability' })
    } finally {
      setIsChecking(false)
    }
  }

  const handleClaim = async () => {
    if (!subdomain || !availability?.available) return

    setIsSaving(true)
    try {
      const res = await fetch('/api/cold-call/subdomain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId, subdomain }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to claim subdomain')
      }

      toast.success('Subdomain claimed!')
      onSubdomainChange?.(data.subdomain)
      setAvailability(null)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRelease = async () => {
    if (!currentSubdomain) return

    setIsReleasing(true)
    try {
      const res = await fetch(`/api/cold-call/subdomain?websiteId=${websiteId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to release subdomain')
      }

      toast.success('Subdomain released')
      setSubdomain('')
      onSubdomainChange?.(null)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsReleasing(false)
    }
  }

  const copyUrl = () => {
    if (fullUrl) {
      navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      toast.success('URL copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Format subdomain input (lowercase, no spaces, only valid chars)
  const handleInputChange = (value: string) => {
    const formatted = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
    setSubdomain(formatted)
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Custom Subdomain</Label>
        <p className="text-xs text-muted-foreground mt-1">
          Give your client a memorable URL for their website
        </p>
      </div>

      {currentSubdomain ? (
        // Already has subdomain
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <Globe className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-500 flex-1">
              {currentSubdomain}.{rootDomain}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyUrl}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <a href={fullUrl!} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Input
              value={subdomain}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="new-subdomain"
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">.{rootDomain}</span>
          </div>

          {availability && subdomain !== currentSubdomain && (
            <div className={`flex items-center gap-2 text-sm ${availability.available ? 'text-green-500' : 'text-red-500'}`}>
              {isChecking ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : availability.available ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              <span>{availability.available ? 'Available!' : availability.reason}</span>
            </div>
          )}

          <div className="flex gap-2">
            {subdomain !== currentSubdomain && availability?.available && (
              <Button onClick={handleClaim} disabled={isSaving} size="sm">
                {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Update Subdomain
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRelease}
              disabled={isReleasing}
              className="text-destructive hover:text-destructive"
            >
              {isReleasing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Release
            </Button>
          </div>
        </div>
      ) : (
        // No subdomain yet
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              value={subdomain}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="joes-plumbing"
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">.{rootDomain}</span>
          </div>

          {subdomain && (
            <div className={`flex items-center gap-2 text-sm ${availability?.available ? 'text-green-500' : availability ? 'text-red-500' : 'text-muted-foreground'}`}>
              {isChecking ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : availability?.available ? (
                <>
                  <Check className="h-3 w-3" />
                  <span>Available!</span>
                </>
              ) : availability ? (
                <>
                  <X className="h-3 w-3" />
                  <span>{availability.reason}</span>
                </>
              ) : null}
            </div>
          )}

          <Button
            onClick={handleClaim}
            disabled={!subdomain || !availability?.available || isSaving}
            size="sm"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Claim Subdomain
          </Button>
        </div>
      )}
    </div>
  )
}
