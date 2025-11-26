'use server'

import { resend } from '@/lib/resend'
import { onCurrentUser } from '@/actions/user'
import {
  getGlobalAutomationStats,
  getPerAutomationStats,
  getDailyAutomationActivity,
} from '@/actions/automations/analytics'
import { getInstagramUserProfile } from '@/actions/user'
import { getAiAccountScore } from '@/actions/analytics/ai-score'

export const sendWeeklyAnalyticsReport = async () => {
  const user = await onCurrentUser()

  const [aiScore, globalStats, perAutomationStats, dailyActivity, userProfile] =
    await Promise.all([
      getAiAccountScore(user.id),
      getGlobalAutomationStats(user.id),
      getPerAutomationStats(user.id),
      getDailyAutomationActivity(user.id),
      getInstagramUserProfile(),
    ])

  const to = user.emailAddresses?.[0]?.emailAddress
  if (!to) return { ok: false, error: 'Missing email' }

  const totalFollowers = userProfile.data?.followers_count ?? 0
  const totalComments = globalStats.totalCommentsReplied
  const totalDms = globalStats.totalDmsSent
  const totalEngagement = totalComments + totalDms

  const topAutomation = perAutomationStats[0]

  const overallScore = aiScore?.overall

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #050509; color: #f9fafb; padding: 24px;">
      <h1 style="font-size: 20px; margin-bottom: 4px;">Your weekly Instagram automation report</h1>
      <p style="font-size: 13px; color: #9ca3af; margin-top: 0;">
        Here is a quick snapshot of how your account and automations performed recently.
      </p>

      <div style="margin-top: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px;">
        <div style="padding: 14px 16px; border-radius: 12px; background: radial-gradient(circle at top left, rgba(56,189,248,0.16), transparent 60%); border: 1px solid rgba(148,163,184,0.4);">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af;">Followers</div>
          <div style="font-size: 22px; font-weight: 600; margin-top: 4px;">${totalFollowers.toLocaleString()}</div>
        </div>
        <div style="padding: 14px 16px; border-radius: 12px; background: radial-gradient(circle at top left, rgba(45,212,191,0.16), transparent 60%); border: 1px solid rgba(148,163,184,0.4);">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af;">Total engagement</div>
          <div style="font-size: 22px; font-weight: 600; margin-top: 4px;">${totalEngagement.toLocaleString()}</div>
          <div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">${totalComments.toLocaleString()} comments · ${totalDms.toLocaleString()} DMs</div>
        </div>
        ${
          overallScore != null
            ? `<div style="padding: 14px 16px; border-radius: 12px; background: radial-gradient(circle at top left, rgba(129,140,248,0.18), transparent 60%); border: 1px solid rgba(129,140,248,0.6);">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af;">AI account score</div>
                <div style="font-size: 22px; font-weight: 600; margin-top: 4px;">${Math.round(
                  overallScore
                )} / 100</div>
              </div>`
            : ''
        }
      </div>

      <div style="margin-top: 24px; padding: 16px 18px; border-radius: 12px; border: 1px solid rgba(148,163,184,0.4); background: linear-gradient(to right, rgba(15,23,42,0.9), rgba(15,23,42,0.98));">
        <h2 style="font-size: 14px; margin: 0 0 8px 0;">Highlights</h2>
        <ul style="font-size: 13px; color: #9ca3af; padding-left: 18px; margin: 0;">
          <li>Total days with automation activity: ${dailyActivity.length}</li>
          ${
            topAutomation
              ? `<li>Top performing automation: <strong>${topAutomation.name || 'Untitled'}</strong> with ${topAutomation.engagementPercent.toFixed(
                  1
                )}% engagement.</li>`
              : ''
          }
          ${
            aiScore?.summary
              ? `<li>AI summary: ${aiScore.summary}</li>`
              : ''
          }
        </ul>
      </div>

      <p style="font-size: 11px; color: #6b7280; margin-top: 20px;">
        Tip: Improve your scores by refining your automations, adding more entry points, and responding faster to new activity.
      </p>
    </div>
  `

  if (!process.env.RESEND_API_KEY) {
    console.error('[sendWeeklyAnalyticsReport] Missing RESEND_API_KEY environment variable')
    return { ok: false, error: 'Email service is not configured (missing RESEND_API_KEY).' }
  }

  try {
    const res = await resend.emails.send({
      from: 'Slide Reports <reports@your-app.dev>',
      to,
      subject: 'Your weekly Instagram automation report',
      html,
    })

    if ((res as any)?.error) {
      console.error('[sendWeeklyAnalyticsReport] Resend API error', (res as any).error)
      return { ok: false, error: 'Failed to send report email.' }
    }

    return { ok: true }
  } catch (error) {
    console.error('[sendWeeklyAnalyticsReport] Unexpected error', error)
    return { ok: false, error: 'Unexpected error while sending report.' }
  }
}
