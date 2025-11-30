'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Mail,
  Send,
  Loader2,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Building2,
  Globe,
  Eye,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { GmailConnect } from '@/components/gmail-connect'

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
}

type EmailDraft = {
  subject: string
  body: string
}

export default function OutreachPage() {
  const params = useParams()
  const slug = params.slug as string

  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [emailDraft, setEmailDraft] = useState<EmailDraft | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [copied, setCopied] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/cold-call/leads')
      const data = await response.json()
      if (response.ok) {
        // Only show leads with generated websites
        const leadsWithWebsites = (data.leads || []).filter(
          (l: Lead) => l.generatedWebsite !== null
        )
        setLeads(leadsWithWebsites)
      }
    } catch (error) {
      toast.error('Failed to load leads')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectLead = async (lead: Lead) => {
    setSelectedLead(lead)
    setRecipientEmail(lead.email || '')
    setEmailDraft(null)
    setDialogOpen(true)
    await generateEmail(lead)
  }

  const generateEmail = async (lead: Lead) => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/cold-call/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate email')
      }

      setEmailDraft({
        subject: data.subject,
        body: data.body,
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate email')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSendEmail = async () => {
    if (!selectedLead || !emailDraft || !recipientEmail) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSending(true)
    try {
      const response = await fetch('/api/cold-call/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLead.id,
          to: recipientEmail,
          subject: emailDraft.subject,
          body: emailDraft.body,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email')
      }

      toast.success('Email sent successfully!')
      setDialogOpen(false)
      
      // Update lead status
      await fetch(`/api/cold-call/leads/${selectedLead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONTACTED' }),
      })
      
      fetchLeads()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send email')
    } finally {
      setIsSending(false)
    }
  }

  const copyToClipboard = () => {
    if (emailDraft) {
      const fullEmail = `Subject: ${emailDraft.subject}\n\n${emailDraft.body}`
      navigator.clipboard.writeText(fullEmail)
      setCopied(true)
      toast.success('Email copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getPreviewUrl = (lead: Lead) => {
    if (lead.generatedWebsite) {
      return `${window.location.origin}/cold-call/preview/${lead.generatedWebsite.id}`
    }
    return ''
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
          <h1 className="text-2xl font-bold tracking-tight">Email Outreach</h1>
          <p className="text-muted-foreground">
            Send personalized emails to your leads with their website preview
          </p>
        </div>
      </div>

      {/* Gmail Connection Status */}
      <GmailConnect redirectTo={`/dashboard/${slug}/cold-call/outreach`} />

      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
            <Mail className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <h3 className="font-semibold">How it works</h3>
            <p className="text-sm text-muted-foreground mt-1">
              1. Connect your Gmail account above<br />
              2. Select a lead with a generated website<br />
              3. AI writes a personalized cold email<br />
              4. Review, edit if needed, and send from your Gmail
            </p>
          </div>
        </div>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Leads Ready for Outreach */}
      {!isLoading && leads.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Ready for Outreach ({leads.length})
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {leads.map((lead) => (
              <Card
                key={lead.id}
                className="p-5 bg-background/50 border-border/50 hover:shadow-md transition-shadow"
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
                      lead.status === 'CONTACTED'
                        ? 'bg-yellow-500/10 text-yellow-500'
                        : 'bg-blue-500/10 text-blue-500'
                    }
                  >
                    {lead.status}
                  </Badge>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">Website ready</span>
                </div>

                {lead.email && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSelectLead(lead)}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {lead.status === 'CONTACTED' ? 'Send Again' : 'Send Email'}
                  </Button>
                  <a
                    href={getPreviewUrl(lead)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </a>
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
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No leads ready for outreach</h3>
              <p className="text-muted-foreground">
                Generate websites for your leads first, then come back to send emails
              </p>
            </div>
            <Link href={`/dashboard/${slug}/cold-call/leads`}>
              <Button className="mt-2">Go to Leads</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Email Compose Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Compose Email to {selectedLead?.businessName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Recipient */}
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Email</Label>
              <Input
                id="recipient"
                type="email"
                placeholder="business@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
              {!selectedLead?.email && (
                <p className="text-xs text-orange-500">
                  No email found for this lead. Please enter manually.
                </p>
              )}
            </div>

            {/* Loading State */}
            {isGenerating && (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                  <p className="text-sm text-muted-foreground">
                    AI is writing your email...
                  </p>
                </div>
              </div>
            )}

            {/* Email Draft */}
            {emailDraft && !isGenerating && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={emailDraft.subject}
                    onChange={(e) =>
                      setEmailDraft({ ...emailDraft, subject: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">Email Body</Label>
                  <Textarea
                    id="body"
                    value={emailDraft.body}
                    onChange={(e) =>
                      setEmailDraft({ ...emailDraft, body: e.target.value })
                    }
                    className="min-h-[250px] font-mono text-sm"
                  />
                </div>

                {/* Preview Link Info */}
                {selectedLead?.generatedWebsite && (
                  <div className="p-3 bg-muted/50 rounded-lg text-sm">
                    <p className="font-medium mb-1">Website Preview Link:</p>
                    <a
                      href={getPreviewUrl(selectedLead)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline flex items-center gap-1"
                    >
                      {getPreviewUrl(selectedLead)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => selectedLead && generateEmail(selectedLead)}
                    disabled={isGenerating}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                  <Button variant="outline" onClick={copyToClipboard}>
                    {copied ? (
                      <Check className="mr-2 h-4 w-4" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    Copy
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSendEmail}
                    disabled={isSending || !recipientEmail}
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Email
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
