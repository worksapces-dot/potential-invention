'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
    if (open) {
      loadPosts()
    }
  }, [open])

  const handleAutomationCreated = async (automation: any) => {
    try {
      const result = await createAIAutomation({
        ...automation,
        posts: automation.selectedPosts?.map((post: any) => ({
          postid: post.id,
          caption: post.caption,
          media: post.media_url,
          mediaType: post.media_type?.toUpperCase() || 'IMAGE'
        }))
      })

      if (result.status === 200) {
        toast.success('Automation created successfully!')
        setOpen(false)
        router.push(`/dashboard/${slug}/automations/${result.data?.id}`)
        router.refresh()
      } else {
        toast.error(result.message || 'Failed to create automation')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-to-r from-[#3352CC] to-[#5577FF] hover:from-[#2A42B8] hover:to-[#4466EE] rounded-xl">
          <Sparkles className="h-4 w-4 mr-2" />
          Create with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-[80vh] p-0 bg-[#0e0e0e] border-[#545454]">
        <AIAutomationBuilder 
          onAutomationCreated={handleAutomationCreated}
          posts={posts}
        />
      </DialogContent>
    </Dialog>
  )
}

export default AIBuilderButton