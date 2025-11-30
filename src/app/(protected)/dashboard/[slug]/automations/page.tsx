import AutomationList from '@/components/global/automation-list'
import CreateAutomation from '@/components/global/create-automation'
import { AIBuilderButton } from '@/components/global/ai-automation-builder/exports'
import React from 'react'
import { Metadata } from 'next'
import { ActiveAutomationsSidebar } from './_components/active-automations-sidebar'

export const metadata: Metadata = {
  title: 'Automations',
  description:
    'Create and manage your Instagram DM and comment automations. Set up keyword triggers and AI-powered responses.',
}

type Props = {
  params: { slug: string }
}

const Page = ({ params }: Props) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-5">
      <div className="lg:col-span-4">
        <AutomationList />
      </div>
      <div className="lg:col-span-2">
        {/* AI Builder Card - Clean minimal style */}
        <div className="rounded-xl border border-border/50 bg-background p-5 mb-5">
          <p className="text-sm text-muted-foreground mb-4">
            Describe your automation in plain text
          </p>
          <AIBuilderButton slug={params.slug} />
        </div>

        <ActiveAutomationsSidebar />
      </div>
    </div>
  )
}

export default Page