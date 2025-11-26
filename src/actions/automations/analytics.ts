'use server'

import { client } from '@/lib/prisma'
import { subDays, startOfDay } from 'date-fns'

type GlobalStats = {
  totalCommentsReplied: number
  totalDmsSent: number
}

export const getGlobalAutomationStats = async (
  clerkId: string,
  since?: Date
): Promise<GlobalStats> => {
  const sinceDate = since ?? subDays(new Date(), 30)

  const user = await client.user.findUnique({
    where: { clerkId },
    select: {
      automations: {
        select: {
          id: true,
          listener: {
            select: {
              commentCount: true,
              dmCount: true,
            },
          },
          metrics: {
            where: {
              date: {
                gte: startOfDay(sinceDate),
              },
            },
            select: {
              commentsReplied: true,
              dmsSent: true,
            },
          },
        },
      },
    },
  })

  if (!user) {
    return {
      totalCommentsReplied: 0,
      totalDmsSent: 0,
    }
  }

  // Prefer AutomationMetric data for the window; fall back to listener all‑time counts
  let totalCommentsReplied = 0
  let totalDmsSent = 0

  for (const automation of user.automations) {
    if (automation.metrics.length > 0) {
      for (const metric of automation.metrics) {
        totalCommentsReplied += metric.commentsReplied
        totalDmsSent += metric.dmsSent
      }
    } else if (automation.listener) {
      totalCommentsReplied += automation.listener.commentCount
      totalDmsSent += automation.listener.dmCount
    }
  }

  return {
    totalCommentsReplied,
    totalDmsSent,
  }
}

export type PerAutomationStat = {
  automationId: string
  name: string
  commentsReplied: number
  dmsSent: number
  deliveredCount: number
  engagementPercent: number
}

export const getPerAutomationStats = async (
  clerkId: string,
  since?: Date
): Promise<PerAutomationStat[]> => {
  const sinceDate = since ?? subDays(new Date(), 30)

  const user = await client.user.findUnique({
    where: { clerkId },
    select: {
      automations: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          name: true,
          metrics: {
            where: {
              date: {
                gte: startOfDay(sinceDate),
              },
            },
            select: {
              commentsReplied: true,
              dmsSent: true,
              deliveredCount: true,
            },
          },
        },
      },
    },
  })

  if (!user) return []

  return user.automations.map((automation) => {
    const aggregate = automation.metrics.reduce(
      (acc, metric) => {
        acc.commentsReplied += metric.commentsReplied
        acc.dmsSent += metric.dmsSent
        acc.deliveredCount += metric.deliveredCount
        return acc
      },
      { commentsReplied: 0, dmsSent: 0, deliveredCount: 0 }
    )

    const engaged = aggregate.commentsReplied + aggregate.dmsSent
    const engagementPercent =
      aggregate.deliveredCount > 0
        ? (engaged / aggregate.deliveredCount) * 100
        : 0

    return {
      automationId: automation.id,
      name: automation.name,
      commentsReplied: aggregate.commentsReplied,
      dmsSent: aggregate.dmsSent,
      deliveredCount: aggregate.deliveredCount,
      engagementPercent,
    }
  })
}

export type DailyActivityPoint = {
  date: string
  commentsReplied: number
  dmsSent: number
  deliveredCount: number
}

export const getDailyAutomationActivity = async (
  clerkId: string,
  days = 30
): Promise<DailyActivityPoint[]> => {
  const sinceDate = subDays(new Date(), days)

  const user = await client.user.findUnique({
    where: { clerkId },
    select: {
      automations: {
        select: {
          id: true,
          metrics: {
            where: {
              date: {
                gte: startOfDay(sinceDate),
              },
            },
            select: {
              date: true,
              commentsReplied: true,
              dmsSent: true,
              deliveredCount: true,
            },
          },
        },
      },
    },
  })

  if (!user) return []

  const byDate = new Map<
    string,
    { commentsReplied: number; dmsSent: number; deliveredCount: number }
  >()

  for (const automation of user.automations) {
    for (const metric of automation.metrics) {
      const key = startOfDay(metric.date).toISOString()
      const current =
        byDate.get(key) ?? { commentsReplied: 0, dmsSent: 0, deliveredCount: 0 }
      current.commentsReplied += metric.commentsReplied
      current.dmsSent += metric.dmsSent
      current.deliveredCount += metric.deliveredCount
      byDate.set(key, current)
    }
  }

  return Array.from(byDate.entries())
    .map(([key, value]) => ({
      date: key,
      commentsReplied: value.commentsReplied,
      dmsSent: value.dmsSent,
      deliveredCount: value.deliveredCount,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}



