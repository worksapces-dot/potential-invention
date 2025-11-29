'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
  DollarSign,
  Loader2,
  ArrowLeft,
  Building2,
  CreditCard,
  Download,
  ExternalLink,
  CheckCircle2,
  Clock,
  TrendingUp,
  Send,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

type Lead = {
  id: string
  businessName: string
  category: string
  city: string
  country: string
  phone: string | null
  email: string | null
  status: string
  generatedWebsite: {
    id: string
  } | null
  deal: {
    id: string
    amount: number
    status: string
    stripePaymentId: string | null
    paidAt: string | null
  } | null
}

export default function DealsPage() {
  const params = useParams()
  const slug = params.slug as string

  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [price, setPrice] = useState('')
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false)
  const [isExporting, setIsExporting] = useState<string | null>(null)

  // Stats
  const [stats, setStats] = useState({
    totalDeals: 0,
    pendingDeals: 0,
    paidDeals: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/cold-call/leads')
      const data = await response.json()
      if (response.ok) {
        // Show leads with generated websites OR existing deals
        const dealLeads = (data.leads || []).filter(
          (l: Lead) =>
            l.generatedWebsite !== null || l.deal !== null
        )
        setLeads(dealLeads)

        // Calculate stats
        const deals = dealLeads.filter((l: Lead) => l.deal)
        const paid = deals.filter((l: Lead) => l.deal?.status === 'PAID')
        setStats({
          totalDeals: deals.length,
          pendingDeals: deals.filter((l: Lead) => l.deal?.status === 'PENDING').length,
          paidDeals: paid.length,
          totalRevenue: paid.reduce((sum: number, l: Lead) => sum + (l.deal?.amount || 0), 0),
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
      const response = await fetch('/api/cold-call/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLead.id,
          amount: Math.round(amount * 100), // Convert to cents
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create invoice')
      }

      toast.success('Invoice created! Payment link copied to clipboard.')
      navigator.clipboard.writeText(data.paymentUrl)
      setDialogOpen(false)
      fetchLeads()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create invoice')
    } finally {
      setIsCreatingInvoice(false)
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
      
      if (!response.ok) {
        throw new Error('Failed to export')
      }

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

  const openInvoiceDialog = (lead: Lead) => {
    setSelectedLead(lead)
    setPrice('')
    setDialogOpen(true)
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/${slug}/cold-call`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Deals</h1>
          <p className="text-muted-foreground">
            Manage invoices and close deals
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-5 bg-background/50 border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <CreditCard className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalDeals}</p>
              <p className="text-sm text-muted-foreground">Total Deals</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-background/50 border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pendingDeals}</p>
              <p className="text-sm text-muted-foreground">Pending Payment</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-background/50 border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.paidDeals}</p>
              <p className="text-sm text-muted-foreground">Paid</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-background/50 border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-sm text-muted-foreground">Revenue</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Deals List */}
      {!isLoading && leads.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Active Deals ({leads.length})</h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {leads.map((lead) => (
              <Card
                key={lead.id}
                className="p-5 bg-background/50 border-border/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{lead.businessName}</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {lead.category.replace('_', ' ')} • {lead.city}
                    </p>
                  </div>
                  <Badge
                    className={
                      lead.status === 'WON'
                        ? 'bg-green-500/10 text-green-500'
                        : lead.status === 'NEGOTIATING'
                        ? 'bg-purple-500/10 text-purple-500'
                        : 'bg-blue-500/10 text-blue-500'
                    }
                  >
                    {lead.status}
                  </Badge>
                </div>

                {/* Deal Info */}
                {lead.deal && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Amount</span>
                      <span className="font-semibold">
                        {formatCurrency(lead.deal.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge
                        className={
                          lead.deal.status === 'PAID'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-yellow-500/10 text-yellow-500'
                        }
                      >
                        {lead.deal.status}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  {!lead.deal ? (
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => openInvoiceDialog(lead)}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Create Invoice
                    </Button>
                  ) : lead.deal.status === 'PAID' ? (
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleExportWebsite(lead)}
                      disabled={isExporting === lead.id}
                    >
                      {isExporting === lead.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Export Website
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        // Copy payment link again
                        toast.info('Payment link - check your Stripe dashboard')
                      }}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Awaiting Payment
                    </Button>
                  )}

                  {lead.generatedWebsite && (
                    <a
                      href={`/cold-call/preview/${lead.generatedWebsite.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && leads.length === 0 && (
        <Card className="p-12 bg-background/50 border-border/50 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No deals yet</h3>
              <p className="text-muted-foreground">
                When leads show interest, update their status to "Interested" to see them here
              </p>
            </div>
            <Link href={`/dashboard/${slug}/cold-call/leads`}>
              <Button className="mt-2">Go to Leads</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Create Invoice Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Create Invoice for {selectedLead?.businessName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="price">Website Price (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="price"
                  type="number"
                  placeholder="500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-10"
                  min="1"
                  step="1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Platform fee (10%): ${price ? (parseFloat(price) * 0.1).toFixed(2) : '0.00'}
                <br />
                You receive (90%): ${price ? (parseFloat(price) * 0.9).toFixed(2) : '0.00'}
              </p>
            </div>

            <Button
              className="w-full"
              onClick={handleCreateInvoice}
              disabled={isCreatingInvoice || !price}
            >
              {isCreatingInvoice ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Create & Copy Payment Link
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
