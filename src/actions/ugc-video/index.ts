'use server'

import { onCurrentUser } from '../user'
import { getSupabaseClient, uploadVideo } from '@/lib/supabase'
import { openai } from '@/lib/openai'
import { findUser } from '../user/queries'

// Types
export type VideoStyle = 'ugc_creator' | 'professional' | 'casual' | 'luxury'
export type CaptionStyle = 'bold_modern' | 'minimal' | 'colorful' | 'classic'
export type MusicStyle = 'energetic' | 'chill' | 'dramatic' | 'upbeat'
export type VideoStatus = 'pending' | 'generating_script' | 'generating_video' | 'completed' | 'failed'

export interface UGCVideoInput {
  productName: string
  productDescription?: string
  productBenefits?: string[]
  productPrice?: string
  targetAudience?: string
  brandVoice?: string
  templateId?: string
}

export interface GeneratedScript {
  hookText: string
  problemText: string
  revealText: string
  benefitsText: string[]
  demoText: string
  ctaText: string
  fullScript: string
  captions: CaptionSegment[]
}

export interface CaptionSegment {
  text: string
  startTime: number
  endTime: number
  style: 'hook' | 'normal' | 'emphasis' | 'cta'
}

// Get all templates
export async function getVideoTemplates(category?: string) {
  try {
    const supabase = getSupabaseClient()
    let query = supabase
      .from('ugc_video_templates')
      .select('*')
      .eq('is_active', true)
      .order('usage_count', { ascending: false })
    
    if (category) {
      query = query.eq('category', category)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching templates:', error)
      return { status: 500, data: [] }
    }
  
    return { status: 200, data }
  } catch (err) {
    console.error('Error in getVideoTemplates:', err)
    return { status: 500, data: [] }
  }
}


// Generate UGC video script using AI
export async function generateVideoScript(input: UGCVideoInput): Promise<{
  status: number
  data?: GeneratedScript
  error?: string
}> {
  const user = await onCurrentUser()
  
  try {
    const dbUser = await findUser(user.id)
    if (!dbUser) {
      return { status: 404, error: 'User not found' }
    }

    // Build the prompt for script generation
    const systemPrompt = `You are an expert UGC (User Generated Content) video scriptwriter specializing in viral TikTok and Instagram Reels content. 

Your scripts are:
- Highly addictive and scroll-stopping
- Fast-paced with dopamine hooks
- Authentic UGC creator style
- Optimized for 9:16 vertical format
- 15-25 seconds total length

Structure every script with:
1. HOOK (1-2s): Bold, unexpected statement that grabs attention instantly
2. PROBLEM (3-4s): Quick pain point with animated expressions
3. REVEAL (3s): Fast, aesthetic product reveal with excitement
4. BENEFITS (5-7s): Rapid-fire benefits with jump cut energy
5. DEMO (3-4s): Product in action with micro reactions
6. CTA (2-3s): High-energy call to action

Style guidelines:
- Use conversational, Gen-Z friendly language
- Include emoji suggestions for captions
- Add [PAUSE] markers for dramatic effect
- Add [EMPHASIS] for words to highlight visually
- Keep energy HIGH throughout`

    const userPrompt = `Create a viral UGC video script for:

PRODUCT: ${input.productName}
${input.productDescription ? `DESCRIPTION: ${input.productDescription}` : ''}
${input.productBenefits?.length ? `KEY BENEFITS: ${input.productBenefits.join(', ')}` : ''}
${input.productPrice ? `PRICE: ${input.productPrice}` : ''}
${input.targetAudience ? `TARGET AUDIENCE: ${input.targetAudience}` : ''}
${input.brandVoice ? `BRAND VOICE: ${input.brandVoice}` : 'BRAND VOICE: energetic, authentic, relatable'}

Generate the script in this exact JSON format:
{
  "hookText": "The hook line (1-2 seconds)",
  "problemText": "The problem/pain point (3-4 seconds)", 
  "revealText": "Product reveal moment (3 seconds)",
  "benefitsText": ["Benefit 1", "Benefit 2", "Benefit 3"],
  "demoText": "Demo narration (3-4 seconds)",
  "ctaText": "Call to action (2-3 seconds)",
  "fullScript": "Complete script with timing markers",
  "captions": [
    {"text": "caption text", "startTime": 0, "endTime": 1.5, "style": "hook"},
    ...more captions
  ]
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.9,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    })

    const responseText = completion.choices[0].message.content
    if (!responseText) {
      return { status: 500, error: 'No response from AI' }
    }

    const script = JSON.parse(responseText) as GeneratedScript

    return { status: 200, data: script }
  } catch (error: any) {
    console.error('Error generating script:', error)
    return { status: 500, error: error.message || 'Failed to generate script' }
  }
}

// Create a new video generation job
export async function createVideoJob(input: UGCVideoInput) {
  const user = await onCurrentUser()
  
  try {
    const dbUser = await findUser(user.id)
    if (!dbUser) {
      return { status: 404, error: 'User not found' }
    }

    // First generate the script
    const scriptResult = await generateVideoScript(input)
    if (scriptResult.status !== 200 || !scriptResult.data) {
      return { status: scriptResult.status, error: scriptResult.error }
    }

    const script = scriptResult.data
    const supabase = getSupabaseClient()

    // Create the job in database
    const { data: job, error } = await supabase
      .from('ugc_video_jobs')
      .insert({
        user_id: dbUser.id,
        product_name: input.productName,
        product_description: input.productDescription,
        product_benefits: input.productBenefits,
        product_price: input.productPrice,
        target_audience: input.targetAudience,
        brand_voice: input.brandVoice || 'energetic',
        hook_text: script.hookText,
        problem_text: script.problemText,
        reveal_text: script.revealText,
        benefits_text: script.benefitsText,
        demo_text: script.demoText,
        cta_text: script.ctaText,
        full_script: script.fullScript,
        status: 'generating_script'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating job:', error)
      return { status: 500, error: 'Failed to create video job' }
    }

    return { 
      status: 201, 
      data: {
        job,
        script
      }
    }
  } catch (error: any) {
    console.error('Error creating video job:', error)
    return { status: 500, error: error.message }
  }
}

// Get user's video jobs
export async function getUserVideoJobs() {
  const user = await onCurrentUser()
  
  try {
    const dbUser = await findUser(user.id)
    if (!dbUser) {
      return { status: 404, data: [] }
    }

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('ugc_video_jobs')
      .select('*')
      .eq('user_id', dbUser.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching jobs:', error)
      return { status: 500, data: [] }
    }

    return { status: 200, data }
  } catch (error) {
    console.error('Error:', error)
    return { status: 500, data: [] }
  }
}

// Get single video job
export async function getVideoJob(jobId: string) {
  const user = await onCurrentUser()
  
  try {
    const dbUser = await findUser(user.id)
    if (!dbUser) {
      return { status: 404, error: 'User not found' }
    }

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('ugc_video_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (error || !data) {
      return { status: 404, error: 'Job not found' }
    }

    return { status: 200, data }
  } catch (error) {
    console.error('Error:', error)
    return { status: 500, error: 'Failed to fetch job' }
  }
}

// Update job status
export async function updateJobStatus(
  jobId: string, 
  status: VideoStatus, 
  videoUrl?: string,
  thumbnailUrl?: string,
  errorMessage?: string
) {
  const updateData: any = { 
    status,
    updated_at: new Date().toISOString()
  }
  
  if (videoUrl) updateData.video_url = videoUrl
  if (thumbnailUrl) updateData.thumbnail_url = thumbnailUrl
  if (errorMessage) updateData.error_message = errorMessage
  if (status === 'completed') updateData.completed_at = new Date().toISOString()

  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('ugc_video_jobs')
    .update(updateData)
    .eq('id', jobId)

  if (error) {
    console.error('Error updating job:', error)
    return { status: 500, error: 'Failed to update job' }
  }

  return { status: 200 }
}

// Regenerate script for existing job
export async function regenerateScript(jobId: string) {
  const user = await onCurrentUser()
  
  try {
    const dbUser = await findUser(user.id)
    if (!dbUser) {
      return { status: 404, error: 'User not found' }
    }

    const supabase = getSupabaseClient()

    // Get existing job
    const { data: job, error: fetchError } = await supabase
      .from('ugc_video_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (fetchError || !job) {
      return { status: 404, error: 'Job not found' }
    }

    // Regenerate script
    const scriptResult = await generateVideoScript({
      productName: job.product_name,
      productDescription: job.product_description,
      productBenefits: job.product_benefits,
      productPrice: job.product_price,
      targetAudience: job.target_audience,
      brandVoice: job.brand_voice
    })

    if (scriptResult.status !== 200 || !scriptResult.data) {
      return { status: scriptResult.status, error: scriptResult.error }
    }

    const script = scriptResult.data

    // Update job with new script
    const { error: updateError } = await supabase
      .from('ugc_video_jobs')
      .update({
        hook_text: script.hookText,
        problem_text: script.problemText,
        reveal_text: script.revealText,
        benefits_text: script.benefitsText,
        demo_text: script.demoText,
        cta_text: script.ctaText,
        full_script: script.fullScript,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)

    if (updateError) {
      return { status: 500, error: 'Failed to update script' }
    }

    return { status: 200, data: script }
  } catch (error: any) {
    console.error('Error regenerating script:', error)
    return { status: 500, error: error.message }
  }
}

// ============================================================================
// VEO 3 VIDEO GENERATION (Google AI)
// ============================================================================

import { generateVideoWithVeo, checkVeoAvailability } from '@/lib/veo'

// Generate actual video using Google Veo 3
export async function generateVideo(jobId: string) {
  const user = await onCurrentUser()

  try {
    const dbUser = await findUser(user.id)
    if (!dbUser) {
      return { status: 404, error: 'User not found' }
    }

    const supabase = getSupabaseClient()

    // Get the job
    const { data: job, error: fetchError } = await supabase
      .from('ugc_video_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (fetchError || !job) {
      return { status: 404, error: 'Job not found' }
    }

    // Update status to generating
    await supabase
      .from('ugc_video_jobs')
      .update({ status: 'generating_video', updated_at: new Date().toISOString() })
      .eq('id', jobId)

    // Build the video prompt from the script
    const videoPrompt = `
UGC-style product video for "${job.product_name}":

SCENE 1 (0-2s) - HOOK:
A young creator looks directly at camera with excited expression and says: "${job.hook_text}"
Fast zoom in, energetic lighting.

SCENE 2 (2-6s) - PROBLEM:
Creator shows frustration/relatable expression: "${job.problem_text}"
Quick cuts, expressive gestures.

SCENE 3 (6-9s) - REVEAL:
Creator holds up/shows the product with excitement: "${job.reveal_text}"
Aesthetic product shot, good lighting.

SCENE 4 (9-16s) - BENEFITS:
Quick cuts showing product benefits:
${job.benefits_text?.map((b: string) => `- ${b}`).join('\n')}
Jump cuts, text overlays, energetic.

SCENE 5 (16-20s) - DEMO:
Creator demonstrates the product: "${job.demo_text}"
Close-up shots, reactions.

SCENE 6 (20-23s) - CTA:
Creator points at camera enthusiastically: "${job.cta_text}"
Bold text overlay, call to action.

Style: Authentic UGC creator, iPhone-quality, natural lighting, trendy captions, vertical 9:16 format.
`

    // Generate video with Veo 3
    const result = await generateVideoWithVeo(videoPrompt, {
      aspectRatio: '9:16',
    })

    if (!result.success || !result.videoUrl) {
      // Update job as failed
      await supabase
        .from('ugc_video_jobs')
        .update({
          status: 'failed',
          error_message: result.error || 'Video generation failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId)

      return { status: 500, error: result.error || 'Video generation failed' }
    }

    // Download the video and upload to Supabase Storage
    const videoResponse = await fetch(result.videoUrl)
    const videoBlob = await videoResponse.blob()
    
    const videoFileName = `${job.product_name.replace(/\s+/g, '-').toLowerCase()}-${jobId}.mp4`
    const uploadedVideoUrl = await uploadVideo(videoBlob, videoFileName)

    // Update job with video URL
    await supabase
      .from('ugc_video_jobs')
      .update({
        status: 'completed',
        video_url: uploadedVideoUrl,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    return {
      status: 200,
      data: {
        videoUrl: uploadedVideoUrl,
      },
    }
  } catch (error: any) {
    console.error('Error generating video:', error)

    // Update job as failed
    const supabase = getSupabaseClient()
    await supabase
      .from('ugc_video_jobs')
      .update({
        status: 'failed',
        error_message: error.message,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    return { status: 500, error: error.message }
  }
}

// Check if Veo 3 is available
export async function checkVideoGenerationAvailable() {
  try {
    const available = await checkVeoAvailability()
    return { status: 200, available }
  } catch (error) {
    return { status: 200, available: false }
  }
}

// Create job AND generate video in one go
export async function createAndGenerateVideo(input: UGCVideoInput) {
  // First create the job with script
  const jobResult = await createVideoJob(input)
  
  if (jobResult.status !== 201 || !jobResult.data?.job) {
    return jobResult
  }

  // Then generate the video
  const videoResult = await generateVideo(jobResult.data.job.id)
  
  if (videoResult.status !== 200) {
    return {
      status: jobResult.status,
      data: {
        ...jobResult.data,
        videoError: videoResult.error,
      },
    }
  }

  return {
    status: 200,
    data: {
      ...jobResult.data,
      videoUrl: videoResult.data?.videoUrl,
    },
  }
}
