import Billing from '@/components/global/billing'
import ReferralDashboard from '@/components/referral/referral-dashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React from 'react'

type Props = {}

const Page = (props: Props) => {
  return (
    <div className="flex flex-col gap-y-10">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
      </div>
      
      <Tabs defaultValue="billing" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-background-80 border border-in-active/50">
          <TabsTrigger 
            value="billing" 
            className="data-[state=active]:bg-light-blue data-[state=active]:text-white"
          >
            Billing & Plans
          </TabsTrigger>
          <TabsTrigger 
            value="referrals"
            className="data-[state=active]:bg-light-blue data-[state=active]:text-white"
          >
            Referral Program
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="billing" className="mt-6">
          <Billing />
        </TabsContent>
        
        <TabsContent value="referrals" className="mt-6">
          <ReferralDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Page
