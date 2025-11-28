import AutomationList from '@/components/global/automation-list'
import CreateAutomation from '@/components/global/create-automation'
import { AIBuilderButton } from '@/components/global/ai-automation-builder/exports'
import { Check } from 'lucide-react'
import React from 'react'
import { Metadata } from 'next'

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

        <div className="flex flex-col rounded-xl bg-background-80 gap-y-6 p-5 border-[1px] overflow-hidden border-in-active">
          <div>
            <h2 className="text-xl">Automations</h2>
            <p className="text-text-secondary">
              Your live automations will show here.
            </p>
          </div>
          <div className="flex flex-col gap-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-start justify-between">
                <div className="flex flex-col">
                  <h3 className="font-medium">Direct traffic towards website</h3>
                  <p className="text-text-secondary text-sm">October 5th 2024</p>
                </div>
                <Check />
              </div>
            ))}
          </div>
          <CreateAutomation />
        </div>
      </div>
    </div>
  )
}

export default Page