'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Send, 
  Sparkles, 
  Bot, 
  Zap, 
  MessageSquare,
  Image as ImageIcon,
  Check,
  X,
  Loader2,
  Crown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AITextLoading from '../ai-text-loading'
import { useQueryUser } from '@/hooks/user-queries'
import { toast } from 'sonner'

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
  "When someone comments 'INFO' on my posts, DM them the product details",
  "Auto-reply to DMs containing 'price' with my pricing info",
  "Create a giveaway automation - when users comment 'WIN', send them entry confirmation",
  "When someone DMs 'help', use AI to answer their questions about my services",
]

const AIAutomationBuilder = ({ onAutomationCreated, posts = [] }: AIAutomationBuilderProps) => {
  const { data: userData } = useQueryUser()
  const isPro = userData?.data?.subscription?.plan === 'PRO'
  
  const [prompt, setPrompt] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedAutomation, setParsedAutomation] = useState<ParsedAutomation | null>(null)
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [showPostSelector, setShowPostSelector] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai', content: string }>>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const parseUserPrompt = async (userPrompt: string): Promise<ParsedAutomation> => {
    // Simulate AI processing - in production, this would call OpenAI/Claude API
    await new Promise(resolve => setTimeout(resolve, 2000))

    const lowerPrompt = userPrompt.toLowerCase()
    
    // Extract keywords from quotes
    const keywordMatches = userPrompt.match(/['"]([^'"]+)['"]/g)
    const keywords = keywordMatches 
      ? keywordMatches.map(k => k.replace(/['"]/g, '').toUpperCase())
      : ['INFO']

    // Determine triggers
    const triggers: string[] = []
    if (lowerPrompt.includes('comment') || lowerPrompt.includes('post')) {
      triggers.push('COMMENT')
    }
    if (lowerPrompt.includes('dm') || lowerPrompt.includes('message') || lowerPrompt.includes('direct')) {
      triggers.push('DM')
    }
    if (triggers.length === 0) {
      triggers.push('DM') // Default to DM
    }

    // Determine listener type
    const useSmartAI = isPro && (
      lowerPrompt.includes('ai') || 
      lowerPrompt.includes('smart') || 
      lowerPrompt.includes('intelligent') ||
      lowerPrompt.includes('answer') ||
      lowerPrompt.includes('respond naturally')
    )

    // Extract the response message
    let responseMessage = ''
    const sendMatch = userPrompt.match(/send (?:them |him |her )?(?:the |a |an )?["']?([^"']+)["']?/i)
    const replyMatch = userPrompt.match(/reply (?:with )?["']?([^"']+)["']?/i)
    const dmMatch = userPrompt.match(/dm (?:them )?["']?([^"']+)["']?/i)
    
    if (sendMatch) responseMessage = sendMatch[1]
    else if (replyMatch) responseMessage = replyMatch[1]
    else if (dmMatch) responseMessage = dmMatch[1]
    else responseMessage = 'Thanks for reaching out! I\'ll get back to you soon.'

    // Generate automation name
    const name = `AI Generated: ${keywords[0]} Automation`

    return {
      name,
      triggers,
      keywords,
      listenerType: useSmartAI ? 'SMARTAI' : 'MESSAGE',
      prompt: useSmartAI 
        ? `You are a helpful assistant. Respond to messages about: ${responseMessage}. Be friendly and professional.`
        : responseMessage,
      commentReply: triggers.includes('COMMENT') 
        ? `Thanks for your interest! Check your DMs 📩`
        : undefined
    }
  }

  const handleSubmit = async () => {
    if (!prompt.trim()) return

    setMessages(prev => [...prev, { role: 'user', content: prompt }])
    setIsProcessing(true)
    setParsedAutomation(null)

    try {
      const parsed = await parseUserPrompt(prompt)
      setParsedAutomation(parsed)
      
      // Check if we need to show post selector
      if (parsed.triggers.includes('COMMENT') && posts.length > 0) {
        setShowPostSelector(true)
      }

      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: `I've created an automation for you! Here's what I understood:\n\n` +
          `📝 **Name:** ${parsed.name}\n` +
          `⚡ **Triggers:** ${parsed.triggers.join(', ')}\n` +
          `🔑 **Keywords:** ${parsed.keywords.join(', ')}\n` +
          `🤖 **Response Type:** ${parsed.listenerType === 'SMARTAI' ? 'Smart AI (Pro)' : 'Fixed Message'}\n` +
          `💬 **Response:** ${parsed.prompt}\n` +
          (parsed.commentReply ? `📝 **Comment Reply:** ${parsed.commentReply}` : '')
      }])
    } catch (error) {
      toast.error('Failed to parse automation. Please try again.')
    } finally {
      setIsProcessing(false)
      setPrompt('')
    }
  }

  const handleConfirm = () => {
    if (parsedAutomation) {
      onAutomationCreated?.(parsedAutomation)
      toast.success('Automation created successfully!')
      setParsedAutomation(null)
      setMessages([])
      setSelectedPosts([])
      setShowPostSelector(false)
    }
  }

  const handleCancel = () => {
    setParsedAutomation(null)
    setMessages([])
    setSelectedPosts([])
    setShowPostSelector(false)
  }

  const togglePostSelection = (postId: string) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#545454]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3352CC] to-[#5577FF] flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">AI Automation Builder</h2>
          <p className="text-sm text-text-secondary">Describe what you want, I'll create it</p>
        </div>
        {isPro && (
          <Badge className="ml-auto bg-gradient-to-r from-[#3352CC] to-[#5577FF] text-white">
            <Crown className="h-3 w-3 mr-1" />
            Smart AI Enabled
          </Badge>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isProcessing && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3352CC]/20 to-[#5577FF]/20 flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-[#3352CC]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">What can I do for you?</h3>
            <p className="text-text-secondary mb-6 max-w-md">
              Describe your automation in plain English. I'll understand and create it for you.
            </p>
            
            {/* Example Prompts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
              {examplePrompts.map((example, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(example)}
                  className="p-3 rounded-xl border border-[#545454] bg-[#1D1D1D] hover:bg-[#252525] hover:border-[#3352CC]/50 transition-all text-left text-sm text-text-secondary hover:text-white"
                >
                  <Zap className="h-4 w-4 text-[#3352CC] mb-2" />
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <AnimatePresence>
          {messages.map((message, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                message.role === 'user' 
                  ? 'bg-[#3352CC] text-white' 
                  : 'bg-[#1D1D1D] border border-[#545454] text-white'
              }`}>
                {message.role === 'ai' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#3352CC] to-[#5577FF] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                    <span className="text-sm text-[#3352CC]">Slide AI</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading State */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8"
          >
            <AITextLoading />
          </motion.div>
        )}

        {/* Post Selector */}
        {showPostSelector && posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1D1D1D] border border-[#545454] rounded-2xl p-4"
          >
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-[#3352CC]" />
              Select posts for this automation
            </h4>
            <div className="grid grid-cols-3 gap-3 max-h-48 overflow-y-auto">
              {posts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => togglePostSelection(post.id)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedPosts.includes(post.id) 
                      ? 'border-[#3352CC]' 
                      : 'border-transparent hover:border-[#545454]'
                  }`}
                >
                  <img 
                    src={post.media_url} 
                    alt={post.caption || 'Post'} 
                    className="w-full h-full object-cover"
                  />
                  {selectedPosts.includes(post.id) && (
                    <div className="absolute inset-0 bg-[#3352CC]/50 flex items-center justify-center">
                      <Check className="h-6 w-6 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Confirmation Buttons */}
        {parsedAutomation && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 pt-4"
          >
            <Button
              onClick={handleCancel}
              variant="outline"
              className="border-[#545454] hover:bg-[#252525]"
            >
              <X className="h-4 w-4 mr-2" />
              Start Over
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-gradient-to-r from-[#3352CC] to-[#5577FF] hover:from-[#2A42B8] hover:to-[#4466EE]"
            >
              <Check className="h-4 w-4 mr-2" />
              Create Automation
            </Button>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[#545454]">
        <div className="relative">
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#1D1D1D] border border-[#545454] focus-within:border-[#3352CC] transition-colors">
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-[#252525]">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-[#3352CC] to-[#5577FF] flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">AI</span>
              </div>
              <span className="text-xs text-text-secondary">Slide AI</span>
            </div>
            
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your automation... e.g., 'When someone comments INFO, DM them my product details'"
              className="flex-1 bg-transparent border-0 resize-none focus:ring-0 text-white placeholder:text-text-secondary min-h-[40px] max-h-[120px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
            
            <Button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isProcessing}
              size="icon"
              className="bg-gradient-to-r from-[#3352CC] to-[#5577FF] hover:from-[#2A42B8] hover:to-[#4466EE] rounded-xl h-10 w-10"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {!isPro && (
            <p className="text-xs text-text-secondary mt-2 text-center">
              <Crown className="h-3 w-3 inline mr-1 text-[#3352CC]" />
              Upgrade to Pro for Smart AI responses that understand context
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AIAutomationBuilder