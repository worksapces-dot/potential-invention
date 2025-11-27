import AutomationList from '@/components/global/automation-list'
import CreateAutomation from '@/components/global/create-automation'
import { AIBuilderButton } from '@/components/global/ai-automation-builder/exports'
import { Check, Sparkles } from 'lucide-react'
import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Automations',
  description: 'Create and manage your Instagram DM and comment automations. Set up keyword triggers and AI-powered responses.',
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
        {/* AI Builder Card */}
        <div className="relative flex flex-col rounded-2xl overflow-hidden mb-5 group">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-purple-600/10 to-fuchsia-600/20" />
          <div className="absolute inset-0 bg-[#0e0e0e]/80 backdrop-blur-xl" />
          
          {/* Animated Border */}
          <div className="absolute inset-0 rounded-2xl border border-purple-500/20 group-hover:border-purple-500/40 transition-colors" />
          
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
          
          <div className="relative p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0e0e0e]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">AI Builder</h2>
                <p className="text-white/40 text-sm">
                  Create with natural language
                </p>
              </div>
            </div>
            
            <p className="text-white/50 text-sm leading-relaxed">
              Just describe what you want: <span className="text-purple-400">&quot;When someone comments &apos;INFO&apos;, DM them my product details&quot;</span>
            </p>
            
            <AIBuilderButton slug={params.slug} />
          </div>
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
