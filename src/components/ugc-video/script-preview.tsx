'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  RefreshCw, 
  Copy, 
  Download, 
  Play, 
  Zap, 
  MessageCircle, 
  Eye, 
  Sparkles,
  Clock,
  CheckCircle2
} from 'lucide-react'
import { GeneratedScript, regenerateScript } from '@/actions/ugc-video'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Props {
  script: GeneratedScript
  jobId: string
  productName: string
  onRegenerate: (newScript: GeneratedScript) => void
}

export function ScriptPreview({ script, jobId, productName, onRegenerate }: Props) {
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    try {
      const result = await regenerateScript(jobId)
      if (result.status === 200 && result.data) {
        toast.success('Script regenerated!')
        onRegenerate(result.data)
      } else {
        toast.error(result.error || 'Failed to regenerate')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsRegenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(script.fullScript)
    toast.success('Script copied to clipboard!')
  }

  const sections = [
    { id: 'hook', label: 'HOOK', icon: Zap, time: '0-2s', content: script.hookText, color: 'text-yellow-500' },
    { id: 'problem', label: 'PROBLEM', icon: MessageCircle, time: '2-6s', content: script.problemText, color: 'text-red-400' },
    { id: 'reveal', label: 'REVEAL', icon: Eye, time: '6-9s', content: script.revealText, color: 'text-purple-400' },
    { id: 'benefits', label: 'BENEFITS', icon: Sparkles, time: '9-16s', content: script.benefitsText.join('\n'), color: 'text-green-400' },
    { id: 'demo', label: 'DEMO', icon: Play, time: '16-20s', content: script.demoText, color: 'text-blue-400' },
    { id: 'cta', label: 'CTA', icon: CheckCircle2, time: '20-23s', content: script.ctaText, color: 'text-orange-400' },
  ]

  return (
    <Card className="border-border/50 bg-background/50 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generated Script
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            For: {productName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            <RefreshCw className={cn("h-4 w-4 mr-1", isRegenerating && "animate-spin")} />
            Regenerate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="visual" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="visual">Visual Timeline</TabsTrigger>
            <TabsTrigger value="full">Full Script</TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="space-y-3">
            {sections.map((section) => (
              <div
                key={section.id}
                className={cn(
                  "p-4 rounded-lg border transition-all cursor-pointer",
                  activeSection === section.id 
                    ? "border-primary bg-primary/5" 
                    : "border-border/50 hover:border-border"
                )}
                onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <section.icon className={cn("h-4 w-4", section.color)} />
                    <span className="font-semibold text-sm">{section.label}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {section.time}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="full">
            <div className="p-4 rounded-lg border border-border/50 bg-muted/30">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {script.fullScript}
              </pre>
            </div>
          </TabsContent>
        </Tabs>

        {/* Captions Preview */}
        {script.captions && script.captions.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Caption Breakdown
            </h4>
            <div className="space-y-2">
              {script.captions.map((caption, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-2 rounded bg-muted/30"
                >
                  <Badge variant="outline" className="text-xs min-w-[60px] justify-center">
                    {caption.startTime}s - {caption.endTime}s
                  </Badge>
                  <span className={cn(
                    "text-sm flex-1",
                    caption.style === 'hook' && "font-bold text-yellow-500",
                    caption.style === 'emphasis' && "font-semibold text-primary",
                    caption.style === 'cta' && "font-bold text-orange-400"
                  )}>
                    {caption.text}
                  </span>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {caption.style}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
