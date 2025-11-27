import AutomationList from '@/components/global/automation-list'
import CreateAutomation from '@/components/global/create-automation'
import { AIBuilderButton } from '@/components/global/ai-automation-builder/exports'
import { Check, Sparkles } from 'lucide-react'
import React from 'react'

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
        {/* AI Builder Card */}
        <div className="flex flex-col rounded-xl bg-gradient-to-br from-[#3352CC]/10 to-[#5577FF]/10 gap-y-4 p-5 border-[1px] overflow-hidden border-[#3352CC]/30 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3352CC] to-[#5577FF] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">AI Builder</h2>
              <p className="text-text-secondary text-sm">
                Create automations with plain text
              </p>
            </div>
          </div>
          <p className="text-text-secondary text-sm">
            Just describe what you want: "When someone comments 'INFO', DM them my product details"
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
              <div
                key={item}
                className="flex items-start justify-between"
              >
                <div className="flex flex-col">
                  <h3 className="font-medium">
                    Direct traffic towards website
                  </h3>
                  <p className="text-text-secondary text-sm">
                    October 5th 2024
                  </p>
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
