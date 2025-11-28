'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { 
  createVideoJob, 
  generateVideoScript, 
  getVideoTemplates, 
  getUserVideoJobs,
  regenerateScript,
  UGCVideoInput,
  GeneratedScript
} from '@/actions/ugc-video'
import { toast } from 'sonner'

export function useCreateVideo() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (input: UGCVideoInput) => createVideoJob(input),
    onSuccess: (result) => {
      if (result.status === 201) {
        toast.success('Video script generated!')
        queryClient.invalidateQueries({ queryKey: ['ugc-video-jobs'] })
      } else {
        toast.error(result.error || 'Failed to create video')
      }
    },
    onError: () => {
      toast.error('Something went wrong')
    }
  })
}

export function useGenerateScript() {
  return useMutation({
    mutationFn: (input: UGCVideoInput) => generateVideoScript(input),
    onSuccess: (result) => {
      if (result.status !== 200) {
        toast.error(result.error || 'Failed to generate script')
      }
    },
    onError: () => {
      toast.error('Something went wrong')
    }
  })
}

export function useRegenerateScript() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (jobId: string) => regenerateScript(jobId),
    onSuccess: (result) => {
      if (result.status === 200) {
        toast.success('Script regenerated!')
        queryClient.invalidateQueries({ queryKey: ['ugc-video-jobs'] })
      } else {
        toast.error(result.error || 'Failed to regenerate')
      }
    },
    onError: () => {
      toast.error('Something went wrong')
    }
  })
}

export function useVideoTemplates(category?: string) {
  return useQuery({
    queryKey: ['ugc-video-templates', category],
    queryFn: () => getVideoTemplates(category),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useVideoJobs() {
  return useQuery({
    queryKey: ['ugc-video-jobs'],
    queryFn: getUserVideoJobs,
    refetchInterval: 10000, // Refetch every 10s to check for status updates
  })
}

// Hook for managing the video generation flow
export function useVideoGenerator() {
  const [currentJob, setCurrentJob] = useState<any>(null)
  const [currentScript, setCurrentScript] = useState<GeneratedScript | null>(null)
  
  const createMutation = useCreateVideo()
  const regenerateMutation = useRegenerateScript()
  
  const createVideo = async (input: UGCVideoInput) => {
    const result = await createMutation.mutateAsync(input)
    if (result.status === 201 && result.data) {
      setCurrentJob(result.data.job)
      setCurrentScript(result.data.script)
      return result.data
    }
    return null
  }
  
  const regenerate = async () => {
    if (!currentJob?.id) return null
    
    const result = await regenerateMutation.mutateAsync(currentJob.id)
    if (result.status === 200 && result.data) {
      setCurrentScript(result.data)
      return result.data
    }
    return null
  }
  
  const selectJob = (job: any) => {
    setCurrentJob(job)
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
  
  const reset = () => {
    setCurrentJob(null)
    setCurrentScript(null)
  }
  
  return {
    currentJob,
    currentScript,
    isCreating: createMutation.isPending,
    isRegenerating: regenerateMutation.isPending,
    createVideo,
    regenerate,
    selectJob,
    reset
  }
}
