'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Send, 
  Sparkles, 
  Zap, 
  Image as ImageIcon,
  Check,
  X,
  Loader2,
  Crown,
  ArrowUp,
  Paperclip,
  RotateCcw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  ChevronDown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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

const examplePrompts = [
  { icon: '💬', text: "Auto-reply to DMs with 'price'" },
  { icon: '🎁', text: "Giveaway: comment 'WIN' to enter" },
  { icon: '📦', text: "Send product info when asked" },
  { icon: '🤖', text: "AI answers about my services" },
]

const AIAutomationBuilder = ({ onAutomationCreated, posts = [] }: AIAutomationBuilderProps) => {
  const { data: userData } = useQueryUser()
  const isPro = userData?.data?.subscription?.plan === 'PRO'
  
  const [prompt, setPrompt] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedAutomation, setParsedAutomation] = useState<ParsedAutomation | null>(null)
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [showPostSelector, setShowPostSelector] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string, automation?: ParsedAutomation }>>([])
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingText])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [prompt])

  const parseUserPrompt = async (userPrompt: string): Promise<ParsedAutomation> => {
    const lowerPrompt = userPrompt.toLowerCase()
    
    const keywordMatches = userPrompt.match(/['"]([^'"]+)['"]/g)
    const keywords = keywordMatches 
      ? keywordMatches.map(k => k.replace(/['"]/g, '').toUpperCase())
      : ['INFO']

    const triggers: string[] = []
    if (lowerPrompt.includes('comment') || lowerPrompt.includes('post')) {
      triggers.push('COMMENT')
    }
    if (lowerPrompt.includes('dm') || lowerPrompt.includes('message') || lowerPrompt.includes('direct')) {
      triggers.push('DM')
    }
    if (triggers.length === 0) {
      triggers.push('DM')
    }

    const useSmartAI = isPro && (
      lowerPrompt.includes('ai') || 
      lowerPrompt.includes('smart') || 
      lowerPrompt.includes('intelligent') ||
      lowerPrompt.includes('answer') ||
      lowerPrompt.includes('respond naturally')
    )

    let responseMessage = ''
    const sendMatch = userPrompt.match(/send (?:them |him |her )?(?:the |a |an )?["']?([^"']+)["']?/i)
    const replyMatch = userPrompt.match(/reply (?:with )?["']?([^"']+)["']?/i)
    const dmMatch = userPrompt.match(/dm (?:them )?["']?([^"']+)["']?/i)
    
    if (sendMatch) responseMessage = sendMatch[1]
    else if (replyMatch) responseMessage = replyMatch[1]
    else if (dmMatch) responseMessage = dmMatch[1]
    else responseMessage = 'Thanks for reaching out!'

    const name = `AI: ${keywords[0]} Automation`

    return {
      name,
      triggers,
      keywords,
      listenerType: useSmartAI ? 'SMARTAI' : 'MESSAGE',
      prompt: useSmartAI 
        ? `You are a helpful assistant. ${responseMessage}. Be friendly and professional.`
        : responseMessage,
      commentReply: triggers.includes('COMMENT') 
        ? `Thanks! Check your DMs 📩`
        : undefined
    }
  }

  const simulateStreaming = async (text: string) => {
    setIsStreaming(true)
    setStreamingText('')
    
    const words = text.split(' ')
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 30))
      setStreamingText(prev => prev + (i === 0 ? '' : ' ') + words[i])
    }
    
    setIsStreaming(false)
    return text
  }

  const handleSubmit = async () => {
    if (!prompt.trim() || isProcessing) return

    const userMessage = prompt.trim()
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setPrompt('')
    setIsProcessing(true)
    setParsedAutomation(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const parsed = await parseUserPrompt(userMessage)
      
      const responseText = `I've created an automation for you:\n\n` +
        `**${parsed.name}**\n\n` +
        `• Triggers: ${parsed.triggers.join(' & ')}\n` +
        `• Keywords: ${parsed.keywords.map(k => `"${k}"`).join(', ')}\n` +
        `• Type: ${parsed.listenerType === 'SMARTAI' ? '🤖 Smart AI' : '💬 Message'}\n` +
        `• Response: "${parsed.prompt.substring(0, 80)}..."` +
        (parsed.commentReply ? `\n• Comment: "${parsed.commentReply}"` : '')

      await simulateStreaming(responseText)
      
      setParsedAutomation(parsed)
      setMessages(prev => [...prev, { role: 'assistant', content: responseText, automation: parsed }])
      setStreamingText('')
      
      if (parsed.triggers.includes('COMMENT') && posts.length > 0) {
        setShowPostSelector(true)
      }
    } catch (error) {
      toast.error('Failed to parse. Try again.')
      setStreamingText('')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirm = () => {
    if (parsedAutomation) {
      onAutomationCreated?.(parsedAutomation)
      toast.success('Automation created!')
      handleReset()
    }
  }

  const handleReset = () => {
    setParsedAutomation(null)
    setMessages([])
    setSelectedPosts([])
    setShowPostSelector(false)
    setStreamingText('')
  }

  const togglePostSelection = (postId: string) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
  }

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied!')
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0a0a]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Slide AI</h2>
            <p className="text-xs text-white/40">Automation Builder</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isPro && (
            <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs">
              <Crown className="h-3 w-3 mr-1" />
              Pro
            </Badge>
          )}
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-white/40 hover:text-white hover:bg-white/5 h-8 px-2"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              New
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isProcessing && !streamingText && (
          <div className="flex flex-col items-center justify-center h-full px-6 py-12">
            <div className="relative mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <motion.div
                className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 opacity-20 blur-xl"
                animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>

            <h1 className="text-2xl font-semibold text-white mb-2">How can I help?</h1>
            <p className="text-white/40 text-center mb-8 max-w-md">
              Describe your automation in plain English.
            </p>
            
            <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
              {examplePrompts.map((example, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setPrompt(example.text)}
                  className="group p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all text-left"
                >
                  <span className="text-2xl mb-2 block">{example.icon}</span>
                  <span className="text-sm text-white/60 group-hover:text-white/80">
                    {example.text}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        <div className="px-6 py-4 space-y-6">
          <AnimatePresence>
            {messages.map((message, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group"
              >
                {message.role === 'user' ? (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl rounded-tr-md px-4 py-3 shadow-lg">
                      <p className="text-sm text-white">{message.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="bg-white/[0.03] border border-white/5 rounded-2xl rounded-tl-md px-4 py-3">
                        <p className="text-sm text-white/80 whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => copyText(message.content)} className="h-7 px-2 text-white/30 hover:text-white hover:bg-white/5">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {(isProcessing || streamingText) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl rounded-tl-md px-4 py-3">
                  {streamingText ? (
                    <p className="text-sm text-white/80 whitespace-pre-wrap">
                      {streamingText}
                      <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="inline-block w-2 h-4 bg-purple-400 ml-0.5 rounded-sm" />
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div key={i} className="w-2 h-2 rounded-full bg-purple-400" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                      ))}
                      <span className="text-sm text-white/40">Thinking...</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {showPostSelector && posts.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="ml-11">
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium text-white">Select posts</span>
                </div>
                <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                  {posts.map((post) => (
                    <button key={post.id} onClick={() => togglePostSelection(post.id)} className={cn("relative aspect-square rounded-lg overflow-hidden border-2 transition-all", selectedPosts.includes(post.id) ? 'border-purple-500' : 'border-transparent hover:border-white/20')}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={post.media_url} alt="" className="w-full h-full object-cover" />
                      {selectedPosts.includes(post.id) && (
                        <div className="absolute inset-0 bg-purple-500/40 flex items-center justify-center">
                          <Check className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {parsedAutomation && !isProcessing && !isStreaming && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-3 pt-4">
              <Button onClick={handleReset} variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white">
                <X className="h-4 w-4 mr-2" />
                Start Over
              </Button>
              <Button onClick={handleConfirm} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-purple-500/20">
                <Check className="h-4 w-4 mr-2" />
                Create Automation
              </Button>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className={cn("flex items-end gap-2 p-2 rounded-2xl border transition-all", "bg-white/[0.03] border-white/10", "focus-within:border-purple-500/50 focus-within:bg-white/[0.05]")}>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-white/30 hover:text-white hover:bg-white/5 rounded-xl flex-shrink-0">
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your automation..."
              className="flex-1 bg-transparent border-0 resize-none focus:ring-0 focus-visible:ring-0 text-white placeholder:text-white/30 min-h-[36px] max-h-[200px] py-2 px-1 text-sm"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="ghost" size="sm" className="h-8 px-3 text-white/40 hover:text-white hover:bg-white/5 rounded-xl text-xs gap-1">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">AI</span>
                </div>
                Slide AI
                <ChevronDown className="h-3 w-3" />
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={!prompt.trim() || isProcessing}
                size="icon"
                className={cn("h-9 w-9 rounded-xl transition-all", prompt.trim() && !isProcessing ? "bg-white text-black hover:bg-white/90" : "bg-white/10 text-white/30 cursor-not-allowed")}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <p className="text-[10px] text-white/20 text-center mt-2">
            Slide AI can make mistakes. Review before activating.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AIAutomationBuilder