import { onCurrentUser, getInstagramUserProfile } from '@/actions/user'
import { getDailyAutomationActivity, getGlobalAutomationStats, getPerAutomationStats } from '@/actions/automations/analytics'
import { FollowersChartPartial } from './_components/followers-chart-partial'
import EcommerceSalesChart from './_components/ecommerce-sales-chart'
import RevenuePerformanceChart from './_components/revenue-performance-chart'
import AutomationPerformanceChart from './_components/automation-performance-chart'
import { AIChatbotWidget } from './_components/ai-suggestions-widget'
import { BarChart3, TrendingUp } from 'lucide-react'

type Props = {
  params: { slug: string }
}

const AnalyticsPage = async ({ params }: Props) => {
  const user = await onCurrentUser()

  const [dailyActivity, userProfile, globalStats, perAutomationStats] = await Promise.all([
    getDailyAutomationActivity(user.id, 90),
    getInstagramUserProfile(),
    getGlobalAutomationStats(user.id),
    getPerAutomationStats(user.id),
  ])

  // Calculate average engagement
  const avgEngagement = perAutomationStats.length > 0
    ? perAutomationStats.reduce((sum, stat) => sum + stat.engagementPercent, 0) / perAutomationStats.length
    : 0;

  // Prepare user context for AI
  const userContext = {
    name: user.firstName || 'there',
    followers: userProfile.data?.followers_count || 0,
    totalDMs: globalStats.totalDmsSent,
    totalReplies: globalStats.totalCommentsReplied,
    automationCount: perAutomationStats.length,
    avgEngagement,
    automations: perAutomationStats.map(stat => ({
      name: stat.name,
      dmsSent: stat.dmsSent,
      commentsReplied: stat.commentsReplied,
      engagementPercent: stat.engagementPercent,
    })),
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Gradient */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-background to-muted/20" />

      <div className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto">
        {/* Header with Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-border/50 p-8 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-chart-2/5 rounded-full blur-3xl" />

          <div className="relative flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground text-base mt-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Real-time overview of your automation performance and growth
              </p>
            </div>
          </div>
        </div>

        {/* Charts Grid with Stagger Animation */}
        <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
            <FollowersChartPartial currentFollowers={userProfile.data?.followers_count} />
          </div>
          <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
            <EcommerceSalesChart data={dailyActivity} globalStats={globalStats} />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-400">
            <AutomationPerformanceChart stats={perAutomationStats} />
          </div>
          <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-500">
            <RevenuePerformanceChart data={dailyActivity} />
          </div>
        </div>
      </div>

      {/* AI Chatbot Widget */}
      <AIChatbotWidget userContext={userContext} />
    </div>
  )
}

export default AnalyticsPage
