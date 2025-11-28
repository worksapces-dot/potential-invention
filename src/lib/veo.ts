'use server'

import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY })

export interface VeoVideoRequest {
  prompt: string
  duration?: number // 5-8 seconds for Veo
  aspectRatio?: '16:9' | '9:16' | '1:1'
}

export interface VeoVideoResponse {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  videoUrl?: string
  error?: string
}

// Generate video using Google Veo 3
export async function generateVideoWithVeo(
  prompt: string,
  options: {
    duration?: number
    aspectRatio?: '16:9' | '9:16' | '1:1'
  } = {}
): Promise<{ success: boolean; videoUrl?: string; error?: string }> {
  try {
    const { aspectRatio = '9:16' } = options

    // Build the video generation prompt for UGC style
    const videoPrompt = `Create a vertical UGC-style product video for TikTok/Instagram Reels:

${prompt}

Style: Authentic UGC creator filming themselves, iPhone-quality, natural lighting, energetic and engaging, trendy social media aesthetic.`

    // Use Veo 3 model for video generation
    const response = await ai.models.generateVideos({
      model: 'veo-3',
      prompt: videoPrompt,
      config: {
        aspectRatio: aspectRatio,
        numberOfVideos: 1,
      },
    })

    // Poll for completion
    let operation = response
    while (!operation.done) {
      await new Promise((resolve) => setTimeout(resolve, 5000))
      operation = await ai.operations.getVideosOperation({
        operation: operation,
      })
    }

    if (operation.response?.generatedVideos?.[0]?.video?.uri) {
      return {
        success: true,
        videoUrl: operation.response.generatedVideos[0].video.uri,
      }
    }

    return {
      success: false,
      error: 'No video generated',
    }
  } catch (error: any) {
    console.error('Veo generation error:', error)
    return {
      success: false,
      error: error.message || 'Video generation failed',
    }
  }
}

// Check if Veo is available
export async function checkVeoAvailability(): Promise<boolean> {
  try {
    // Simple check if the API key is configured
    return !!process.env.GOOGLE_AI_API_KEY
  } catch {
    return false
  }
}
