'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MapPin,
  Star,
  Phone,
  Mail,
  ExternalLink,
  Loader2,
  ArrowLeft,
  Globe,
  Sparkles,
  Eye,
  Copy,
  Check,
  Settings,
  Calendar,
  Clock,
  History,
} from 'lucide-react'
import { ActivityTimeline } from '@/components/cold-call/activity-timeline'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

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
  notes: string | null
  createdAt: string
  nextFollowUp?: string | null
  generatedWebsite: {
    id: string
    previewUrl: string
    createdAt: string
  } | null
}

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-500/10 text-blue-500',
  CONTACTED: 'bg-yellow-500/10 text-yellow-500',
  INTERESTED: 'bg-green-500/10 text-green-500',
  NEGOTIATING: 'bg-purple-500/10 text-purple-500',
  WON: 'bg-emerald-500/10 text-emerald-500',
  LOST: 'bg-red-500/10 text-red-500',
}

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const leadId = params.leadId as string

  const [lead, setLead] = useState<Lead | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [notes, setNotes] = useState('')
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchLead()
  }, [leadId])

  const fetchLead = async () => {
    try {
      const response = await fetch(`/api/cold-call/leads/${leadId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch lead')
      }

      setLead(data.lead)
      setNotes(data.lead.notes || '')
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Failed to load lead')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateWebsite = async () => {
    setIsGenerating(true)
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

      toast.success('Website generated successfully!')
      fetchLead() // Refresh to get the new website
    } catch (error) {
      console.error('Generate error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/cold-call/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update')

      setLead((prev) => (prev ? { ...prev, status: newStatus } : null))
      toast.success('Status updated')
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleSaveNotes = async () => {
    setIsSavingNotes(true)
    try {
      const response = await fetch(`/api/cold-call/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })

      if (!response.ok) throw new Error('Failed to save')

      toast.success('Notes saved')
    } catch (error) {
      toast.error('Failed to save notes')
    } finally {
      setIsSavingNotes(false)
    }
  }

  const copyPreviewLink = () => {
    if (lead?.generatedWebsite) {
      const url = `${window.location.origin}/cold-call/preview/${lead.generatedWebsite.id}`
      navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="p-6 text-center">
        <p>Lead not found</p>
        <Link href={`/dashboard/${slug}/cold-call/leads`}>
          <Button className="mt-4">Back to Leads</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/${slug}/cold-call/leads`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{lead.businessName}</h1>
          <p className="text-muted-foreground capitalize">
            {lead.category.replace(/_/g, ' ')} • {lead.city}, {lead.country}
          </p>
        </div>
        <Select value={lead.status} onValueChange={handleUpdateStatus}>
          <SelectTrigger className="w-[140px]">
            <Badge className={statusColors[lead.status]}>{lead.status}</Badge>
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Info */}
        <Card className="p-6 bg-background/50 border-border/50">
          <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
          <div className="space-y-3">
            {lead.address && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{lead.address}</span>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${lead.phone}`} className="hover:underline">
                  {lead.phone}
                </a>
              </div>
            )}
            {lead.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${lead.email}`} className="hover:underline">
                  {lead.email}
                </a>
              </div>
            )}
            {lead.rating && (
              <div className="flex items-center gap-3 text-sm">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span>
                  {lead.rating} stars ({lead.reviewCount} reviews)
                </span>
              </div>
            )}
            {lead.googleMapsUrl && (
              <a
                href={lead.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" />
                View on Yelp/Maps
              </a>
            )}
          </div>
        </Card>

        {/* Website Generator */}
        <Card className="p-6 bg-background/50 border-border/50">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Generated Website
          </h2>

          {lead.generatedWebsite ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-green-500">
                <Check className="h-4 w-4" />
                Website generated
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/cold-call/preview/${lead.generatedWebsite.id}`}
                  target="_blank"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </Link>
                <Button variant="outline" onClick={copyPreviewLink}>
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerateWebsite}
                  disabled={isGenerating}
                  variant="ghost"
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Regenerate
                    </>
                  )}
                </Button>
                <Link href={`/dashboard/${slug}/cold-call/leads/${leadId}/settings`}>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate a professional website preview to send to this lead.
              </p>
              <Button
                onClick={handleGenerateWebsite}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
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
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Notes */}
        <Card className="p-6 bg-background/50 border-border/50">
          <h2 className="text-lg font-semibold mb-4">Notes</h2>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this lead..."
            className="min-h-[100px] mb-4"
          />
          <Button onClick={handleSaveNotes} disabled={isSavingNotes}>
            {isSavingNotes ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Notes'
            )}
          </Button>
        </Card>

        {/* Activity Timeline */}
        <Card className="p-6 bg-background/50 border-border/50">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <History className="h-5 w-5" />
            Activity
          </h2>
          <ActivityTimeline leadId={leadId} />
        </Card>
      </div>

      {/* Follow-up Scheduler */}
      <Card className="p-6 bg-background/50 border-border/50">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Schedule Follow-up
        </h2>
        <FollowUpScheduler leadId={leadId} currentFollowUp={lead?.nextFollowUp} />
      </Card>
    </div>
  )
}

function FollowUpScheduler({ leadId, currentFollowUp }: { leadId: string, currentFollowUp?: string | null }) {
  const [date, setDate] = useState(currentFollowUp ? new Date(currentFollowUp).toISOString().split('T')[0] : '')
  const [isScheduling, setIsScheduling] = useState(false)

  const handleSchedule = async () => {
    if (!date) return
    setIsScheduling(true)
    try {
      const res = await fetch('/api/cold-call/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, followUpDate: date }),
      })
      if (res.ok) {
        toast.success('Follow-up scheduled!')
      }
    } catch {
      toast.error('Failed to schedule')
    } finally {
      setIsScheduling(false)
    }
  }

  const handleClear = async () => {
    try {
      await fetch(`/api/cold-call/follow-up?leadId=${leadId}`, { method: 'DELETE' })
      setDate('')
      toast.success('Follow-up cleared')
    } catch {
      toast.error('Failed to clear')
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        min={new Date().toISOString().split('T')[0]}
        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      <Button onClick={handleSchedule} disabled={!date || isScheduling} size="sm">
        {isScheduling ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Schedule'}
      </Button>
      {currentFollowUp && (
        <Button variant="ghost" size="sm" onClick={handleClear}>
          Clear
        </Button>
      )}
    </div>
  )
}
