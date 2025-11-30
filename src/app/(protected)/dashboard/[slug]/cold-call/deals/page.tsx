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
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  generatedWebsite: {
    id: string
  } | null
  deal: {
    id: string
    amount: number
    status: string
    stripePaymentId: string | null
    paidAt: string | null
    createdAt?: string
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
        const dealLeads = (data.leads || []).filter(
          (l: Lead) => l.generatedWebsite !== null || l.deal !== null
        )
        setLeads(dealLeads)

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
          amount: Math.round(amount * 100),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create invoice')
      }

      setDialogOpen(false)
      
      // Copy to clipboard after dialog closes
      setTimeout(async () => {
        try {
          await navigator.clipboard.writeText(data.paymentUrl)
          toast.success('Invoice created! Payment link copied.')
        } catch {
          // Fallback: show the link in toast if clipboard fails
          toast.success('Invoice created!', {
            description: 'Payment link: ' + data.paymentUrl,
            duration: 10000,
          })
        }
      }, 100)
      
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
            <p className="text-muted-foreground">Track revenue and close deals</p>
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Receipt}
          label="Total Deals"
          value={stats.totalDeals.toString()}
          color="blue"
          subtitle="All time"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={stats.pendingDeals.toString()}
          color="yellow"
          subtitle="Awaiting payment"
        />
        <StatCard
          icon={CheckCircle2}
          label="Paid"
          value={stats.paidDeals.toString()}
          color="green"
          subtitle="Completed"
        />
        <StatCard
          icon={TrendingUp}
          label="Revenue"
          value={formatCurrency(stats.totalRevenue)}
          color="purple"
          subtitle="Total earned"
          highlight
        />
      </div>

      {/* Deals Section */}
      {leads.length > 0 ? (
        <div className="space-y-6">
          {/* Section Header */}
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

          {/* Deals Grid */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {leads.map((lead) => (
              <DealCard
                key={lead.id}
                lead={lead}
                onCreateInvoice={() => {
                  setSelectedLead(lead)
                  setPrice('')
                  setDialogOpen(true)
                }}
                onExport={() => handleExportWebsite(lead)}
                isExporting={isExporting === lead.id}
                formatCurrency={formatCurrency}
                getInitials={getInitials}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
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

          <div className="space-y-6 mt-4">
            <div className="space-y-3">
              <Label htmlFor="price" className="text-sm font-medium">Website Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="price"
                  type="number"
                  placeholder="500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-12 h-12 text-lg font-semibold rounded-xl"
                  min="1"
                  step="1"
                />
              </div>
            </div>

            {/* Price Breakdown */}
            {price && parseFloat(price) > 0 && (
              <div className="rounded-xl bg-muted/50 p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${parseFloat(price).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Platform fee (10%)</span>
                  <span className="text-red-500">-${(parseFloat(price) * 0.1).toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <span className="font-medium">You receive</span>
                  <span className="text-lg font-bold text-green-500">
                    ${(parseFloat(price) * 0.9).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <Button
              className="w-full h-12 rounded-xl text-base font-medium"
              onClick={handleCreateInvoice}
              disabled={isCreatingInvoice || !price}
            >
              {isCreatingInvoice ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Invoice...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
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
        {highlight && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-500 bg-purple-500/10 px-2 py-1 rounded-full">
            Earnings
          </span>
        )}
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
  onExport,
  isExporting,
  formatCurrency,
  getInitials,
}: {
  lead: Lead
  onCreateInvoice: () => void
  onExport: () => void
  isExporting: boolean
  formatCurrency: (cents: number) => string
  getInitials: (name: string) => string
}) {
  const isPaid = lead.deal?.status === 'PAID'
  const isPending = lead.deal?.status === 'PENDING'
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
          <DropdownMenuContent align="end" className="w-48">
            {hasWebsite && (
              <DropdownMenuItem asChild>
                <a href={`/cold-call/preview/${lead.generatedWebsite?.id}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview Website
                </a>
              </DropdownMenuItem>
            )}
            {isPaid && hasWebsite && (
              <DropdownMenuItem onClick={onExport}>
                <Download className="mr-2 h-4 w-4" />
                Export Website
              </DropdownMenuItem>
            )}
            {isPending && (
              <DropdownMenuItem onClick={() => toast.info('Check Stripe dashboard for payment link')}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Payment Link
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        {isPaid ? (
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
      </div>

      {/* Deal Amount */}
      {lead.deal && (
        <div className="rounded-xl bg-muted/50 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Deal Value</p>
              <p className="text-2xl font-bold">{formatCurrency(lead.deal.amount)}</p>
            </div>
            {isPaid && lead.deal.paidAt && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Paid On</p>
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(lead.deal.paidAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {!lead.deal ? (
          <Button
            className="flex-1 rounded-xl h-10"
            onClick={onCreateInvoice}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        ) : isPaid ? (
          <Button
            className="flex-1 rounded-xl h-10"
            onClick={onExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export Website
          </Button>
        ) : (
          <Button
            variant="outline"
            className="flex-1 rounded-xl h-10"
            onClick={() => toast.info('Payment link sent - awaiting client payment')}
          >
            <Clock className="mr-2 h-4 w-4" />
            Pending Payment
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
