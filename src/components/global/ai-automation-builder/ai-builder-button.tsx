'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
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
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button className="w-full relative overflow-hidden group bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500 rounded-xl h-11 shadow-lg shadow-purple-500/20">
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <Sparkles className="h-4 w-4 mr-2 relative z-10" />
            <span className="relative z-10 font-medium">Create with AI</span>
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-[85vh] p-0 bg-[#0a0a0a] border-white/10 rounded-2xl overflow-hidden">
        <AIAutomationBuilder 
          onAutomationCreated={handleAutomationCreated}
          posts={posts}
        />
      </DialogContent>
    </Dialog>
  )
}

export default AIBuilderButton