'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Music2
} from 'lucide-react'
import { GeneratedScript } from '@/actions/ugc-video'
import { cn } from '@/lib/utils'

interface Props {
  script: GeneratedScript
  productName: string
  videoUrl?: string | null
}

export function VideoPreviewMockup({ script, productName }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [currentCaption, setCurrentCaption] = useState('')
  const [captionStyle, setCaptionStyle] = useState<string>('normal')

  const totalDuration = 23 // seconds

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false)
            return 0
          }
          return prev + 0.1
        })
      }, 100)
    }

    return () => clearInterval(interval)
  }, [isPlaying])

  // Update caption based on current time
  useEffect(() => {
    if (script.captions && script.captions.length > 0) {
      const caption = script.captions.find(
        c => currentTime >= c.startTime && currentTime < c.endTime
      )
      if (caption) {
        setCurrentCaption(caption.text)
        setCaptionStyle(caption.style)
      }
    } else {
      // Fallback to section-based captions
      if (currentTime < 2) {
        setCurrentCaption(script.hookText)
        setCaptionStyle('hook')
      } else if (currentTime < 6) {
        setCurrentCaption(script.problemText)
        setCaptionStyle('normal')
      } else if (currentTime < 9) {
        setCurrentCaption(script.revealText)
        setCaptionStyle('emphasis')
      } else if (currentTime < 16) {
        const benefitIndex = Math.floor((currentTime - 9) / 2.3)
        setCurrentCaption(script.benefitsText[benefitIndex] || script.benefitsText[0])
        setCaptionStyle('normal')
      } else if (currentTime < 20) {
        setCurrentCaption(script.demoText)
        setCaptionStyle('normal')
      } else {
        setCurrentCaption(script.ctaText)
        setCaptionStyle('cta')
      }
    }
  }, [currentTime, script])

  const togglePlay = () => setIsPlaying(!isPlaying)
  const reset = () => {
    setCurrentTime(0)
    setIsPlaying(false)
  }

  const progress = (currentTime / totalDuration) * 100

  return (
    <Card className="border-border/50 bg-background/50 backdrop-blur overflow-hidden">
      {/* Phone Frame */}
      <div className="relative mx-auto w-[280px] aspect-[9/16] bg-black rounded-[2rem] overflow-hidden border-4 border-gray-800">
        {/* Status Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-2 text-white text-xs">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-2 border border-white rounded-sm">
              <div className="w-3/4 h-full bg-white rounded-sm" />
            </div>
          </div>
        </div>

        {/* Video Content Area */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className={cn(
                "absolute inset-0 bg-gradient-to-br transition-all duration-500",
                currentTime < 2 && "from-yellow-500/20 to-orange-500/20",
                currentTime >= 2 && currentTime < 6 && "from-red-500/20 to-pink-500/20",
                currentTime >= 6 && currentTime < 9 && "from-purple-500/20 to-blue-500/20",
                currentTime >= 9 && currentTime < 16 && "from-green-500/20 to-teal-500/20",
                currentTime >= 16 && currentTime < 20 && "from-blue-500/20 to-cyan-500/20",
                currentTime >= 20 && "from-orange-500/20 to-red-500/20"
              )}
            />
          </div>

          {/* Product Name Overlay */}
          <div className="absolute top-16 left-4 right-4 text-center">
            <Badge className="bg-white/10 backdrop-blur text-white border-0">
              {productName}
            </Badge>
          </div>

          {/* Caption Display */}
          <div className="absolute bottom-32 left-4 right-4 text-center">
            <p 
              className={cn(
                "text-white font-bold text-lg leading-tight drop-shadow-lg transition-all",
                captionStyle === 'hook' && "text-yellow-400 text-xl animate-pulse",
                captionStyle === 'emphasis' && "text-purple-400 scale-105",
                captionStyle === 'cta' && "text-orange-400 text-xl"
              )}
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
            >
              {currentCaption}
            </p>
          </div>

          {/* Play Button Overlay */}
          {!isPlaying && currentTime === 0 && (
            <button 
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/30"
            >
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <Play className="h-8 w-8 text-white ml-1" fill="white" />
              </div>
            </button>
          )}
        </div>

        {/* TikTok-style Side Actions */}
        <div className="absolute right-3 bottom-36 flex flex-col items-center gap-4 text-white">
          <button className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
              <Heart className="h-5 w-5" />
            </div>
            <span className="text-xs mt-1">24.5K</span>
          </button>
          <button className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
              <MessageCircle className="h-5 w-5" />
            </div>
            <span className="text-xs mt-1">1,234</span>
          </button>
          <button className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
              <Bookmark className="h-5 w-5" />
            </div>
            <span className="text-xs mt-1">5.6K</span>
          </button>
          <button className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
              <Share2 className="h-5 w-5" />
            </div>
            <span className="text-xs mt-1">Share</span>
          </button>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-4 left-3 right-14 text-white">
          <p className="font-semibold text-sm">@your_brand</p>
          <p className="text-xs text-white/80 line-clamp-2 mt-1">
            {script.hookText} 🔥 #fyp #viral
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Music2 className="h-3 w-3" />
            <span className="text-xs">Original Sound - Trending</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div 
            className="h-full bg-white transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 flex items-center justify-center gap-3">
        <Button variant="outline" size="icon" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button 
          size="icon" 
          onClick={togglePlay}
          className="bg-gradient-to-r from-[#3352CC] to-[#5577FF]"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </Button>
        <Button variant="outline" size="icon" onClick={() => setIsMuted(!isMuted)}>
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Time Display */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>{currentTime.toFixed(1)}s</span>
          <span>{totalDuration}s</span>
        </div>
        <Progress value={progress} className="h-1" />
      </div>
    </Card>
  )
}
