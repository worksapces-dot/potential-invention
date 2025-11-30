'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  DollarSign,
  Loader2,
  ArrowLeft,
  CreditCard,
  Download,
  ExternalLink,
  CheckCircle2,
  Clock,
  TrendingUp,
  Send,
  Sparkles,
  Zap,
  MoreHorizontal,
  Copy,
  Eye,
  Receipt,
  ArrowUpRight,
  Calendar,
  RefreshCcw,
  FileText,
  Bell,
  RotateCcw,
  Mail,
  AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Lead = {
  id: string
  businessName: string
  category: string
  city: string
  country: string
  phone: string | null
  email: string | null
  status: string
  generatedWebsite: { id: string } | null
  deal: {
    id: string
    amount: number
    status: string
    stripePaymentId: string | null
    paidAt: string | null
    createdAt?: string
    isRecurring?: boolean
    recurringAmount?: number
    nextBillingDate?: string
    refundedAt?: string
    refundAmount?: number
  } | null
}

export default function DealsPage() {
  const params = useParams()
  const slug = params.slug as string

  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  
  // Dialog states
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [proposalDialogOpen, setProposalDialogOpen] = useState(false)
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false)
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)
  
  // Form states
  const [price, setPrice] = useState('')
  const [monthlyFee, setMonthlyFee] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [clientEmail, setClientEmail] = useState('')
  const [autoSendLink, setAutoSendLink] = useState(true)
  
  // Proposal form
  const [proposalTitle, setProposalTitle] = useState('')
  const [proposalDescription, setProposalDescription] = useState('')
  const [proposalScope, setProposalScope] = useState('')
  const [proposalTimeline, setProposalTimeline] = useState('')
  
  // Reminder form
  const [reminderMessage, setReminderMessage] = useState('')
  
  // Refund form
  const [refundReason, setRefundReason] = useState('')
  const [refundAmount, setRefundAmount] = useState('')
  
  // Loading states
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false)
  const [isCreatingProposal, setIsCreatingProposal] = useState(false)
  const [isSendingReminder, setIsSendingReminder] = useState(false)
  const [isProcessingRefund, setIsProcessingRefund] = useState(false)
  const [isExporting, setIsExporting] = useState<string | null>(null)
  const [isSendingPaymentLink, setIsSendingPaymentLink] = useState<string | null>(null)

  const [stats, setStats] = useState({
    totalDeals: 0,
    pendingDeals: 0,
    paidDeals: 0,
    totalRevenue: 0,
    recurringRevenue: 0,
  })

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/cold-call/leads')
      const data = await response.json()
      if (response.ok) {
        const dealLeads = (data.leads || []).filter(
          (l: Lead) => l.generatedWebsite !== null || l.deal !== null
        )
        setLeads(dealLeads)

        const deals = dealLeads.filter((l: Lead) => l.deal)
        const paid = deals.filter((l: Lead) => 
          l.deal?.status === 'PAID' || l.deal?.status === 'ACTIVE_SUBSCRIPTION'
        )
        const recurring = paid.filter((l: Lead) => l.deal?.isRecurring)
        
        setStats({
          totalDeals: deals.length,
          pendingDeals: deals.filter((l: Lead) => l.deal?.status === 'PENDING').length,
          paidDeals: paid.length,
          totalRevenue: paid.reduce((sum: number, l: Lead) => sum + (l.deal?.amount || 0), 0),
          recurringRevenue: recurring.reduce((sum: number, l: Lead) => sum + (l.deal?.recurringAmount || 0), 0),
        })
      }
    } catch (error) {
      toast.error('Failed to load deals')
    } finally {
      setIsLoading(false)
    }
  }


  const handleCreateInvoice = async () => {
    if (!selectedLead || !price) {
      toast.error('Please enter a price')
      return
    }

    const amount = parseFloat(price)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid price')
      return
    }

    setIsCreatingInvoice(true)
    try {
      let response
      
      if (isRecurring && monthlyFee) {
        // Create subscription
        response = await fetch('/api/cold-call/create-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId: selectedLead.id,
            setupFee: Math.round(amount * 100),
            monthlyFee: Math.round(parseFloat(monthlyFee) * 100),
            clientEmail: clientEmail || selectedLead.email,
          }),
        })
      } else {
        // Create one-time invoice
        response = await fetch('/api/cold-call/create-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId: selectedLead.id,
            amount: Math.round(amount * 100),
          }),
        })
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create invoice')
      }

      // Auto-send payment link if enabled
      if (autoSendLink && selectedLead.email) {
        await fetch('/api/cold-call/send-payment-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dealId: data.dealId }),
        })
        toast.success('Invoice created and payment link sent!')
      } else {
        // Copy to clipboard
        const paymentUrl = data.paymentUrl || data.checkoutUrl
        if (paymentUrl) {
          await navigator.clipboard.writeText(paymentUrl)
          toast.success('Invoice created! Payment link copied.')
        } else {
          toast.success('Invoice created!')
        }
      }

      setInvoiceDialogOpen(false)
      resetInvoiceForm()
      fetchLeads()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create invoice')
    } finally {
      setIsCreatingInvoice(false)
    }
  }

  const handleCreateProposal = async () => {
    if (!selectedLead?.deal || !proposalTitle || !proposalDescription) {
      toast.error('Please fill in required fields')
      return
    }

    setIsCreatingProposal(true)
    try {
      const response = await fetch('/api/cold-call/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId: selectedLead.deal.id,
          title: proposalTitle,
          description: proposalDescription,
          scope: proposalScope.split('\n').filter(Boolean),
          timeline: proposalTimeline,
          clientEmail: selectedLead.email,
          expiresInDays: 14,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create proposal')
      }

      // Send proposal
      await fetch(`/api/cold-call/proposals/${data.proposal.id}/send`, {
        method: 'POST',
      })

      await navigator.clipboard.writeText(data.viewUrl)
      toast.success('Proposal created and sent! Link copied.')
      
      setProposalDialogOpen(false)
      resetProposalForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create proposal')
    } finally {
      setIsCreatingProposal(false)
    }
  }

  const handleSendReminder = async () => {
    if (!selectedLead?.deal) return

    setIsSendingReminder(true)
    try {
      const response = await fetch('/api/cold-call/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId: selectedLead.deal.id,
          message: reminderMessage || undefined,
          sendNow: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reminder')
      }

      toast.success('Payment reminder sent!')
      setReminderDialogOpen(false)
      setReminderMessage('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send reminder')
    } finally {
      setIsSendingReminder(false)
    }
  }

  const handleRefund = async () => {
    if (!selectedLead?.deal) return

    setIsProcessingRefund(true)
    try {
      const response = await fetch('/api/cold-call/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId: selectedLead.deal.id,
          reason: refundReason,
          amount: refundAmount ? Math.round(parseFloat(refundAmount) * 100) : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process refund')
      }

      toast.success('Refund processed successfully')
      setRefundDialogOpen(false)
      setRefundReason('')
      setRefundAmount('')
      fetchLeads()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process refund')
    } finally {
      setIsProcessingRefund(false)
    }
  }

  const handleSendPaymentLink = async (lead: Lead) => {
    if (!lead.deal || !lead.email) {
      toast.error('Client email not available')
      return
    }

    setIsSendingPaymentLink(lead.id)
    try {
      const response = await fetch('/api/cold-call/send-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId: lead.deal.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send payment link')
      }

      toast.success(`Payment link sent to ${data.sentTo}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send payment link')
    } finally {
      setIsSendingPaymentLink(null)
    }
  }

  const handleExportWebsite = async (lead: Lead) => {
    if (!lead.generatedWebsite) {
      toast.error('No website to export')
      return
    }

    setIsExporting(lead.id)
    try {
      const response = await fetch(`/api/cold-call/export-website?id=${lead.generatedWebsite.id}`)
      
      if (!response.ok) throw new Error('Failed to export')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${lead.businessName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-website.html`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()

      toast.success('Website exported!')
    } catch (error) {
      toast.error('Failed to export website')
    } finally {
      setIsExporting(null)
    }
  }

  const resetInvoiceForm = () => {
    setPrice('')
    setMonthlyFee('')
    setIsRecurring(false)
    setClientEmail('')
    setAutoSendLink(true)
  }

  const resetProposalForm = () => {
    setProposalTitle('')
    setProposalDescription('')
    setProposalScope('')
    setProposalTimeline('')
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground">
            <Zap className="h-6 w-6 text-background animate-pulse" fill="currentColor" />
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }


  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/${slug}/cold-call`}>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Deals</h1>
            <p className="text-muted-foreground">Track revenue, send invoices, and manage payments</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 rounded-full bg-foreground/5 px-3 py-1.5 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {leads.length} Active
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={Receipt} label="Total Deals" value={stats.totalDeals.toString()} color="blue" subtitle="All time" />
        <StatCard icon={Clock} label="Pending" value={stats.pendingDeals.toString()} color="yellow" subtitle="Awaiting payment" />
        <StatCard icon={CheckCircle2} label="Paid" value={stats.paidDeals.toString()} color="green" subtitle="Completed" />
        <StatCard icon={TrendingUp} label="Revenue" value={formatCurrency(stats.totalRevenue)} color="purple" subtitle="Total earned" highlight />
        <StatCard icon={RefreshCcw} label="MRR" value={formatCurrency(stats.recurringRevenue)} color="blue" subtitle="Monthly recurring" />
      </div>

      {/* Deals Section */}
      {leads.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Active Deals</h2>
                <p className="text-sm text-muted-foreground">{leads.length} opportunities</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {leads.map((lead) => (
              <DealCard
                key={lead.id}
                lead={lead}
                onCreateInvoice={() => {
                  setSelectedLead(lead)
                  setClientEmail(lead.email || '')
                  resetInvoiceForm()
                  setInvoiceDialogOpen(true)
                }}
                onCreateProposal={() => {
                  setSelectedLead(lead)
                  resetProposalForm()
                  setProposalDialogOpen(true)
                }}
                onSendReminder={() => {
                  setSelectedLead(lead)
                  setReminderMessage('')
                  setReminderDialogOpen(true)
                }}
                onRefund={() => {
                  setSelectedLead(lead)
                  setRefundReason('')
                  setRefundAmount('')
                  setRefundDialogOpen(true)
                }}
                onSendPaymentLink={() => handleSendPaymentLink(lead)}
                onExport={() => handleExportWebsite(lead)}
                isExporting={isExporting === lead.id}
                isSendingPaymentLink={isSendingPaymentLink === lead.id}
                formatCurrency={formatCurrency}
                getInitials={getInitials}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-background p-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 mx-auto mb-6">
            <DollarSign className="h-10 w-10 text-primary" />
          </div>
          <h3 className="font-semibold text-xl mb-2">No deals yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Generate websites for your leads to start creating deals and earning revenue
          </p>
          <Link href={`/dashboard/${slug}/cold-call/leads`}>
            <Button className="rounded-full px-6">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              View Leads
            </Button>
          </Link>
        </div>
      )}

      {/* Create Invoice Dialog */}
      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Create Invoice</p>
                <p className="text-sm font-normal text-muted-foreground">{selectedLead?.businessName}</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="one-time" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="one-time" onClick={() => setIsRecurring(false)}>One-Time</TabsTrigger>
              <TabsTrigger value="recurring" onClick={() => setIsRecurring(true)}>Recurring</TabsTrigger>
            </TabsList>

            <TabsContent value="one-time" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="price">Website Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    placeholder="500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="pl-12 h-12 text-lg font-semibold rounded-xl"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="recurring" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="setup-fee">Setup Fee (optional)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="setup-fee"
                    type="number"
                    placeholder="500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="pl-12 h-11 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly-fee">Monthly Hosting Fee</Label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="monthly-fee"
                    type="number"
                    placeholder="49"
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(e.target.value)}
                    className="pl-12 h-11 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-email">Client Email</Label>
                <Input
                  id="client-email"
                  type="email"
                  placeholder="client@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Price Breakdown */}
          {(price || monthlyFee) && (
            <div className="rounded-xl bg-muted/50 p-4 space-y-3">
              {price && parseFloat(price) > 0 && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{isRecurring ? 'Setup fee' : 'Subtotal'}</span>
                    <span className="font-medium">${parseFloat(price).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Platform fee (10%)</span>
                    <span className="text-red-500">-${(parseFloat(price) * 0.1).toFixed(2)}</span>
                  </div>
                </>
              )}
              {isRecurring && monthlyFee && parseFloat(monthlyFee) > 0 && (
                <>
                  <div className="border-t border-border pt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Monthly fee</span>
                    <span className="font-medium">${parseFloat(monthlyFee).toFixed(2)}/mo</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Monthly platform fee</span>
                    <span className="text-red-500">-${(parseFloat(monthlyFee) * 0.1).toFixed(2)}/mo</span>
                  </div>
                </>
              )}
              <div className="border-t border-border pt-3 flex items-center justify-between">
                <span className="font-medium">You receive</span>
                <div className="text-right">
                  {price && parseFloat(price) > 0 && (
                    <span className="text-lg font-bold text-green-500">
                      ${(parseFloat(price) * 0.9).toFixed(2)}
                    </span>
                  )}
                  {isRecurring && monthlyFee && parseFloat(monthlyFee) > 0 && (
                    <span className="text-sm text-green-500 block">
                      + ${(parseFloat(monthlyFee) * 0.9).toFixed(2)}/mo
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Auto-send toggle */}
          {selectedLead?.email && (
            <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Auto-send payment link</p>
                  <p className="text-xs text-muted-foreground">Send to {selectedLead.email}</p>
                </div>
              </div>
              <Switch checked={autoSendLink} onCheckedChange={setAutoSendLink} />
            </div>
          )}

          <Button
            className="w-full h-12 rounded-xl text-base font-medium"
            onClick={handleCreateInvoice}
            disabled={isCreatingInvoice || (!price && !monthlyFee)}
          >
            {isCreatingInvoice ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                {autoSendLink && selectedLead?.email ? 'Create & Send Invoice' : 'Create Invoice'}
              </>
            )}
          </Button>
        </DialogContent>
      </Dialog>


      {/* Create Proposal Dialog */}
      <Dialog open={proposalDialogOpen} onOpenChange={setProposalDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Create Proposal</p>
                <p className="text-sm font-normal text-muted-foreground">{selectedLead?.businessName}</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="proposal-title">Title</Label>
              <Input
                id="proposal-title"
                placeholder="Website Design & Development"
                value={proposalTitle}
                onChange={(e) => setProposalTitle(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposal-description">Description</Label>
              <Textarea
                id="proposal-description"
                placeholder="Describe the project scope and deliverables..."
                value={proposalDescription}
                onChange={(e) => setProposalDescription(e.target.value)}
                className="min-h-[100px] rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposal-scope">Deliverables (one per line)</Label>
              <Textarea
                id="proposal-scope"
                placeholder="Custom responsive website&#10;Mobile optimization&#10;Contact form integration&#10;SEO setup"
                value={proposalScope}
                onChange={(e) => setProposalScope(e.target.value)}
                className="min-h-[80px] rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposal-timeline">Timeline</Label>
              <Input
                id="proposal-timeline"
                placeholder="2 weeks"
                value={proposalTimeline}
                onChange={(e) => setProposalTimeline(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            <Button
              className="w-full h-12 rounded-xl"
              onClick={handleCreateProposal}
              disabled={isCreatingProposal || !proposalTitle || !proposalDescription}
            >
              {isCreatingProposal ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Create & Send Proposal
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Reminder Dialog */}
      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-500">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Send Payment Reminder</p>
                <p className="text-sm font-normal text-muted-foreground">{selectedLead?.businessName}</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="rounded-xl bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Amount Due</span>
                <span className="font-semibold">{selectedLead?.deal ? formatCurrency(selectedLead.deal.amount) : '-'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-message">Custom Message (optional)</Label>
              <Textarea
                id="reminder-message"
                placeholder="Add a personal note to your reminder..."
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                className="min-h-[80px] rounded-xl"
              />
            </div>

            <Button
              className="w-full h-12 rounded-xl"
              onClick={handleSendReminder}
              disabled={isSendingReminder}
            >
              {isSendingReminder ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Send Reminder Now
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Process Refund</p>
                <p className="text-sm font-normal text-muted-foreground">{selectedLead?.businessName}</p>
              </div>
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The payment will be refunded to the customer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-red-500">Original Amount</p>
                  <p className="text-lg font-bold">{selectedLead?.deal ? formatCurrency(selectedLead.deal.amount) : '-'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refund-amount">Refund Amount (leave empty for full refund)</Label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="refund-amount"
                  type="number"
                  placeholder={selectedLead?.deal ? (selectedLead.deal.amount / 100).toString() : ''}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="pl-12 h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refund-reason">Reason</Label>
              <Textarea
                id="refund-reason"
                placeholder="Why is this refund being processed?"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="min-h-[80px] rounded-xl"
              />
            </div>

            <Button
              variant="destructive"
              className="w-full h-12 rounded-xl"
              onClick={handleRefund}
              disabled={isProcessingRefund}
            >
              {isProcessingRefund ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Process Refund
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  subtitle,
  highlight,
}: {
  icon: React.ElementType
  label: string
  value: string
  color: 'blue' | 'yellow' | 'green' | 'purple'
  subtitle: string
  highlight?: boolean
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
    green: 'bg-green-500/10 text-green-500',
    purple: 'bg-purple-500/10 text-purple-500',
  }

  return (
    <div className={`group rounded-2xl border border-border bg-background p-5 transition-all hover:border-border/80 hover:-translate-y-0.5 ${highlight ? 'ring-1 ring-purple-500/20' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className={`text-2xl font-bold tracking-tight ${highlight ? 'text-purple-500' : ''}`}>{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
      <p className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</p>
    </div>
  )
}

// Deal Card Component
function DealCard({
  lead,
  onCreateInvoice,
  onCreateProposal,
  onSendReminder,
  onRefund,
  onSendPaymentLink,
  onExport,
  isExporting,
  isSendingPaymentLink,
  formatCurrency,
  getInitials,
}: {
  lead: Lead
  onCreateInvoice: () => void
  onCreateProposal: () => void
  onSendReminder: () => void
  onRefund: () => void
  onSendPaymentLink: () => void
  onExport: () => void
  isExporting: boolean
  isSendingPaymentLink: boolean
  formatCurrency: (cents: number) => string
  getInitials: (name: string) => string
}) {
  const isPaid = lead.deal?.status === 'PAID' || lead.deal?.status === 'ACTIVE_SUBSCRIPTION'
  const isPending = lead.deal?.status === 'PENDING'
  const isRefunded = lead.deal?.status === 'REFUNDED'
  const isRecurring = lead.deal?.isRecurring
  const hasWebsite = !!lead.generatedWebsite

  return (
    <div className="group rounded-2xl border border-border bg-background p-5 transition-all hover:border-border/80 hover:shadow-lg hover:shadow-black/5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-foreground to-foreground/80 text-background font-bold text-sm">
            {getInitials(lead.businessName)}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold truncate">{lead.businessName}</h3>
            <p className="text-sm text-muted-foreground capitalize">
              {lead.category.replace('_', ' ')} • {lead.city}
            </p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {hasWebsite && (
              <DropdownMenuItem asChild>
                <a href={`/cold-call/preview/${lead.generatedWebsite?.id}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview Website
                </a>
              </DropdownMenuItem>
            )}
            {!lead.deal && (
              <>
                <DropdownMenuItem onClick={onCreateInvoice}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Create Invoice
                </DropdownMenuItem>
              </>
            )}
            {lead.deal && !isPaid && !isRefunded && (
              <>
                <DropdownMenuItem onClick={onCreateProposal}>
                  <FileText className="mr-2 h-4 w-4" />
                  Create Proposal
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSendPaymentLink} disabled={isSendingPaymentLink}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Payment Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSendReminder}>
                  <Bell className="mr-2 h-4 w-4" />
                  Send Reminder
                </DropdownMenuItem>
              </>
            )}
            {isPaid && (
              <>
                {hasWebsite && (
                  <DropdownMenuItem onClick={onExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Website
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onRefund} className="text-red-500 focus:text-red-500">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Process Refund
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status Badge */}
      <div className="mb-4 flex items-center gap-2">
        {isRefunded ? (
          <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 rounded-full px-3 py-1">
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Refunded
          </Badge>
        ) : isPaid ? (
          <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 rounded-full px-3 py-1">
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            Paid
          </Badge>
        ) : isPending ? (
          <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-full px-3 py-1">
            <Clock className="mr-1.5 h-3.5 w-3.5" />
            Awaiting Payment
          </Badge>
        ) : (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full px-3 py-1">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Ready to Invoice
          </Badge>
        )}
        {isRecurring && (
          <Badge variant="outline" className="rounded-full px-2 py-1">
            <RefreshCcw className="mr-1 h-3 w-3" />
            Recurring
          </Badge>
        )}
      </div>

      {/* Deal Amount */}
      {lead.deal && (
        <div className="rounded-xl bg-muted/50 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {isRefunded ? 'Refunded' : 'Deal Value'}
              </p>
              <p className={`text-2xl font-bold ${isRefunded ? 'text-red-500 line-through' : ''}`}>
                {formatCurrency(lead.deal.amount)}
              </p>
              {isRecurring && lead.deal.recurringAmount && (
                <p className="text-sm text-muted-foreground">
                  + {formatCurrency(lead.deal.recurringAmount)}/mo
                </p>
              )}
            </div>
            {isPaid && lead.deal.paidAt && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Paid On</p>
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(lead.deal.paidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            )}
            {isRefunded && lead.deal.refundedAt && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Refunded</p>
                <p className="text-sm font-medium text-red-500">
                  {formatCurrency(lead.deal.refundAmount || lead.deal.amount)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {!lead.deal ? (
          <Button className="flex-1 rounded-xl h-10" onClick={onCreateInvoice}>
            <CreditCard className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        ) : isRefunded ? (
          <Button variant="outline" className="flex-1 rounded-xl h-10" disabled>
            <RotateCcw className="mr-2 h-4 w-4" />
            Refunded
          </Button>
        ) : isPaid ? (
          <Button className="flex-1 rounded-xl h-10" onClick={onExport} disabled={isExporting || !hasWebsite}>
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Export Website
          </Button>
        ) : (
          <Button
            variant="outline"
            className="flex-1 rounded-xl h-10"
            onClick={onSendPaymentLink}
            disabled={isSendingPaymentLink || !lead.email}
          >
            {isSendingPaymentLink ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send Payment Link
          </Button>
        )}

        {hasWebsite && (
          <a href={`/cold-call/preview/${lead.generatedWebsite?.id}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="icon" className="rounded-xl h-10 w-10">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        )}
      </div>
    </div>
  )
}
