'use server'

import { client as db } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { FeatureCategory, FeatureStatus, FeaturePriority, VoteType } from '@prisma/client'

// Create a new feature request
export const createFeatureRequest = async (data: {
  title: string
  description: string
  category: FeatureCategory
}) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401, message: 'Unauthorized' }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    })

    if (!dbUser) return { status: 404, message: 'User not found' }

    const featureRequest = await db.featureRequest.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        userId: dbUser.id
      },
      include: {
        User: {
          select: {
            firstname: true,
            lastname: true,
            email: true
          }
        },
        _count: {
          select: {
            votes: true,
            comments: true
          }
        }
      }
    })

    return {
      status: 200,
      data: featureRequest,
      message: 'Feature request created successfully'
    }
  } catch (error) {
    console.error('Error creating feature request:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

// Get all feature requests with pagination and filtering
export const getFeatureRequests = async (params: {
  page?: number
  limit?: number
  category?: FeatureCategory
  status?: FeatureStatus
  sortBy?: 'score' | 'createdAt' | 'upvotes'
  sortOrder?: 'asc' | 'desc'
}) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      sortBy = 'score',
      sortOrder = 'desc'
    } = params

    const skip = (page - 1) * limit

    const where: any = {}
    if (category) where.category = category
    if (status) where.status = status

    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    const [featureRequests, total] = await Promise.all([
      db.featureRequest.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          User: {
            select: {
              firstname: true,
              lastname: true,
              email: true
            }
          },
          _count: {
            select: {
              votes: true,
              comments: true
            }
          }
        }
      }),
      db.featureRequest.count({ where })
    ])

    return {
      status: 200,
      data: {
        featureRequests,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    }
  } catch (error) {
    console.error('Error getting feature requests:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

// Get a single feature request with comments
export const getFeatureRequest = async (id: string) => {
  try {
    const user = await currentUser()
    let userVote = null

    const featureRequest = await db.featureRequest.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            firstname: true,
            lastname: true,
            email: true
          }
        },
        comments: {
          where: { parentId: null }, // Only top-level comments
          orderBy: { createdAt: 'desc' },
          include: {
            User: {
              select: {
                firstname: true,
                lastname: true,
                email: true
              }
            },
            replies: {
              orderBy: { createdAt: 'asc' },
              include: {
                User: {
                  select: {
                    firstname: true,
                    lastname: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            votes: true,
            comments: true
          }
        }
      }
    })

    if (!featureRequest) {
      return { status: 404, message: 'Feature request not found' }
    }

    // Get user's vote if authenticated
    if (user) {
      const dbUser = await db.user.findUnique({
        where: { clerkId: user.id },
        select: { id: true }
      })

      if (dbUser) {
        userVote = await db.featureVote.findUnique({
          where: {
            userId_featureId: {
              userId: dbUser.id,
              featureId: id
            }
          }
        })
      }
    }

    return {
      status: 200,
      data: {
        ...featureRequest,
        userVote: userVote?.voteType || null
      }
    }
  } catch (error) {
    console.error('Error getting feature request:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

// Vote on a feature request
export const voteOnFeature = async (featureId: string, voteType: VoteType) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401, message: 'Unauthorized' }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    })

    if (!dbUser) return { status: 404, message: 'User not found' }

    // Check if user already voted
    const existingVote = await db.featureVote.findUnique({
      where: {
        userId_featureId: {
          userId: dbUser.id,
          featureId
        }
      }
    })

    await db.$transaction(async (tx: any) => {
      const feature = await tx.featureRequest.findUnique({
        where: { id: featureId },
        select: { upvotes: true, downvotes: true }
      })

      if (!feature) throw new Error('Feature request not found')

      let upvoteChange = 0
      let downvoteChange = 0

      if (existingVote) {
        // Remove existing vote
        if (existingVote.voteType === 'UPVOTE') {
          upvoteChange = -1
        } else {
          downvoteChange = -1
        }

        if (existingVote.voteType === voteType) {
          // Same vote type - remove vote
          await tx.featureVote.delete({
            where: { id: existingVote.id }
          })
        } else {
          // Different vote type - update vote
          await tx.featureVote.update({
            where: { id: existingVote.id },
            data: { voteType }
          })

          // Add new vote
          if (voteType === 'UPVOTE') {
            upvoteChange += 1
          } else {
            downvoteChange += 1
          }
        }
      } else {
        // Create new vote
        await tx.featureVote.create({
          data: {
            userId: dbUser.id,
            featureId,
            voteType
          }
        })

        if (voteType === 'UPVOTE') {
          upvoteChange = 1
        } else {
          downvoteChange = 1
        }
      }

      // Update feature request counts
      const newUpvotes = feature.upvotes + upvoteChange
      const newDownvotes = feature.downvotes + downvoteChange
      const newScore = newUpvotes - newDownvotes

      await tx.featureRequest.update({
        where: { id: featureId },
        data: {
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          score: newScore
        }
      })
    })

    return {
      status: 200,
      message: 'Vote updated successfully'
    }
  } catch (error) {
    console.error('Error voting on feature:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

// Add a comment to a feature request
export const addFeatureComment = async (data: {
  featureId: string
  content: string
  parentId?: string
}) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401, message: 'Unauthorized' }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    })

    if (!dbUser) return { status: 404, message: 'User not found' }

    const comment = await db.featureComment.create({
      data: {
        content: data.content,
        userId: dbUser.id,
        featureId: data.featureId,
        parentId: data.parentId
      },
      include: {
        User: {
          select: {
            firstname: true,
            lastname: true,
            email: true
          }
        }
      }
    })

    return {
      status: 200,
      data: comment,
      message: 'Comment added successfully'
    }
  } catch (error) {
    console.error('Error adding comment:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

// Update feature request status (admin only)
export const updateFeatureStatus = async (
  featureId: string,
  status: FeatureStatus,
  priority?: FeaturePriority,
  adminResponse?: string
) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401, message: 'Unauthorized' }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, email: true }
    })

    if (!dbUser) return { status: 404, message: 'User not found' }

    // Check if user is admin (you can implement your own admin check logic)
    const isAdmin = dbUser.email?.includes('admin') || dbUser.email?.includes('support')
    if (!isAdmin) {
      return { status: 403, message: 'Admin access required' }
    }

    const updateData: any = {
      status,
      updatedAt: new Date()
    }

    if (priority) updateData.priority = priority
    if (adminResponse) {
      updateData.adminResponse = adminResponse
      updateData.adminUserId = dbUser.id
      updateData.respondedAt = new Date()
    }

    const updatedFeature = await db.featureRequest.update({
      where: { id: featureId },
      data: updateData,
      include: {
        User: {
          select: {
            firstname: true,
            lastname: true,
            email: true
          }
        }
      }
    })

    return {
      status: 200,
      data: updatedFeature,
      message: 'Feature request updated successfully'
    }
  } catch (error) {
    console.error('Error updating feature status:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

// Get feature request statistics
export const getFeatureStats = async () => {
  try {
    const [
      totalRequests,
      pendingRequests,
      completedRequests,
      inProgressRequests,
      categoryStats
    ] = await Promise.all([
      db.featureRequest.count(),
      db.featureRequest.count({ where: { status: 'PENDING' } }),
      db.featureRequest.count({ where: { status: 'COMPLETED' } }),
      db.featureRequest.count({ where: { status: 'IN_PROGRESS' } }),
      db.featureRequest.groupBy({
        by: ['category'],
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } }
      })
    ])

    return {
      status: 200,
      data: {
        totalRequests,
        pendingRequests,
        completedRequests,
        inProgressRequests,
        categoryStats
      }
    }
  } catch (error) {
    console.error('Error getting feature stats:', error)
    return { status: 500, message: 'Internal server error' }
  }
}