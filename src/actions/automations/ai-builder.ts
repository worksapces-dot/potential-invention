'use server'

import { onCurrentUser } from '../user'
import { 
  addTrigger, 
  addKeyWord, 
  addListener,
  addPost,
  updateAutomation
} from './queries'
import { client } from '@/lib/prisma'
import { v4 as uuid } from 'uuid'

interface AIAutomationData {
  name: string
  triggers: string[]
  keywords: string[]
  listenerType: 'MESSAGE' | 'SMARTAI'
  prompt: string
  commentReply?: string
  posts?: Array<{
    postid: string
    caption?: string
    media: string
    mediaType: 'IMAGE' | 'VIDEO' | 'CAROSEL_ALBUM'
  }>
}

export const createAIAutomation = async (data: AIAutomationData) => {
  const user = await onCurrentUser()
  
  try {
    // 1. Create the automation directly
    const automationId = uuid()
    
    // Find user by clerkId first
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id }
    })
    
    if (!dbUser) {
      return { status: 404, message: 'User not found' }
    }

    // Create automation
    const createdAutomation = await client.automation.create({
      data: {
        id: automationId,
        name: data.name,
        userId: dbUser.id
      }
    })
    
    if (!createdAutomation) {
      return { status: 500, message: 'Failed to create automation' }
    }

    // 2. Add triggers
    if (data.triggers.length > 0) {
      await addTrigger(automationId, data.triggers)
    }

    // 3. Add keywords
    for (const keyword of data.keywords) {
      await addKeyWord(automationId, keyword)
    }

    // 4. Add listener
    await addListener(
      automationId,
      data.listenerType,
      data.prompt,
      data.commentReply
    )

    // 5. Add posts if provided
    if (data.posts && data.posts.length > 0) {
      await addPost(automationId, data.posts)
    }

    return { 
      status: 200, 
      message: 'Automation created successfully',
      data: {
        id: automationId,
        name: data.name
      }
    }
  } catch (error) {
    console.error('Error creating AI automation:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

// Parse natural language to automation config using AI
export const parseAutomationPrompt = async (prompt: string, isPro: boolean) => {
  try {
    // In production, this would call OpenAI/Claude API
    // For now, we'll use pattern matching
    
    const lowerPrompt = prompt.toLowerCase()
    
    // Extract keywords from quotes
    const keywordMatches = prompt.match(/['"]([^'"]+)['"]/g)
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
      triggers.push('DM')
    }

    // Determine listener type (Smart AI only for Pro users)
    const useSmartAI = isPro && (
      lowerPrompt.includes('ai') || 
      lowerPrompt.includes('smart') || 
      lowerPrompt.includes('intelligent') ||
      lowerPrompt.includes('answer') ||
      lowerPrompt.includes('respond naturally') ||
      lowerPrompt.includes('understand')
    )

    // Extract the response message
    let responseMessage = ''
    const patterns = [
      /send (?:them |him |her )?(?:the |a |an )?["']?([^"']+)["']?/i,
      /reply (?:with )?["']?([^"']+)["']?/i,
      /dm (?:them )?["']?([^"']+)["']?/i,
      /respond (?:with )?["']?([^"']+)["']?/i,
      /message (?:them )?["']?([^"']+)["']?/i,
    ]
    
    for (const pattern of patterns) {
      const match = prompt.match(pattern)
      if (match) {
        responseMessage = match[1]
        break
      }
    }
    
    if (!responseMessage) {
      responseMessage = 'Thanks for reaching out! I\'ll get back to you soon.'
    }

    // Generate automation name
    const name = `AI: ${keywords[0]} ${triggers.includes('COMMENT') ? 'Comment' : 'DM'} Automation`

    return {
      status: 200,
      data: {
        name,
        triggers,
        keywords,
        listenerType: useSmartAI ? 'SMARTAI' : 'MESSAGE',
        prompt: useSmartAI 
          ? `You are a helpful assistant for an Instagram account. ${responseMessage}. Be friendly, professional, and helpful.`
          : responseMessage,
        commentReply: triggers.includes('COMMENT') 
          ? `Thanks for your interest! Check your DMs 📩`
          : undefined
      } as AIAutomationData
    }
  } catch (error) {
    console.error('Error parsing automation prompt:', error)
    return { status: 500, message: 'Failed to parse automation' }
  }
}