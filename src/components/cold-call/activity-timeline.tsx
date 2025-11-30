'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Mail,
  Phone,
  Calendar,
  FileText,
  Globe,
  DollarSign,
  Clock,
  Loader2,
  Plus,
  Send,
  Eye,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react'
import { toast } from 'sonner'

type Activity = {
  id: string
  type: string
  title: string
  description: string | null
  metadata: any
  createdAt: string
}

type Props = {
  leadId: string
}

const ACTIVITY_ICONS: Record<string, any> = {
  NOTE: FileText,
  EMAIL_SENT: Send,
  EMAIL_OPENED: Eye,
  EMAIL_REPLIED: MessageSquare,
  CALL: Phone,
  MEETING: Calendar,
  WEBSITE_GENERATED: Globe,
  WEBSITE_VIEWED: Eye,
  STATUS_CHANGE: CheckCircle2,
  DEAL_CREATED: DollarSign,
  DEAL_PAID: DollarSign,
  FOLLOW_UP_SCHEDULED: Clock,
}

const ACTIVITY_COLORS: Record<string, string> = {
  NOTE: 'bg-gray-100 text-gray-600',
  EMAIL_SENT: 'bg-blue-100 text-blue-600',
  EMAIL_OPENED: 'bg-green-100 text-green-600',
  EMAIL_REPLIED: 'bg-purple-100 text-purple-600',
  CALL: 'bg-yellow-100 text-yellow-600',
  MEETING: 'bg-orange-100 text-orange-600',
  WEBSITE_GENERATED: 'bg-cyan-100 text-cyan-600',
  WEBSITE_VIEWED: 'bg-teal-100 text-teal-600',
  STATUS_CHANGE: 'bg-indigo-100 text-indigo-600',
  DEAL_CREATED: 'bg-emerald-100 text-emerald-600',
  DEAL_PAID: 'bg-green-100 text-green-600',
  FOLLOW_UP_SCHEDULED: 'bg-pink-100 text-pink-600',
}

export function ActivityTimeline({ leadId }: Props) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [showNoteInput, setShowNoteInput] = useState(false)

  useEffect(() => {
    fetchActivities()
  }, [leadId])

  const fetchActivities = async () => {
    try {
      const res = await fetch(`/api/cold-call/activities?leadId=${leadId}`)
      const data = await res.json()
      if (res.ok) {
        setActivities(data.activities || [])
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    setIsAddingNote(true)
    try {
      const res = await fetch('/api/cold-call/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          type: 'NOTE',
          title: 'Note added',
          description: newNote,
        }),
      })

      if (res.ok) {
        toast.success('Note added')
        setNewNote('')
        setShowNoteInput(false)
        fetchActivities()
      }
    } catch (error) {
      toast.error('Failed to add note')
    } finally {
      setIsAddingNote(false)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Add Note Button */}
      {!showNoteInput ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNoteInput(true)}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      ) : (
        <Card className="p-4">
          <Textarea
            placeholder="Write a note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="mb-3 min-h-[80px]"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAddNote}
              disabled={isAddingNote || !newNote.trim()}
            >
              {isAddingNote && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Note
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowNoteInput(false)
                setNewNote('')
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        {activities.length > 0 && (
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
        )}

        {/* Activities */}
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = ACTIVITY_ICONS[activity.type] || FileText
            const colorClass = ACTIVITY_COLORS[activity.type] || 'bg-gray-100 text-gray-600'

            return (
              <div key={activity.id} className="relative flex gap-4">
                {/* Icon */}
                <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{activity.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(activity.createdAt)}
                    </span>
                  </div>
                  {activity.description && (
                    <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                      {activity.description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {activities.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No activity yet. Add a note to get started.
          </div>
        )}
      </div>
    </div>
  )
}
