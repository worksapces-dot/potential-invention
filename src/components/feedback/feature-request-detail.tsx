'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  ChevronUp, 
  ChevronDown, 
  MessageSquare, 
  Calendar,
  User,
  ArrowLeft,
  Send,
  Reply
} from 'lucide-react'
import { FeatureCategory, FeatureStatus, VoteType } from '@prisma/client'
import { getFeatureRequest, voteOnFeature, addFeatureComment } from '@/actions/feedback'
import { toast } from 'sonner'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface FeatureRequestDetailProps {
  featureId: string
}

interface FeatureComment {
  id: string
  content: string
  createdAt: string
  User: {
    firstname: string | null
    lastname: string | null
    email: string
  }
  replies?: FeatureComment[]
}

interface FeatureRequestData {
  id: string
  title: string
  description: string
  category: FeatureCategory
  status: FeatureStatus
  upvotes: number
  downvotes: number
  score: number
  createdAt: string
  adminResponse?: string
  respondedAt?: string
  User: {
    firstname: string | null
    lastname: string | null
    email: string
  }
  comments: FeatureComment[]
  _count: {
    votes: number
    comments: number
  }
  userVote?: VoteType | null
}

const FeatureRequestDetail = ({ featureId }: FeatureRequestDetailProps) => {
  const params = useParams()
  const [feature, setFeature] = useState<FeatureRequestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [commenting, setCommenting] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  useEffect(() => {
    loadFeature()
  }, [featureId])

  const loadFeature = async () => {
    try {
      setLoading(true)
      const result = await getFeatureRequest(featureId)
      
      if (result.status === 200 && result.data) {
        setFeature(result.data as any)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to load feature request')
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (voteType: VoteType) => {
    if (!feature) return
    
    setVoting(true)
    try {
      const result = await voteOnFeature(feature.id, voteType)
      
      if (result.status === 200) {
        await loadFeature() // Reload to get updated vote counts
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to vote')
    } finally {
      setVoting(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !feature) return
    
    setCommenting(true)
    try {
      const result = await addFeatureComment({
        featureId: feature.id,
        content: newComment.trim()
      })
      
      if (result.status === 200) {
        setNewComment('')
        await loadFeature() // Reload to get new comment
        toast.success('Comment added successfully!')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to add comment')
    } finally {
      setCommenting(false)
    }
  }

  const handleAddReply = async (parentId: string) => {
    if (!replyContent.trim() || !feature) return
    
    setCommenting(true)
    try {
      const result = await addFeatureComment({
        featureId: feature.id,
        content: replyContent.trim(),
        parentId
      })
      
      if (result.status === 200) {
        setReplyContent('')
        setReplyingTo(null)
        await loadFeature() // Reload to get new reply
        toast.success('Reply added successfully!')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to add reply')
    } finally {
      setCommenting(false)
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

  const getUserDisplayName = (user: { firstname: string | null; lastname: string | null; email: string }) => {
    if (user.firstname && user.lastname) {
      return `${user.firstname} ${user.lastname}`
    }
    return user.email.split('@')[0]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-light-blue"></div>
      </div>
    )
  }

  if (!feature) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-white mb-2">Feature request not found</h2>
        <Link href={`/dashboard/${params.slug}/feedback`}>
          <Button variant="outline" className="border-in-active/50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feedback
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href={`/dashboard/${params.slug}/feedback`}>
        <Button variant="outline" className="border-in-active/50">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Feedback
        </Button>
      </Link>

      {/* Main Feature Request */}
      <Card className="border-in-active/50 bg-background-80">
        <CardContent className="p-6">
          <div className="flex gap-6">
            {/* Voting Section */}
            <div className="flex flex-col items-center gap-2 min-w-[80px]">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => handleVote('UPVOTE')}
                disabled={voting}
                className={`p-3 h-12 w-12 ${
                  feature.userVote === 'UPVOTE' 
                    ? 'bg-keyword-green/20 text-keyword-green hover:bg-keyword-green/30' 
                    : 'text-text-secondary hover:text-keyword-green hover:bg-keyword-green/10'
                }`}
              >
                <ChevronUp className="h-6 w-6" />
              </Button>
              
              <span className={`text-xl font-bold ${
                feature.score > 0 ? 'text-keyword-green' : 
                feature.score < 0 ? 'text-keyword-red' : 'text-text-secondary'
              }`}>
                {feature.score}
              </span>
              
              <Button
                variant="ghost"
                size="lg"
                onClick={() => handleVote('DOWNVOTE')}
                disabled={voting}
                className={`p-3 h-12 w-12 ${
                  feature.userVote === 'DOWNVOTE' 
                    ? 'bg-keyword-red/20 text-keyword-red hover:bg-keyword-red/30' 
                    : 'text-text-secondary hover:text-keyword-red hover:bg-keyword-red/10'
                }`}
              >
                <ChevronDown className="h-6 w-6" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">{feature.title}</h1>
                  <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{getUserDisplayName(feature.User)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(feature.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(feature.status)}>
                    {feature.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className="border-in-active/50 text-text-secondary">
                    {getCategoryIcon(feature.category)} {feature.category.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-invert max-w-none">
                <p className="text-white whitespace-pre-wrap">{feature.description}</p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-text-secondary">
                <div className="flex items-center gap-1">
                  <ChevronUp className="h-4 w-4 text-keyword-green" />
                  <span>{feature.upvotes} upvotes</span>
                </div>
                <div className="flex items-center gap-1">
                  <ChevronDown className="h-4 w-4 text-keyword-red" />
                  <span>{feature.downvotes} downvotes</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{feature._count.comments} comments</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Response */}
      {feature.adminResponse && (
        <Card className="border-light-blue/50 bg-light-blue/5">
          <CardHeader>
            <CardTitle className="text-light-blue flex items-center gap-2">
              <User className="h-5 w-5" />
              Official Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white whitespace-pre-wrap">{feature.adminResponse}</p>
            {feature.respondedAt && (
              <p className="text-text-secondary text-sm mt-2">
                Responded on {new Date(feature.respondedAt).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Comment */}
      <Card className="border-in-active/50 bg-background-80">
        <CardHeader>
          <CardTitle className="text-white">Add a Comment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Share your thoughts on this feature request..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="bg-background-90 border-in-active/50 text-white"
            rows={3}
          />
          <Button
            onClick={handleAddComment}
            disabled={commenting || !newComment.trim()}
            className="bg-light-blue hover:bg-light-blue/90"
          >
            {commenting ? (
              'Adding...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Add Comment
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Comments */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">
          Comments ({feature.comments.length})
        </h2>
        
        {feature.comments.length > 0 ? (
          feature.comments.map((comment) => (
            <Card key={comment.id} className="border-in-active/50 bg-background-80">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <User className="h-4 w-4" />
                      <span>{getUserDisplayName(comment.User)}</span>
                      <span>•</span>
                      <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="text-text-secondary hover:text-light-blue"
                    >
                      <Reply className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                  </div>
                  
                  <p className="text-white whitespace-pre-wrap">{comment.content}</p>
                  
                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <div className="space-y-3 mt-4 pl-4 border-l-2 border-light-blue/20">
                      <Textarea
                        placeholder="Write a reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="bg-background-90 border-in-active/50 text-white"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAddReply(comment.id)}
                          disabled={commenting || !replyContent.trim()}
                          className="bg-light-blue hover:bg-light-blue/90"
                        >
                          {commenting ? 'Replying...' : 'Reply'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReplyingTo(null)
                            setReplyContent('')
                          }}
                          className="border-in-active/50"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="space-y-3 mt-4 pl-4 border-l-2 border-in-active/20">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-text-secondary">
                            <User className="h-3 w-3" />
                            <span>{getUserDisplayName(reply.User)}</span>
                            <span>•</span>
                            <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-white text-sm whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-in-active/50 bg-background-80">
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No comments yet</h3>
              <p className="text-text-secondary">Be the first to share your thoughts on this feature!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default FeatureRequestDetail