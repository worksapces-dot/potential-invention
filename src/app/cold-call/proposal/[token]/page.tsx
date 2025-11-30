'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Calendar,
  DollarSign,
  ExternalLink,
  Check,
  X,
} from 'lucide-react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

type Proposal = {
  id: string
  title: string
  description: string
  scope: string[]
  timeline: string | null
  paymentTerms: string | null
  revisions: number
  clientName: string | null
  clientEmail: string | null
  status: string
  expiresAt: string | null
  acceptedAt: string | null
  ColdCallDeal: {
    amount: number
    isRecurring: boolean
    recurringAmount: number | null
    ColdCallLead: {
      businessName: string
      generatedWebsite: { id: string } | null
    }
  }
}

export default function ProposalPage() {
  const params = useParams()
  const token = params.token as string

  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false)
  const [clientName, setClientName] = useState('')
  const [isAccepting, setIsAccepting] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)

  useEffect(() => {
    fetchProposal()
  }, [token])

  const fetchProposal = async () => {
    try {
      const response = await fetch(`/api/cold-call/proposals/${token}`)
      const data = await response.json()
      if (response.ok) {
        setProposal(data.proposal)
        setClientName(data.proposal.clientName || '')
      }
    } catch (error) {
      toast.error('Failed to load proposal')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async () => {
    setIsAccepting(true)
    try {
      const response = await fetch(`/api/cold-call/proposals/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept proposal')
      }

      toast.success('Proposal accepted!')
      setAcceptDialogOpen(false)
      fetchProposal()

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to accept proposal')
    } finally {
      setIsAccepting(false)
    }
  }

  const handleDecline = async () => {
    setIsDeclining(true)
    try {
      const response = await fetch(`/api/cold-call/proposals/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DECLINED', declinedAt: new Date().toISOString() }),
      })

      if (!response.ok) {
        throw new Error('Failed to decline proposal')
      }

      toast.success('Proposal declined')
      fetchProposal()
    } catch (error) {
      toast.error('Failed to decline proposal')
    } finally {
      setIsDeclining(false)
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const isExpired = proposal?.expiresAt && new Date(proposal.expiresAt) < new Date()
  const canRespond = proposal?.status === 'SENT' || proposal?.status === 'VIEWED'

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Proposal Not Found</h1>
          <p className="text-muted-foreground">This proposal may have been removed or the link is invalid.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-3xl mx-auto p-6 py-12">
        {/* Header */}
        <div className="bg-background rounded-2xl border p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <Badge
                className={
                  proposal.status === 'ACCEPTED'
                    ? 'bg-green-500/10 text-green-600'
                    : proposal.status === 'DECLINED'
                    ? 'bg-red-500/10 text-red-600'
                    : isExpired
                    ? 'bg-gray-500/10 text-gray-600'
                    : 'bg-blue-500/10 text-blue-600'
                }
              >
                {proposal.status === 'ACCEPTED' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                {proposal.status === 'DECLINED' && <X className="mr-1 h-3 w-3" />}
                {isExpired ? 'Expired' : proposal.status.replace('_', ' ')}
              </Badge>
              <h1 className="text-2xl font-bold mt-4">{proposal.title}</h1>
              <p className="text-muted-foreground mt-1">
                For {proposal.ColdCallDeal.ColdCallLead.businessName}
              </p>
            </div>
            {proposal.expiresAt && !isExpired && (
              <div className="text-right text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 inline mr-1" />
                Expires {new Date(proposal.expiresAt).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="bg-muted/50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Investment</p>
                <p className="text-3xl font-bold">{formatCurrency(proposal.ColdCallDeal.amount)}</p>
                {proposal.ColdCallDeal.isRecurring && proposal.ColdCallDeal.recurringAmount && (
                  <p className="text-muted-foreground mt-1">
                    + {formatCurrency(proposal.ColdCallDeal.recurringAmount)}/month hosting
                  </p>
                )}
              </div>
              {proposal.timeline && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Timeline</p>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {proposal.timeline}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="font-semibold mb-3">Project Overview</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{proposal.description}</p>
          </div>

          {/* Scope */}
          {proposal.scope.length > 0 && (
            <div className="mb-6">
              <h2 className="font-semibold mb-3">What&apos;s Included</h2>
              <ul className="space-y-2">
                {proposal.scope.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Terms */}
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            {proposal.paymentTerms && (
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-muted-foreground mb-1">Payment Terms</p>
                <p className="font-medium">{proposal.paymentTerms}</p>
              </div>
            )}
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-muted-foreground mb-1">Revisions Included</p>
              <p className="font-medium">{proposal.revisions} rounds</p>
            </div>
          </div>
        </div>

        {/* Preview Link */}
        {proposal.ColdCallDeal.ColdCallLead.generatedWebsite && (
          <div className="bg-background rounded-2xl border p-6 mb-6">
            <h2 className="font-semibold mb-3">Website Preview</h2>
            <a
              href={`/cold-call/preview/${proposal.ColdCallDeal.ColdCallLead.generatedWebsite.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              View your website preview
            </a>
          </div>
        )}

        {/* Actions */}
        {canRespond && !isExpired && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl"
              onClick={handleDecline}
              disabled={isDeclining}
            >
              {isDeclining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
              Decline
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl"
              onClick={() => setAcceptDialogOpen(true)}
            >
              <Check className="mr-2 h-4 w-4" />
              Accept Proposal
            </Button>
          </div>
        )}

        {proposal.status === 'ACCEPTED' && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-green-600">Proposal Accepted</h2>
            <p className="text-muted-foreground mt-1">
              Accepted on {new Date(proposal.acceptedAt!).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {/* Accept Dialog */}
      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Accept Proposal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">Your Name</Label>
              <Input
                id="client-name"
                placeholder="John Smith"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">
                By accepting, you agree to the terms outlined in this proposal.
              </p>
            </div>
            <Button
              className="w-full h-12 rounded-xl"
              onClick={handleAccept}
              disabled={isAccepting || !clientName}
            >
              {isAccepting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Accept & Continue to Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
