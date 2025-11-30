'use server'

import { client } from '@/lib/prisma'
import { onCurrentUser } from '../user'
import { findUser } from '../user/queries'

// Cast client to any to handle new models not yet in generated types
const db = client as any

export const getNotifications = async (limit: number = 20) => {
  const user = await onCurrentUser()
  
  try {
    const dbUser = await findUser(user.id)
    if (!dbUser) return { status: 404, data: [] }

    // Check if notification table exists
    try {
      const notifications = await db.notification.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
      })
      return { status: 200, data: notifications }
    } catch {
      // Table doesn't exist yet, return empty
      return { status: 200, data: [] }
    }
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return { status: 500, data: [] }
  }
}

export const getUnreadCount = async () => {
  const user = await onCurrentUser()
  
  try {
    const dbUser = await findUser(user.id)
    if (!dbUser) return { status: 404, count: 0 }

    try {
      const count = await db.notification.count({
        where: { userId: dbUser.id, read: false },
      })
      return { status: 200, count }
    } catch {
      return { status: 200, count: 0 }
    }
  } catch (error) {
    console.error('Error fetching unread count:', error)
    return { status: 500, count: 0 }
  }
}

export const markAsRead = async (notificationId: string) => {
  const user = await onCurrentUser()
  
  try {
    const dbUser = await findUser(user.id)
    if (!dbUser) return { status: 404 }

    try {
      await db.notification.updateMany({
        where: { id: notificationId, userId: dbUser.id },
        data: { read: true },
      })
    } catch {
      // Table doesn't exist yet
    }

    return { status: 200 }
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return { status: 500 }
  }
}

export const markAllAsRead = async () => {
  const user = await onCurrentUser()
  
  try {
    const dbUser = await findUser(user.id)
    if (!dbUser) return { status: 404 }

    try {
      await db.notification.updateMany({
        where: { userId: dbUser.id, read: false },
        data: { read: true },
      })
    } catch {
      // Table doesn't exist yet
    }

    return { status: 200 }
  } catch (error) {
    console.error('Error marking all as read:', error)
    return { status: 500 }
  }
}

export const createNotification = async (
  userId: string,
  type: 'DM_SENT' | 'COMMENT_REPLY' | 'AUTOMATION_TRIGGER' | 'SYSTEM' | 'UPGRADE',
  title: string,
  message: string,
  linkUrl?: string
) => {
  try {
    const notification = await db.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        linkUrl,
      },
    })

    return { status: 200, data: notification }
  } catch (error) {
    console.error('Error creating notification:', error)
    return { status: 500 }
  }
}

// Create welcome notification for new users
export const createWelcomeNotification = async (userId: string) => {
  return createNotification(
    userId,
    'SYSTEM',
    'Welcome to Slide! 🎉',
    'Get started by connecting your Instagram and creating your first automation.',
    '/integrations'
  )
}
