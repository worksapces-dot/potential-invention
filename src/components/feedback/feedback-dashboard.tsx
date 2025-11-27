'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus,
  TrendingUp,
  MessageSquare,
  Users,
  CheckCircle2,
  Clock,
  Lightbulb,
  Filter,
  Search
} from 'lucide-react'
import { getFeatureRequests, getFeatureStats } from '@/actions/feedback'
import FeatureRequestCard from './feature-request-card'
import CreateFeatureModal from './create-feature-modal'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type FeatureCategory = 'AUTOMATION' | 'INTEGRATIONS' | 'UI_UX' | 'ANALYTICS' | 'MARKETPLACE' | 'MOBILE_APP' | 'API' | 'SECURITY' | 'PERFORMANCE' | 'OTHER'
type FeatureStatus = 'PENDING' | 'UNDER_REVIEW' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'

interface FeatureRequest {
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

interface FeedbackStats {
  totalRequests: number
  pendingRequests: number
  completedRequests: number
  inProgressRequests: number
  categoryStats: Array<{
    category: FeatureCategory
    _count: { category: number }
  }>
}

const FeedbackDashboard = () => {
  const [features, setFeatures] = useState<FeatureRequest[]>([])
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<FeatureCategory | 'ALL'>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<FeatureStatus | 'ALL'>('ALL')
  const [sortBy, setSortBy] = useState<'score' | 'createdAt' | 'upvotes'>('score')

  useEffect(() => {
    loadFeatures()
    loadStats()
  }, [currentPage, selectedCategory, selectedStatus, sortBy])

  const loadFeatures = async () => {
    try {
      setLoading(true)
      const result = await getFeatureRequests({
        page: currentPage,
        limit: 10,
        category: selectedCategory === 'ALL' ? undefined : selectedCategory,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        sortBy,
        sortOrder: 'desc'
      })

      if (result.status === 200 && result.data) {
        setFeatures(result.data.featureRequests as any)
        setTotalPages(result.data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error loading features:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const result = await getFeatureStats()
      if (result.status === 200 && result.data) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleFeatureCreated = () => {
    setShowCreateModal(false)
    loadFeatures()
    loadStats()
  }

  const filteredFeatures = features.filter(feature =>
    feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feature.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: FeatureStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-keyword-yellow/10 text-keyword-yellow'
      case 'UNDER_REVIEW': return 'bg-light-blue/10 text-light-blue'
      case 'PLANNED': return 'bg-keyword-purple/10 text-keyword-purple'
      case 'IN_PROGRESS': return 'bg-keyword-green/10 text-keyword-green'
      case 'COMPLETED': return 'bg-keyword-green/20 text-keyword-green'
      case 'REJECTED': return 'bg-keyword-red/10 text-keyword-red'
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-light-blue/10">
            <Lightbulb className="h-6 w-6 text-light-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Feature Requests</h1>
            <p className="text-text-secondary">Share ideas and vote on features you want to see</p>
          </div>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-light-blue hover:bg-light-blue/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Request Feature
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-in-active/50 bg-background-80">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-light-blue/10">
                  <Lightbulb className="h-5 w-5 text-light-blue" />
                </div>
                <div>
                  <p className="text-text-secondary text-sm">Total Requests</p>
                  <p className="text-2xl font-bold text-white">{stats.totalRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-in-active/50 bg-background-80">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-keyword-yellow/10">
                  <Clock className="h-5 w-5 text-keyword-yellow" />
                </div>
                <div>
                  <p className="text-text-secondary text-sm">Pending</p>
                  <p className="text-2xl font-bold text-white">{stats.pendingRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-in-active/50 bg-background-80">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-keyword-green/10">
                  <TrendingUp className="h-5 w-5 text-keyword-green" />
                </div>
                <div>
                  <p className="text-text-secondary text-sm">In Progress</p>
                  <p className="text-2xl font-bold text-white">{stats.inProgressRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-in-active/50 bg-background-80">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-keyword-green/20">
                  <CheckCircle2 className="h-5 w-5 text-keyword-green" />
                </div>
                <div>
                  <p className="text-text-secondary text-sm">Completed</p>
                  <p className="text-2xl font-bold text-white">{stats.completedRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card className="border-in-active/50 bg-background-80">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <Input
                  placeholder="Search feature requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background-90 border-in-active/50 text-white"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as FeatureCategory | 'ALL')}>
              <SelectTrigger className="w-full md:w-48 bg-background-90 border-in-active/50">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {(['AUTOMATION', 'INTEGRATIONS', 'UI_UX', 'ANALYTICS', 'MARKETPLACE', 'MOBILE_APP', 'API', 'SECURITY', 'PERFORMANCE', 'OTHER'] as FeatureCategory[]).map((category) => (
                  <SelectItem key={category} value={category}>
                    {getCategoryIcon(category)} {category.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as FeatureStatus | 'ALL')}>
              <SelectTrigger className="w-full md:w-48 bg-background-90 border-in-active/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                {(['PENDING', 'UNDER_REVIEW', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'] as FeatureStatus[]).map((status) => (
                  <SelectItem key={status} value={status}>
                    <Badge className={getStatusColor(status)}>
                      {status.replace('_', ' ')}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'score' | 'createdAt' | 'upvotes')}>
              <SelectTrigger className="w-full md:w-48 bg-background-90 border-in-active/50">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">🔥 Hot (Score)</SelectItem>
                <SelectItem value="upvotes">👍 Most Upvoted</SelectItem>
                <SelectItem value="createdAt">🕒 Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Feature Requests List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-light-blue"></div>
          </div>
        ) : filteredFeatures.length > 0 ? (
          filteredFeatures.map((feature) => (
            <FeatureRequestCard
              key={feature.id}
              feature={feature}
              onVoteUpdate={loadFeatures}
            />
          ))
        ) : (
          <Card className="border-in-active/50 bg-background-80">
            <CardContent className="p-12 text-center">
              <Lightbulb className="h-12 w-12 text-text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No feature requests found</h3>
              <p className="text-text-secondary mb-4">
                {searchTerm ? 'Try adjusting your search or filters' : 'Be the first to request a feature!'}
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-light-blue hover:bg-light-blue/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Request Feature
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="border-in-active/50"
          >
            Previous
          </Button>
          <span className="text-text-secondary">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="border-in-active/50"
          >
            Next
          </Button>
        </div>
      )}

      {/* Create Feature Modal */}
      <CreateFeatureModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleFeatureCreated}
      />
    </div>
  )
}

export default FeedbackDashboard