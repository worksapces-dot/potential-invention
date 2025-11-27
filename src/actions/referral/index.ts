'use server'

import { client as db } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { nanoid } from 'nanoid'

// Generate a unique referral code for user
export const generateReferralCode = async () => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401, message: 'Unauthorized' }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, referralCode: true }
    })

    if (!dbUser) return { status: 404, message: 'User not found' }

    // If user already has a referral code, return it
    if (dbUser.referralCode) {
      return { 
        status: 200, 
        data: { referralCode: dbUser.referralCode },
        message: 'Referral code retrieved'
      }
    }

    // Generate new unique referral code
    let referralCode: string = ''
    let isUnique = false
    
    while (!isUnique) {
      referralCode = nanoid(8).toUpperCase()
      const existing = await db.user.findUnique({
        where: { referralCode }
      })
      if (!existing) isUnique = true
    }

    // Update user with referral code
    const updatedUser = await db.user.update({
      where: { id: dbUser.id },
      data: { referralCode },
      select: { referralCode: true }
    })

    return {
      status: 200,
      data: { referralCode: updatedUser.referralCode },
      message: 'Referral code generated successfully'
    }
  } catch (error) {
    console.error('Error generating referral code:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

// Get user's referral stats
export const getReferralStats = async () => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401, message: 'Unauthorized' }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      include: {
        referrals: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            createdAt: true,
            subscription: {
              select: { plan: true }
            }
          }
        },
        referralRewards: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!dbUser) return { status: 404, message: 'User not found' }

    // Calculate stats
    const totalReferrals = dbUser.referrals.length
    const totalRewards = dbUser.referralRewards.reduce((sum, reward) => {
      return reward.type === 'CREDIT' ? sum + reward.amount : sum
    }, 0)
    const unclaimedRewards = dbUser.referralRewards.filter(r => !r.claimed)

    return {
      status: 200,
      data: {
        referralCode: dbUser.referralCode,
        totalReferrals,
        totalRewards: totalRewards / 100, // Convert to dollars
        unclaimedRewards: unclaimedRewards.length,
        referrals: dbUser.referrals,
        rewards: dbUser.referralRewards
      }
    }
  } catch (error) {
    console.error('Error getting referral stats:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

// Apply referral code when user signs up
export const applyReferralCode = async (referralCode: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401, message: 'Unauthorized' }

    // Find the referrer
    const referrer = await db.user.findUnique({
      where: { referralCode: referralCode.toUpperCase() }
    })

    if (!referrer) {
      return { status: 404, message: 'Invalid referral code' }
    }

    // Check if current user exists and hasn't been referred yet
    const currentDbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, referredById: true }
    })

    if (!currentDbUser) {
      return { status: 404, message: 'User not found' }
    }

    if (currentDbUser.referredById) {
      return { status: 400, message: 'You have already used a referral code' }
    }

    // Can't refer yourself
    if (referrer.id === currentDbUser.id) {
      return { status: 400, message: 'You cannot refer yourself' }
    }

    // Update the current user to be referred by the referrer
    await db.user.update({
      where: { id: currentDbUser.id },
      data: { referredById: referrer.id }
    })

    // Create rewards for both users
    await db.$transaction([
      // Reward for referrer (person who shared the code)
      db.referralReward.create({
        data: {
          userId: referrer.id,
          type: 'CREDIT',
          amount: 1000, // $10 credit
          description: 'Referral bonus - Someone used your code!',
          referredUserId: currentDbUser.id
        }
      }),
      // Reward for referee (person who used the code)
      db.referralReward.create({
        data: {
          userId: currentDbUser.id,
          type: 'CREDIT',
          amount: 500, // $5 credit
          description: 'Welcome bonus - Thanks for using a referral code!'
        }
      })
    ])

    return {
      status: 200,
      message: 'Referral code applied successfully! You both earned rewards.'
    }
  } catch (error) {
    console.error('Error applying referral code:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

// Claim a referral reward
export const claimReferralReward = async (rewardId: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401, message: 'Unauthorized' }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    })

    if (!dbUser) return { status: 404, message: 'User not found' }

    // Find and claim the reward
    const reward = await db.referralReward.findFirst({
      where: {
        id: rewardId,
        userId: dbUser.id,
        claimed: false
      }
    })

    if (!reward) {
      return { status: 404, message: 'Reward not found or already claimed' }
    }

    // Mark as claimed
    await db.referralReward.update({
      where: { id: rewardId },
      data: {
        claimed: true,
        claimedAt: new Date()
      }
    })

    return {
      status: 200,
      message: 'Reward claimed successfully!',
      data: reward
    }
  } catch (error) {
    console.error('Error claiming reward:', error)
    return { status: 500, message: 'Internal server error' }
  }
}