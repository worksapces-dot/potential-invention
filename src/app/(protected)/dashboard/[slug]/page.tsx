import DoubleGradientCard from '@/components/global/double-gradient-card'
import { DASHBOARD_CARDS } from '@/constants/dashboard'
import { BarDuoToneBlue } from '@/icons'
import Chart from './_components/metrics'
import MetricsCard from './_components/metrics/metrics-card'
import { onCurrentUser } from '@/actions/user'
import { client } from '@/lib/prisma'
import { BarChart3, MessageSquare, Users, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'

const statsCards = [
  {
    title: 'Total Automations',
    value: '0',
    icon: Zap,
    description: 'Active automations',
  },
  {
    title: 'Messages Sent',
    value: '0',
    icon: MessageSquare,
    description: 'This month',
  },
  {
    title: 'Leads Captured',
    value: '0',
    icon: Users,
    description: 'Total leads',
  },
  {
    title: 'Engagement Rate',
    value: '0%',
    icon: BarChart3,
    description: 'Average rate',
  },
]

export default async function DashboardPage() {
  // Get user type
  const user = await onCurrentUser()
  const dbUser = await (client.user as any).findUnique({
    where: { clerkId: user.id },
    select: { userType: true },
  })
  const userType = dbUser?.userType

  // Cold Caller - new clean style
  if (userType === 'COLD_CALLER') {
    return (
      <div className="flex flex-col gap-8 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s an overview of your activity.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <Card
              key={stat.title}
              className="p-5 bg-background/50 border-border/50 hover:border-border transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 bg-background/50 border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Activity Overview</h2>
              <p className="text-sm text-muted-foreground">
                Your performance over time
              </p>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="min-h-[300px]">
              <Chart />
            </div>
            <div>
              <MetricsCard />
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Creator / BOTH - original gradient style
  return (
    <div className="flex flex-col gap-y-10">
      <div className="flex gap-5 lg:flex-row flex-col">
        {DASHBOARD_CARDS.map((card) => (
          <DoubleGradientCard key={card.id} {...card} />
        ))}
      </div>

      <div className="border-[1px] relative border-in-active/50 p-5 rounded-xl">
        <span className="flex gap-x-1 z-50 items-center">
          <BarDuoToneBlue />
          <div className="z-50">
            <h2 className="text-2xl font-medium text-white">Automated Activity</h2>
            <p className="text-text-secondary text-sm">
              Automated 0 out of 1 interactions
            </p>
          </div>
        </span>
        <div className="w-full flex lg:flex-row flex-col gap-5">
          <div className="lg:w-6/12">
            <Chart />
          </div>
          <div className="lg:w-6/12">
            <MetricsCard />
          </div>
        </div>
      </div>
    </div>
  )
}
