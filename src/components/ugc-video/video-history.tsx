'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Clock, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Eye,
  Download,
  Video
} from 'lucide-react'
import { getUserVideoJobs } from '@/actions/ugc-video'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'

interface VideoJob {
  id: string
  product_name: string
  status: string
  created_at: string
  video_url?: string
  thumbnail_url?: string
  hook_text?: string
}

interface Props {
  onSelectJob: (job: VideoJob) => void
}

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-yellow-500', label: 'Pending' },
  generating_script: { icon: Loader2, color: 'text-blue-500', label: 'Generating Script' },
  generating_video: { icon: Loader2, color: 'text-purple-500', label: 'Creating Video' },
  completed: { icon: CheckCircle2, color: 'text-green-500', label: 'Completed' },
  failed: { icon: AlertCircle, color: 'text-red-500', label: 'Failed' }
}

export function VideoHistory({ onSelectJob }: Props) {
  const [jobs, setJobs] = useState<VideoJob[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadJobs = useCallback(async () => {
    setIsLoading(true)
    const result = await getUserVideoJobs()
    if (result.status === 200) {
      setJobs(result.data)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-background/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Video className="h-4 w-4" />
            Recent Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-16 h-16 bg-muted rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (jobs.length === 0) {
    return (
      <Card className="border-border/50 bg-background/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Video className="h-4 w-4" />
            Recent Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Video className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No videos yet</p>
            <p className="text-sm">Create your first UGC video above!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-background/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Recent Videos
          </span>
          <Badge variant="outline">{jobs.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-3">
            {jobs.map((job) => {
              const status = statusConfig[job.status] || statusConfig.pending
              const StatusIcon = status.icon
              
              return (
                <div
                  key={job.id}
                  className="flex gap-3 p-3 rounded-lg border border-border/50 hover:border-border cursor-pointer transition-all"
                  onClick={() => onSelectJob(job)}
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded bg-muted flex items-center justify-center overflow-hidden relative">
                    {job.thumbnail_url ? (
                      <Image 
                        src={job.thumbnail_url} 
                        alt={job.product_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Video className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{job.product_name}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {job.hook_text || 'No hook generated'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", status.color)}
                      >
                        <StatusIcon className={cn(
                          "h-3 w-3 mr-1",
                          (job.status === 'generating_script' || job.status === 'generating_video') && "animate-spin"
                        )} />
                        {status.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {job.status === 'completed' && job.video_url && (
                    <div className="flex flex-col gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
