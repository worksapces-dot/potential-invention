'use server'

import { openai } from '@/lib/openai'
import { getGlobalAutomationStats, getPerAutomationStats, getDailyAutomationActivity } from '@/actions/automations/analytics'
import { getInstagramUserProfile } from '@/actions/user'

export type AiScoreDimension = {
  key: 'growth' | 'engagement' | 'automation_coverage' | 'consistency' | 'funnel_depth'
  label: string
  score: number
  reasoning: string
}

export type AiAccountScore = {
  overall: number
  dimensions: AiScoreDimension[]
  summary: string
}

export const getAiAccountScore = async (clerkId: string): Promise<AiAccountScore | null> => {
  try {
    const [globalStats, perAutomationStats, dailyActivity, userProfile] = await Promise.all([
      getGlobalAutomationStats(clerkId),
      getPerAutomationStats(clerkId),
      getDailyAutomationActivity(clerkId),
      getInstagramUserProfile(),
    ])

    const totalFollowers = userProfile.data?.followers_count ?? 0
    const mediaCount = userProfile.data?.media_count ?? 0

    const totalEngagement = globalStats.totalCommentsReplied + globalStats.totalDmsSent
    const automationCount = perAutomationStats.length

    const activeDays = dailyActivity.length

    const payload = {
      profile: {
        followers: totalFollowers,
        mediaCount,
      },
      global: {
        totalCommentsReplied: globalStats.totalCommentsReplied,
        totalDmsSent: globalStats.totalDmsSent,
      },
      automations: perAutomationStats.map((a) => ({
        name: a.name,
        commentsReplied: a.commentsReplied,
        dmsSent: a.dmsSent,
        deliveredCount: a.deliveredCount,
        engagementPercent: a.engagementPercent,
      })),
      activity: {
        totalEngagement,
        activeDays,
      },
    }

    const systemPrompt = `You are evaluating an Instagram account that uses DM/comment automations.
Score it from 0 to 100 on exactly these 5 dimensions:
- growth: follower growth potential and current size
- engagement: quality and volume of DMs + comments vs reach
- automation_coverage: how broadly automations cover posts and traffic
- consistency: steadiness of activity over days
- funnel_depth: how well automations can capture and nurture leads (even if inferred)

Return STRICT JSON with this TypeScript shape:
{
  "overall": number, // 0-100
  "dimensions": {
    "key": "growth" | "engagement" | "automation_coverage" | "consistency" | "funnel_depth",
    "label": string,
    "score": number, // 0-100
    "reasoning": string
  }[],
  "summary": string
}

Be concise but practical in reasoning. Do NOT include any text outside JSON.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: JSON.stringify(payload),
        },
      ],
      temperature: 0.3,
    })

    const content = completion.choices[0]?.message?.content

    let parsed: AiAccountScore | null = null
    if (content) {
      try {
        parsed = JSON.parse(content) as AiAccountScore
      } catch {
        parsed = null
      }
    }

    if (!parsed || !parsed.dimensions || parsed.dimensions.length === 0) {
      // Fallback: simple heuristic score based only on our own metrics
      const avgEngagement =
        perAutomationStats.length > 0
          ?
              perAutomationStats.reduce((sum, a) => sum + (a.engagementPercent || 0), 0) /
              perAutomationStats.length
          : 0

      const growthScore = Math.max(0, Math.min(100, totalFollowers > 0 ? 50 + Math.log10(totalFollowers + 1) * 10 : 30))
      const engagementScore = Math.max(0, Math.min(100, avgEngagement))
      const automationCoverageScore = Math.max(
        0,
        Math.min(100, automationCount > 0 ? 40 + Math.log10(automationCount + 1) * 15 : 20)
      )
      const consistencyScore = Math.max(
        0,
        Math.min(100, activeDays > 0 ? Math.min(100, (activeDays / 30) * 100) : 20)
      )
      const funnelDepthScore = Math.max(
        0,
        Math.min(100, totalEngagement > 0 ? 45 + Math.log10(totalEngagement + 1) * 10 : 25)
      )

      const dimensions: AiScoreDimension[] = [
        {
          key: 'growth',
          label: 'Growth',
          score: growthScore,
          reasoning: 'Heuristic estimate based on current followers and content volume.',
        },
        {
          key: 'engagement',
          label: 'Engagement',
          score: engagementScore,
          reasoning: 'Based on average engagement percentage across automations.',
        },
        {
          key: 'automation_coverage',
          label: 'Automation coverage',
          score: automationCoverageScore,
          reasoning: 'Roughly estimated from how many automations you have configured.',
        },
        {
          key: 'consistency',
          label: 'Consistency',
          score: consistencyScore,
          reasoning: 'Estimated from how many days recently had automation activity.',
        },
        {
          key: 'funnel_depth',
          label: 'Funnel depth',
          score: funnelDepthScore,
          reasoning: 'Uses overall engagement volume as a proxy for funnel depth.',
        },
      ]

      const overall =
        (growthScore + engagementScore + automationCoverageScore + consistencyScore + funnelDepthScore) / 5

      return {
        overall,
        dimensions,
        summary:
          'Account score generated from your current followers, engagement and automation activity. AI summary was temporarily unavailable, so this uses a fallback heuristic.',
      }
    }

    return parsed
  } catch (err) {
    console.error('Failed to compute AI account score', err)
    return null
  }
}
