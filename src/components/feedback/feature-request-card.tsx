'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronUp, 
  ChevronDown, 
  MessageSquare, 
  Calendar,
  User,
  ExternalLink
} from 'lucide-react'
import { voteOnFeature } from '@/actions/feedback'
import { toast } from 'sonner'
import Link from 'next/link'
import VerifiedBadge from '@/components/global/verified-badge'

type FeatureCategory = 'AUTOMATION' | 'INTEGRATIONS' | 'UI_UX' | 'ANALYTICS' | 'MARKETPLACE' | 'MOBILE_APP' | 'API' | 'SECURITY' | 'PERFORMANCE' | 'OTHER'
type FeatureStatus = 'PENDING' | 'UNDER_REVIEW' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'
type VoteType = 'UPVOTE' | 'DOWNVOTE'

interface FeatureRequestCardProps {
  feature: {
    id: string
    title: string
    description: string
    category: FeatureCategory
    status: FeatureStatus
    upvotes: number
    downvotes: number
    score: number
    createdAt: Date | string
    User: {
      firstname: string | null
      lastname: string | null
      email: string
    }
    _count: {
      votes: number
      comments: number
    }
  }
  onVoteUpdate?: () => void
  userVote?: VoteType | null
}

const FeatureRequestCard = ({ feature, onVoteUpdate, userVote }: FeatureRequestCardProps) => {
  const [voting, setVoting] = useState(false)
  const [currentVote, setCurrentVote] = useState<VoteType | null>(userVote || null)
  const [upvotes, setUpvotes] = useState(feature.upvotes)
  const [downvotes, setDownvotes] = useState(feature.downvotes)

  const handleVote = async (voteType: VoteType) => {
    setVoting(true)
    try {
      const result = await voteOnFeature(feature.id, voteType)
      
      if (result.status === 200) {
        // Optimistic update
        if (currentVote === voteType) {
          // Remove vote
          setCurrentVote(null)
          if (voteType === 'UPVOTE') {
            setUpvotes(prev => prev - 1)
          } else {
            setDownvotes(prev => prev - 1)
          }
        } else {
          // Add or change vote
          if (currentVote === 'UPVOTE') {
            setUpvotes(prev => prev - 1)
          } else if (currentVote === 'DOWNVOTE') {
            setDownvotes(prev => prev - 1)
          }
          
          setCurrentVote(voteType)
          if (voteType === 'UPVOTE') {
            setUpvotes(prev => prev + 1)
          } else {
            setDownvotes(prev => prev + 1)
          }
        }
        
        onVoteUpdate?.()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to vote')
    } finally {
      setVoting(false)
    }
  }

  const getStatusColor = (status: FeatureStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-keyword-yellow/10 text-keyword-yellow border-keyword-yellow/20'
      case 'UNDER_REVIEW': return 'bg-light-blue/10 text-light-blue border-light-blue/20'
      case 'PLANNED': return 'bg-keyword-purple/10 text-keyword-purple border-keyword-purple/20'
      case 'IN_PROGRESS': return 'bg-keyword-green/10 text-keyword-green border-keyword-green/20'
      case 'COMPLETED': return 'bg-keyword-green/20 text-keyword-green border-keyword-green/30'
      case 'REJECTED': return 'bg-keyword-red/10 text-keyword-red border-keyword-red/20'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getCategoryIcon = (category: FeatureCategory) => {
    switch (category) {
      case 'AUTOMATION': return '🤖'
      case 'INTEGRATIONS': return '🔗'
      case 'UI_UX': return '🎨'
      case 'ANALYTICS': return '📊'
      case 'MARKETPLACE': return '🛒'
      case 'MOBILE_APP': return '📱'
      case 'API': return '⚡'
      case 'SECURITY': return '🔒'
      case 'PERFORMANCE': return '⚡'
      default: return '💡'
    }
  }

  const getUserDisplayName = () => {
    if (feature.User.firstname && feature.User.lastname) {
      return `${feature.User.firstname} ${feature.User.lastname}`
    }
    return feature.User.email.split('@')[0]
  }

  const score = upvotes - downvotes

  return (
    <Card className="border-in-active/50 bg-background-80 hover:bg-background-80/80 transition-colors">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Voting Section */}
          <div className="flex flex-col items-center gap-1 min-w-[60px]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('UPVOTE')}
              disabled={voting}
              className={`p-2 h-8 w-8 ${
                currentVote === 'UPVOTE' 
                  ? 'bg-keyword-green/20 text-keyword-green hover:bg-keyword-green/30' 
                  : 'text-text-secondary hover:text-keyword-green hover:bg-keyword-green/10'
              }`}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            
            <span className={`text-sm font-bold ${
              score > 0 ? 'text-keyword-green' : 
              score < 0 ? 'text-keyword-red' : 'text-text-secondary'
            }`}>
              {score}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('DOWNVOTE')}
              disabled={voting}
              className={`p-2 h-8 w-8 ${
                currentVote === 'DOWNVOTE' 
                  ? 'bg-keyword-red/20 text-keyword-red hover:bg-keyword-red/30' 
                  : 'text-text-secondary hover:text-keyword-red hover:bg-keyword-red/10'
              }`}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Content Section */}
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Link 
                  href={`/dashboard/feedback/${feature.id}`}
                  className="group"
                >
                  <h3 className="text-lg font-semibold text-white group-hover:text-light-blue transition-colors">
                    {feature.title}
                    <ExternalLink className="inline h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                </Link>
                <p className="text-text-secondary mt-1 line-clamp-2">
                  {feature.description}
                </p>
              </div>
              
              <Badge className={getStatusColor(feature.status)}>
                {feature.status.replace('_', ' ')}
              </Badge>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="border-in-active/50 text-text-secondary">
                {getCategoryIcon(feature.category)} {feature.category.replace('_', ' ')}
              </Badge>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-sm text-text-secondary">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{getUserDisplayName()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(feature.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <ChevronUp className="h-3 w-3 text-keyword-green" />
                  <span>{upvotes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ChevronDown className="h-3 w-3 text-keyword-red" />
                  <span>{downvotes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{feature._count.comments}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default FeatureRequestCard