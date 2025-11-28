'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sparkles,
  ArrowRight,
  Check,
  X,
  Loader2,
  Image as ImageIcon,
  ChevronDown,
  Paperclip,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useQueryUser } from '@/hooks/user-queries'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ParsedAutomation {
  name: string
  triggers: string[]
  keywords: string[]
  listenerType: 'MESSAGE' | 'SMARTAI'
  prompt: string
  commentReply?: string
}

interface AIAutomationBuilderProps {
  onAutomationCreated?: (automation: ParsedAutomation) => void
  posts?: Array<{
    id: string
    caption?: string
    media_url: string
    media_type: string
  }>
}

const AI_MODES = ['Smart AI', 'Simple'] as const

const AIAutomationBuilder = ({
  onAutomationCreated,
  posts = [],
}: AIAutomationBuilderProps) => {
  const { data: userData } = useQueryUser()
  const isPro = userData?.data?.subscription?.plan === 'PRO'

  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ParsedAutomation | null>(null)
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [showPosts, setShowPosts] = useState(false)
  const [selectedMode, setSelectedMode] = useState<(typeof AI_MODES)[number]>(
    isPro ? 'Smart AI' : 'Simple'
  )
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [input])

  const parsePrompt = async (text: string): Promise<ParsedAutomation> => {
    const lower = text.toLowerCase()
    const keywordMatches = text.match(/['"]([^'"]+)['"]/g)
    const keywords = keywordMatches
      ? keywordMatches.map((k) => k.replace(/['"]/g, '').toUpperCase())
      : ['INFO']

    const triggers: string[] = []
    if (lower.includes('comment') || lower.includes('post')) triggers.push('COMMENT')
    if (lower.includes('dm') || lower.includes('message')) triggers.push('DM')
    if (triggers.length === 0) triggers.push('DM')

    const useAI = selectedMode === 'Smart AI' && isPro

    let response = 'Thanks for reaching out!'
    const sendMatch = text.match(/send (?:them )?["']?([^"']+)["']?/i)
    const replyMatch = text.match(/reply (?:with )?["']?([^"']+)["']?/i)
    if (sendMatch) response = sendMatch[1]
    else if (replyMatch) response = replyMatch[1]

    return {
      name: `${keywords[0]} Automation`,
      triggers,
      keywords,
      listenerType: useAI ? 'SMARTAI' : 'MESSAGE',
      prompt: useAI ? `Answer questions about: ${response}` : response,
      commentReply: triggers.includes('COMMENT') ? 'Check your DMs! 📩' : undefined,
    }
  }

  const handleSubmit = async () => {
    if (!input.trim() || isProcessing) return
    setIsProcessing(true)
    setResult(null)

    try {
      await new Promise((r) => setTimeout(r, 500))
      const parsed = await parsePrompt(input)
      setResult(parsed)
      if (parsed.triggers.includes('COMMENT') && posts.length > 0) {
        setShowPosts(true)
      }
    } catch {
      toast.error('Failed to parse')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirm = () => {
    if (result) onAutomationCreated?.(result)
  }

  const handleReset = () => {
    setInput('')
    setResult(null)
    setSelectedPosts([])
    setShowPosts(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col h-full p-6">
      {/* Result view */}
      {result ? (
        <div className="flex-1 space-y-4">
          <div className="rounded-xl bg-black/5 dark:bg-white/5 p-4">
            <p className="text-sm font-medium mb-3">{result.name}</p>
            <div className="space-y-1.5 text-xs text-black/50 dark:text-white/50">
              <p>Triggers: {result.triggers.join(', ')}</p>
              <p>Keywords: {result.keywords.join(', ')}</p>
              <p>Type: {result.listenerType === 'SMARTAI' ? 'Smart AI' : 'Message'}</p>
            </div>
          </div>

          {showPosts && posts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-black/50 dark:text-white/50 flex items-center gap-1.5">
                <ImageIcon className="h-3 w-3" /> Select posts
              </p>
              <div className="grid grid-cols-4 gap-2">
                {posts.slice(0, 8).map((post) => (
                  <button
                    key={post.id}
                    onClick={() =>
                      setSelectedPosts((prev) =>
                        prev.includes(post.id)
                          ? prev.filter((id) => id !== post.id)
                          : [...prev, post.id]
                      )
                    }
                    className={cn(
                      'aspect-square rounded-lg overflow-hidden border-2',
                      selectedPosts.includes(post.id)
                        ? 'border-black dark:border-white'
                        : 'border-transparent'
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.media_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={handleReset}
              className="flex-1 h-9 rounded-lg bg-black/5 dark:bg-white/5"
            >
              <X className="h-4 w-4 mr-1.5" /> Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 h-9 rounded-lg bg-black dark:bg-white text-white dark:text-black"
            >
              <Check className="h-4 w-4 mr-1.5" /> Create
            </Button>
          </div>
        </div>
      ) : (
        /* Input view */
        <div className="flex-1 flex flex-col">
          <p className="text-sm text-black/60 dark:text-white/60 mb-4">
            Describe what you want to automate
          </p>

          {/* Suggestions */}
          <div className="space-y-2 mb-6">
            {[
              "When someone comments 'INFO', DM them my link",
              'Auto-reply to DMs asking about pricing',
              "Giveaway: comment 'WIN' to enter",
            ].map((s, i) => (
              <button
                key={i}
                onClick={() => setInput(s)}
                className="w-full text-left px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-sm"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Input */}
          <div className="rounded-2xl bg-black/5 dark:bg-white/5 p-1.5 pt-3">
            <div className="mx-3 mb-2 flex items-center gap-1.5 text-xs text-black/50 dark:text-white/50">
              <Sparkles className="h-3 w-3" />
              <span>Describe your automation</span>
            </div>

            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What can I do for you?"
                className="w-full resize-none rounded-xl rounded-b-none border-none bg-black/5 dark:bg-white/5 px-4 py-3 placeholder:text-black/40 dark:placeholder:text-white/40 focus-visible:ring-0 min-h-[60px] text-sm"
              />

              <div className="flex h-12 items-center justify-between rounded-b-xl bg-black/5 dark:bg-white/5 px-3">
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1 h-7 px-2 rounded-md text-xs hover:bg-black/10 dark:hover:bg-white/10">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={selectedMode}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-1"
                          >
                            <span className="w-3.5 h-3.5 rounded bg-black dark:bg-white flex items-center justify-center">
                              <Sparkles className="h-2 w-2 text-white dark:text-black" />
                            </span>
                            {selectedMode}
                            <ChevronDown className="h-3 w-3 opacity-50" />
                          </motion.span>
                        </AnimatePresence>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="min-w-[8rem]">
                      {AI_MODES.map((mode) => (
                        <DropdownMenuItem
                          key={mode}
                          onSelect={() => setSelectedMode(mode)}
                          disabled={mode === 'Smart AI' && !isPro}
                        >
                          <span className="flex-1">{mode}</span>
                          {selectedMode === mode && <Check className="h-3.5 w-3.5" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="h-4 w-px bg-black/10 dark:bg-white/10" />

                  <button className="p-1.5 rounded-md text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10">
                    <Paperclip className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!input.trim() || isProcessing}
                  className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIAutomationBuilder