import { onCurrentUser, getInstagramUserProfile } from '@/actions/user'
import {
  getGlobalAutomationStats,
  getPerAutomationStats,
  getDailyAutomationActivity,
} from '@/actions/automations/analytics'
import { getAiAccountScore } from '@/actions/analytics/ai-score'
import GlobalMetrics from './_components/global-metrics'
import AutomationStatsTable from './_components/automation-stats-table'
import ActivityLineChart from './_components/activity-line-chart'
import FollowersChart from './_components/followers-chart'
import GoalTracker from './_components/goal-tracker'
import AccountScoreCard from './_components/account-score-card'
import SendReportButton from './_components/send-report-button'
import { Badge } from '@/components/ui/badge'

type Props = {
  params: { slug: string }
}

const AnalyticsPage = async ({ params }: Props) => {
  const user = await onCurrentUser()

  const [aiScore, globalStats, perAutomationStats, dailyActivity, userProfile] =
    await Promise.all([
      getAiAccountScore(user.id),
      getGlobalAutomationStats(user.id),
      getPerAutomationStats(user.id),
      getDailyAutomationActivity(user.id),
      getInstagramUserProfile(),
    ])

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#191622] via-[#0b0b12] to-[#141b2f] px-6 py-5 shadow-lg shadow-black/40">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl lg:text-2xl font-semibold text-white">
              Growth analytics
            </h1>
            <p className="text-xs text-text-secondary max-w-xl">
              See how your automations are actually performing – from total DMs
              and comment replies to which flows are driving the most
              engagement.
            </p>
          </div>
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="flex items-center gap-2 lg:gap-3">
              <Badge
                variant="outline"
                className="border-white/20 bg-black/30 text-[0.65rem] uppercase tracking-wide text-white"
              >
                Last 30 days
              </Badge>
              <span className="text-[0.7rem] text-text-secondary">
                Powered by live Instagram automation activity
              </span>
            </div>
            <SendReportButton />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)] items-stretch">
        <GlobalMetrics stats={globalStats} />
        {dailyActivity.length > 0 && <ActivityLineChart data={dailyActivity} />}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1.1fr)] items-start">
        <AutomationStatsTable stats={perAutomationStats} />
        <GoalTracker stats={perAutomationStats} />
      </section>

      {aiScore && (
        <section>
          <AccountScoreCard score={aiScore} />
        </section>
      )}

      <section>
        <FollowersChart currentFollowers={userProfile.data?.followers_count} />
      </section>
    </div>
  )
}

export default AnalyticsPage


