import { client } from '@/lib/prisma'

export const matchKeyword = async (keyword: string) => {
  return await client.keyword.findFirst({
    where: {
      word: {
        equals: keyword,
        mode: 'insensitive',
      },
    },
  })
}

export const getKeywordAutomation = async (
  automationId: string,
  dm: boolean
) => {
  return await client.automation.findUnique({
    where: {
      id: automationId,
    },

    include: {
      dms: dm,
      trigger: {
        where: {
          type: dm ? 'DM' : 'COMMENT',
        },
      },
      listener: true,
      User: {
        select: {
          subscription: {
            select: {
              plan: true,
            },
          },
          integrations: {
            select: {
              token: true,
            },
          },
        },
      },
    },
  })
}
export const trackResponses = async (
  automationId: string,
  type: 'COMMENT' | 'DM'
) => {
  const today = new Date()
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )

  const isComment = type === 'COMMENT'

  // Update legacy listener counters (all‑time) so existing UI keeps working
  const listenerUpdate =
    isComment
      ? {
          commentCount: {
            increment: 1,
          },
        }
      : {
          dmCount: {
            increment: 1,
          },
        }

  const listenerPromise = client.listener.update({
    where: { automationId },
    data: listenerUpdate,
  })

  // Upsert daily AutomationMetric row for analytics
  const metricPromise = client.automationMetric.upsert({
    where: {
      automationId_date: {
        automationId,
        date: startOfToday,
      },
    },
    update: isComment
      ? {
          commentsReplied: {
            increment: 1,
          },
          deliveredCount: {
            increment: 1,
          },
        }
      : {
          dmsSent: {
            increment: 1,
          },
          deliveredCount: {
            increment: 1,
          },
        },
    create: {
      automationId,
      date: startOfToday,
      commentsReplied: isComment ? 1 : 0,
      dmsSent: isComment ? 0 : 1,
      deliveredCount: 1,
    },
  })

  const [listener, metric] = await Promise.all([listenerPromise, metricPromise])
  return { listener, metric }
}

export const createChatHistory = (
  automationId: string,
  sender: string,
  reciever: string,
  message: string
) => {
  return client.automation.update({
    where: {
      id: automationId,
    },
    data: {
      dms: {
        create: {
          reciever,
          senderId: sender,
          message,
        },
      },
    },
  })
}

export const getKeywordPost = async (postId: string, automationId: string) => {
  return await client.post.findFirst({
    where: {
      AND: [{ postid: postId }, { automationId }],
    },
    select: { automationId: true },
  })
}

export const getChatHistory = async (sender: string, reciever: string) => {
  const history = await client.dms.findMany({
    where: {
      AND: [{ senderId: sender }, { reciever }],
    },
    orderBy: { createdAt: 'asc' },
  })
  const chatSession: {
    role: 'assistant' | 'user'
    content: string
  }[] = history.map((chat) => {
    return {
      role: chat.reciever ? 'assistant' : 'user',
      content: chat.message!,
    }
  })

  return {
    history: chatSession,
    automationId: history[history.length - 1].automationId,
  }
}
