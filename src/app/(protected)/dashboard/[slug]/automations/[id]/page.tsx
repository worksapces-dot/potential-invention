import { getAutomationInfo } from '@/actions/automations'
import PostNode from '@/components/global/automations/post/node'
import ThenNode from '@/components/global/automations/then/node'
import Trigger from '@/components/global/automations/trigger'
import AutomationsBreadCrumb from '@/components/global/bread-crumbs/automations'
import { Warning } from '@/icons'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { cache } from 'react'

type Props = {
  params: { id: string }
}

// Cache the automation fetch to avoid duplicate calls
const getCachedAutomation = cache(async (id: string) => {
  return getAutomationInfo(id)
})

export async function generateMetadata({ params }: { params: { id: string } }) {
  const info = await getCachedAutomation(params.id)
  return {
    title: info.data?.name || 'Automation',
  }
}

const Page = async ({ params }: Props) => {
  const query = new QueryClient()
  
  // Use cached version
  await query.prefetchQuery({
    queryKey: ['automation-info'],
    queryFn: () => getCachedAutomation(params.id),
    staleTime: 60000,
  })

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <div className=" flex flex-col items-center gap-y-20">
        <AutomationsBreadCrumb id={params.id} />
        <div className="w-full lg:w-10/12 xl:w-6/12 p-5 rounded-xl flex flex-col bg-[#1D1D1D] gap-y-3">
          <div className="flex gap-x-2">
            <Warning />
            When...
          </div>
          <Trigger id={params.id} />
        </div>
        <ThenNode id={params.id} />
        <PostNode id={params.id} />
      </div>
    </HydrationBoundary>
  )
}

export default Page
