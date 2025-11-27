'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import AIAutomationBuilder from './index'
import { createAIAutomation } from '@/actions/automations/ai-builder'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface AIBuilderModalProps {
  trigger?: React.ReactNode
  posts?: Array<{
    id: string
    caption?: string
    media_url: string
    media_type: string
  }>
  slug: string
}

const AIBuilderModal = ({ trigger, posts = [], slug }: AIBuilderModalProps) => {
  const [open, setOpen] = useState(false)
  const router = useRouter()

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
        {trigger || (
          <Button className="bg-gradient-to-r from-[#3352CC] to-[#5577FF] hover:from-[#2A42B8] hover:to-[#4466EE] rounded-full">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Builder
          </Button>
        )}
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

export default AIBuilderModal