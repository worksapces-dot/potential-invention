'use client'

import { useQueryAutomations } from '@/hooks/user-queries'
import { getMonth } from '@/lib/utils'
import { Check, Loader2 } from 'lucide-react'
import CreateAutomation from '@/components/global/create-automation'

export const ActiveAutomationsSidebar = () => {
  const { data, isPending } = useQueryAutomations()

  const activeAutomations = data?.data?.filter((a: any) => a.active) || []

  return (
    <div className="flex flex-col rounded-xl bg-background-80 gap-y-6 p-5 border-[1px] overflow-hidden border-in-active">
      <div>
        <h2 className="text-xl">Active Automations</h2>
        <p className="text-text-secondary">
          Your live automations will show here.
        </p>
      </div>
      <div className="flex flex-col gap-y-3">
        {isPending ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : activeAutomations.length > 0 ? (
          activeAutomations.slice(0, 5).map((automation: any) => (
            <div key={automation.id} className="flex items-start justify-between">
              <div className="flex flex-col">
                <h3 className="font-medium">{automation.name}</h3>
                <p className="text-text-secondary text-sm">
                  {getMonth(new Date(automation.createdAt).getUTCMonth() + 1)}{' '}
                  {new Date(automation.createdAt).getUTCDate()}th{' '}
                  {new Date(automation.createdAt).getUTCFullYear()}
                </p>
              </div>
              <Check className="text-green-500" />
            </div>
          ))
        ) : (
          <p className="text-text-secondary text-sm py-2">
            No active automations yet
          </p>
        )}
      </div>
      <CreateAutomation />
    </div>
  )
}
