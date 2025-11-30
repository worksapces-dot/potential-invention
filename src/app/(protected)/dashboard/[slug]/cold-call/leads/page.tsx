'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  MapPin, 
  Building2, 
  Star,
  Phone,
  Mail,
  ExternalLink,
  Loader2,
  ArrowLeft,
  MoreHorizontal,
  Trash2,
  Eye,
  Sparkles,
  Link2,
  LayoutGrid,
  Columns3,
  Calendar,
  Bell,
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
import { PipelineView } from '@/components/cold-call/pipeline-view'

type Lead = {
  id: string
  businessName: string
  category: string
  address: string | null
  city: string
  state: string | null
  country: string
  phone: string | null
  email: string | null
  website: string | null
  rating: number | null
  reviewCount: number | null
  googleMapsUrl: string | null
  status: string
  nextFollowUp: string | null
  lastContactedAt: string | null
  createdAt: string
  generatedWebsite: any | null
  outreachEmails: any[]
}

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-500/10 text-blue-500',
  CONTACTED: 'bg-yellow-500/10 text-yellow-500',
  INTERESTED: 'bg-green-500/10 text-green-500',
  NEGOTIATING: 'bg-purple-500/10 text-purple-500',
  WON: 'bg-emerald-500/10 text-emerald-500',
  LOST: 'bg-red-500/10 text-red-500',
}

export default function LeadsPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'pipeline'>('grid')
  const [followUpCount, setFollowUpCount] = useState(0)
  const [generatingId, setGeneratingId] = useState<string | null>(null)

  useEffect(() => {
    fetchLeads()
    fetchFollowUps()
  }, [statusFilter])

  const fetchLeads = async () => {
    try {
      const url = statusFilter === 'all' 
        ? '/api/cold-call/leads'
        : `/api/cold-call/leads?status=${statusFilter}`
      
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch leads')
      }

      setLeads(data.leads || [])
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Failed to load leads')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFollowUps = async () => {
    try {
      const res = await fetch('/api/cold-call/follow-up')
      const data = await res.json()
      if (res.ok) {
        setFollowUpCount(data.leads?.length || 0)
      }
    } catch (error) {
      console.error('Failed to fetch follow-ups:', error)
    }
  }

  const handleDeleteLead = async (leadId: string) => {
    try {
      const response = await fetch(`/api/cold-call/leads/${leadId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete lead')
      }

      setLeads(leads.filter(l => l.id !== leadId))
      toast.success('Lead deleted')
    } catch (error) {
      toast.error('Failed to delete lead')
    }
  }

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/cold-call/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      setLeads(leads.map(l => 
        l.id === leadId ? { ...l, status: newStatus } : l
      ))
      toast.success('Status updated')
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleGenerateWebsite = async (leadId: string) => {
    setGeneratingId(leadId)
    toast.info('Generating website... This may take 30-60 seconds.')

    try {
      const response = await fetch('/api/cold-call/generate-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate website')
      }

      setLeads(leads.map(l => 
        l.id === leadId ? { ...l, generatedWebsite: { id: data.websiteId } } : l
      ))
      
      toast.success('Website generated! Click to preview.')
      fetchLeads() // Refresh to get full data
    } catch (error) {
      console.error('Generate error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate website')
    } finally {
      setGeneratingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/${slug}/cold-call`}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Leads</h1>
            <p className="text-muted-foreground">
              {leads.length} saved leads
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Follow-up Alert */}
          {followUpCount > 0 && (
            <Button variant="outline" size="sm" className="gap-2">
              <Bell className="h-4 w-4 text-orange-500" />
              <span>{followUpCount} follow-up{followUpCount > 1 ? 's' : ''} due</span>
            </Button>
          )}

          {/* View Toggle */}
          <div className="flex rounded-lg border p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 px-3"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'pipeline' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 px-3"
              onClick={() => setViewMode('pipeline')}
            >
              <Columns3 className="h-4 w-4" />
            </Button>
          </div>

          {viewMode === 'grid' && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="CONTACTED">Contacted</SelectItem>
                <SelectItem value="INTERESTED">Interested</SelectItem>
                <SelectItem value="NEGOTIATING">Negotiating</SelectItem>
                <SelectItem value="WON">Won</SelectItem>
                <SelectItem value="LOST">Lost</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Link href={`/dashboard/${slug}/cold-call/find-leads`}>
            <Button>Find More Leads</Button>
          </Link>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Pipeline View */}
      {!isLoading && viewMode === 'pipeline' && leads.length > 0 && (
        <PipelineView
          leads={leads}
          slug={slug}
          onStatusChange={handleUpdateStatus}
          onGenerateWebsite={handleGenerateWebsite}
        />
      )}

      {/* Grid View */}
      {!isLoading && viewMode === 'grid' && leads.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leads.map((lead) => (
            <Card 
              key={lead.id} 
              className="p-5 bg-background/50 border-border/50 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/dashboard/${slug}/cold-call/leads/${lead.id}`}
                    className="font-semibold truncate block hover:underline"
                  >
                    {lead.businessName}
                  </Link>
                  <p className="text-sm text-muted-foreground capitalize">
                    {lead.category.replace('_', ' ')}
                  </p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/${slug}/cold-call/leads/${lead.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-500"
                      onClick={() => handleDeleteLead(lead.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Status Badge */}
              <div className="mt-3">
                <Select 
                  value={lead.status} 
                  onValueChange={(value) => handleUpdateStatus(lead.id, value)}
                >
                  <SelectTrigger className="w-fit h-7 text-xs">
                    <Badge className={statusColors[lead.status]}>
                      {lead.status}
                    </Badge>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="CONTACTED">Contacted</SelectItem>
                    <SelectItem value="INTERESTED">Interested</SelectItem>
                    <SelectItem value="NEGOTIATING">Negotiating</SelectItem>
                    <SelectItem value="WON">Won</SelectItem>
                    <SelectItem value="LOST">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {lead.address || `${lead.city}, ${lead.country}`}
                  </span>
                </div>

                {lead.rating && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Star className="h-4 w-4 shrink-0 fill-yellow-500 text-yellow-500" />
                    <span>{lead.rating} ({lead.reviewCount} reviews)</span>
                  </div>
                )}

                {lead.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{lead.phone}</span>
                  </div>
                )}

                {lead.nextFollowUp && (
                  <div className={`flex items-center gap-2 ${
                    new Date(lead.nextFollowUp) < new Date() ? 'text-red-500' : 'text-blue-500'
                  }`}>
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span className="text-xs">
                      Follow-up: {new Date(lead.nextFollowUp).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Website Actions */}
              <div className="mt-4 pt-4 border-t border-border/50">
                {lead.generatedWebsite ? (
                  <div className="flex gap-2">
                    <a
                      href={`/cold-call/preview/${lead.generatedWebsite.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                    </a>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/cold-call/preview/${lead.generatedWebsite.id}`
                        )
                        toast.success('Link copied!')
                      }}
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={() => handleGenerateWebsite(lead.id)}
                    disabled={generatingId === lead.id}
                  >
                    {generatingId === lead.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Website
                      </>
                    )}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && leads.length === 0 && (
        <Card className="p-12 bg-background/50 border-border/50 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No leads saved yet</h3>
              <p className="text-muted-foreground">
                Start by finding businesses without websites
              </p>
            </div>
            <Link href={`/dashboard/${slug}/cold-call/find-leads`}>
              <Button className="mt-2">Find Leads</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
