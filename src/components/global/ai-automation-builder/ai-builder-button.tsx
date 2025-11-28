'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Sparkles } from 'lucide-react'
import AIAutomationBuilder from './index'
import { createAIAutomation } from '@/actions/automations/ai-builder'
import { getProfilePosts } from '@/actions/automations'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface AIBuilderButtonProps {
  slug: string
}

const AIBuilderButton = ({ slug }: AIBuilderButtonProps) => {
  const [open, setOpen] = useState(false)
  const [posts, setPosts] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const loadPosts = async () => {
      const result = await getProfilePosts()
      if (result.status === 200 && result.data?.data) {
        setPosts(result.data.data)
      }
    }
    if (open) loadPosts()
  }, [open])

  const handleAutomationCreated = async (automation: any) => {
    try {
      const result = await createAIAutomation({
        ...automation,
        posts: automation.selectedPosts?.map((post: any) => ({
          postid: post.id,
          caption: post.caption,
          media: post.media_url,
          mediaType: post.media_type?.toUpperCase() || 'IMAGE',
        })),
      })

      if (result.status === 200) {
        toast.success('Automation created!')
        setOpen(false)
        router.push(`/dashboard/${slug}/automations/${result.data?.id}`)
        router.refresh()
      } else {
        toast.error(result.message || 'Failed to create automation')
      }
    } catch {
      toast.error('Something went wrong')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          Create with AI
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 bg-background border-border/50 rounded-2xl overflow-hidden">
        <AIAutomationBuilder onAutomationCreated={handleAutomationCreated} posts={posts} />
      </DialogContent>
    </Dialog>
  )
}

export default AIBuilderButton