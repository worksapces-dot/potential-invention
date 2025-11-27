'use client'

import { useState, useEffect } from 'react'
import { getFeatureRequests, getFeatureStats, createFeatureRequest, voteOnFeature } from '@/actions/feedback'

type FeatureCategory = 'AUTOMATION' | 'INTEGRATIONS' | 'UI_UX' | 'ANALYTICS' | 'MARKETPLACE' | 'MOBILE_APP' | 'API' | 'SECURITY' | 'PERFORMANCE' | 'OTHER'
type FeatureStatus = 'PENDING' | 'UNDER_REVIEW' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'
type VoteType = 'UPVOTE' | 'DOWNVOTE'

interface UseFeatureRequestsParams {
  page?: number
  limit?: number
  category?: FeatureCategory
  status?: FeatureStatus
  sortBy?: 'score' | 'createdAt' | 'upvotes'
  sortOrder?: 'asc' | 'desc'
}

export const useFeedback = (params: UseFeatureRequestsParams = {}) => {
  const [features, setFeatures] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const loadFeatures = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getFeatureRequests(params)
      
      if (result.status === 200 && result.data) {
        setFeatures(result.data.featureRequests)
        setPagination(result.data.pagination)
      } else {
        setError(result.message || null)
      }
    } catch (err) {
      setError('Failed to load feature requests')
      console.error('Error loading features:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const result = await getFeatureStats()
      if (result.status === 200 && result.data) {
        setStats(result.data as any)
      }
    } catch (err) {
      console.error('Error loading stats:', err)
    }
  }

  const createFeature = async (data: {
    title: string
    description: string
    category: FeatureCategory
  }) => {
    try {
      const result = await createFeatureRequest(data)
      if (result.status === 200) {
        await loadFeatures() // Reload features
        await loadStats() // Reload stats
        return { success: true, message: result.message }
      } else {
        return { success: false, message: result.message }
      }
    } catch (err) {
      return { success: false, message: 'Failed to create feature request' }
    }
  }

  const vote = async (featureId: string, voteType: VoteType) => {
    try {
      const result = await voteOnFeature(featureId, voteType)
      if (result.status === 200) {
        await loadFeatures() // Reload to get updated votes
        return { success: true, message: result.message }
      } else {
        return { success: false, message: result.message }
      }
    } catch (err) {
      return { success: false, message: 'Failed to vote' }
    }
  }

  useEffect(() => {
    loadFeatures()
    loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.category, params.status, params.sortBy])

  return {
    features,
    stats,
    loading,
    error,
    pagination,
    loadFeatures,
    loadStats,
    createFeature,
    vote
  }
}