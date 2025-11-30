'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Globe,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  Eye,
  Sparkles,
  ArrowRight,
  Clock,
  Star,
} from 'lucide-react'
import Link from 'next/link'
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
  rating: number | null
  reviewCount: number | null
  nextFollowUp: string | null
  lastContactedAt: string | null
  generatedWebsite: { id: string } | null
  createdAt: string
}

type Props = {
  leads: Lead[]
  slug: string
  onStatusChange: (leadId: string, newStatus: string) => void
  onGenerateWebsite: (leadId: string) => void
}

const PIPELINE_STAGES = [
  { id: 'NEW', label: 'New', color: 'bg-blue-500' },
  { id: 'CONTACTED', label: 'Contacted', color: 'bg-yellow-500' },
  { id: 'INTERESTED', label: 'Interested', color: 'bg-purple-500' },
  { id: 'NEGOTIATING', label: 'Negotiating', color: 'bg-orange-500' },
  { id: 'WON', label: 'Won', color: 'bg-green-500' },
  { id: 'LOST', label: 'Lost', color: 'bg-gray-400' },
]

export function PipelineView({ leads, slug, onStatusChange, onGenerateWebsite }: Props) {
  const [draggedLead, setDraggedLead] = useState<string | null>(null)

  const getLeadsByStatus = (status: string) => {
    return leads.filter(lead => lead.status === status)
  }

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLead(leadId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    if (draggedLead) {
      onStatusChange(draggedLead, newStatus)
      setDraggedLead(null)
    }
  }

  const handleDragEnd = () => {
    setDraggedLead(null)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const isOverdue = (dateStr: string | null) => {
    if (!dateStr) return false
    return new Date(dateStr) < new Date()
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {PIPELINE_STAGES.map(stage => (
        <div
          key={stage.id}
          className="flex-shrink-0 w-72"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, stage.id)}
        >
          {/* Column Header */}
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className={`w-2 h-2 rounded-full ${stage.color}`} />
            <span className="font-medium text-sm">{stage.label}</span>
            <Badge variant="secondary" className="ml-auto text-xs">
              {getLeadsByStatus(stage.id).length}
            </Badge>
          </div>

          {/* Column Content */}
          <div className="space-y-3 min-h-[200px] p-2 rounded-xl bg-muted/30">
            {getLeadsByStatus(stage.id).map(lead => (
              <Card
                key={lead.id}
                draggable
                onDragStart={(e) => handleDragStart(e, lead.id)}
                onDragEnd={handleDragEnd}
                className={`p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
                  draggedLead === lead.id ? 'opacity-50 scale-95' : ''
                }`}
              >
                {/* Lead Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <Link 
                      href={`/dashboard/${slug}/cold-call/leads/${lead.id}`}
                      className="font-semibold text-sm hover:underline truncate block"
                    >
                      {lead.businessName}
                    </Link>
                    <p className="text-xs text-muted-foreground capitalize truncate">
                      {lead.category.replace(/_/g, ' ')} • {lead.city}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
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
                      {lead.generatedWebsite ? (
                        <DropdownMenuItem asChild>
                          <a href={`/cold-call/preview/${lead.generatedWebsite.id}`} target="_blank">
                            <Globe className="mr-2 h-4 w-4" />
                            Preview Website
                          </a>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onGenerateWebsite(lead.id)}>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Website
                        </DropdownMenuItem>
                      )}
                      {lead.phone && (
                        <DropdownMenuItem asChild>
                          <a href={`tel:${lead.phone}`}>
                            <Phone className="mr-2 h-4 w-4" />
                            Call
                          </a>
                        </DropdownMenuItem>
                      )}
                      {lead.email && (
                        <DropdownMenuItem asChild>
                          <a href={`mailto:${lead.email}`}>
                            <Mail className="mr-2 h-4 w-4" />
                            Email
                          </a>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Lead Info */}
                <div className="space-y-2">
                  {/* Rating */}
                  {lead.rating && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      <span>{lead.rating}</span>
                      {lead.reviewCount && <span>({lead.reviewCount})</span>}
                    </div>
                  )}

                  {/* Website Status */}
                  {lead.generatedWebsite ? (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Globe className="h-3 w-3" />
                      <span>Website ready</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      <span>No website</span>
                    </div>
                  )}

                  {/* Follow-up */}
                  {lead.nextFollowUp && (
                    <div className={`flex items-center gap-1 text-xs ${
                      isOverdue(lead.nextFollowUp) ? 'text-red-500' : 'text-blue-500'
                    }`}>
                      <Calendar className="h-3 w-3" />
                      <span>
                        {isOverdue(lead.nextFollowUp) ? 'Overdue: ' : 'Follow-up: '}
                        {formatDate(lead.nextFollowUp)}
                      </span>
                    </div>
                  )}

                  {/* Last Contact */}
                  {lead.lastContactedAt && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Last contact: {formatDate(lead.lastContactedAt)}</span>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                {stage.id !== 'WON' && stage.id !== 'LOST' && (
                  <div className="mt-3 pt-3 border-t flex gap-2">
                    {!lead.generatedWebsite && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 text-xs"
                        onClick={() => onGenerateWebsite(lead.id)}
                      >
                        <Sparkles className="mr-1 h-3 w-3" />
                        Generate
                      </Button>
                    )}
                    {lead.generatedWebsite && stage.id === 'NEW' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 text-xs"
                        onClick={() => onStatusChange(lead.id, 'CONTACTED')}
                      >
                        <ArrowRight className="mr-1 h-3 w-3" />
                        Move to Contacted
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            ))}

            {getLeadsByStatus(stage.id).length === 0 && (
              <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
                Drop leads here
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
