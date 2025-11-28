'use client'

import { useState } from 'react'
import { VideoGeneratorForm } from '@/components/ugc-video/video-generator-form'

// Note: Metadata must be in a separate layout.tsx for client components
import { ScriptPreview } from '@/components/ugc-video/script-preview'
import { VideoPreviewMockup } from '@/components/ugc-video/video-preview-mockup'
import { TemplateSelector } from '@/components/ugc-video/template-selector'
import { VideoHistory } from '@/components/ugc-video/video-history'
import { GeneratedScript } from '@/actions/ugc-video'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Video, 
  Wand2, 
  Sparkles, 
  TrendingUp,
  Zap
} from 'lucide-react'

export default function UGCVideoPage() {
  const [currentJob, setCurrentJob] = useState<any>(null)
  const [currentScript, setCurrentScript] = useState<GeneratedScript | null>(null)
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)

  const handleScriptGenerated = (job: any, script: GeneratedScript, videoUrl?: string) => {
    setCurrentJob(job)
    setCurrentScript(script)
    if (videoUrl) {
      setCurrentVideoUrl(videoUrl)
    }
  }

  const handleRegenerate = (newScript: GeneratedScript) => {
    setCurrentScript(newScript)
  }

  const handleSelectJob = (job: any) => {
    setCurrentJob(job)
    // Reconstruct script from job data
    if (job.hook_text) {
      setCurrentScript({
        hookText: job.hook_text,
        problemText: job.problem_text,
        revealText: job.reveal_text,
        benefitsText: job.benefits_text || [],
        demoText: job.demo_text,
        ctaText: job.cta_text,
        fullScript: job.full_script,
        captions: []
      })
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-border/50 p-6 backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
        
        <div className="relative flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#3352CC] to-[#5577FF]">
            <Video className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              UGC Video Generator
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Create viral TikTok & Reels scripts in seconds
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="relative flex gap-6 mt-6">
          <div className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-muted-foreground">9:16 Vertical Format</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Wand2 className="h-4 w-4 text-purple-500" />
            <span className="text-muted-foreground">AI Script Generation</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Video className="h-4 w-4 text-blue-500" />
            <span className="text-muted-foreground">15-25s Optimal Length</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form & Templates */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Create New
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Templates
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <VideoGeneratorForm onScriptGenerated={handleScriptGenerated} />
            </TabsContent>

            <TabsContent value="templates">
              <TemplateSelector 
                onSelectTemplate={setSelectedTemplate}
                selectedTemplateId={selectedTemplate?.id}
              />
            </TabsContent>
          </Tabs>

          {/* Script Preview */}
          {currentScript && currentJob && (
            <ScriptPreview 
              script={currentScript}
              jobId={currentJob.id}
              productName={currentJob.product_name}
              onRegenerate={handleRegenerate}
            />
          )}
        </div>

        {/* Right Column - Preview & History */}
        <div className="space-y-6">
          {/* Video Preview */}
          {currentScript && (
            <VideoPreviewMockup 
              script={currentScript}
              productName={currentJob?.product_name || 'Your Product'}
            />
          )}

          {/* History */}
          <VideoHistory onSelectJob={handleSelectJob} />
        </div>
      </div>
    </div>
  )
}
