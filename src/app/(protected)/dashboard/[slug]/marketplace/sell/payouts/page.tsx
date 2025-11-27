import { onGetSellerProfile, onCheckSellerOnboarding, onCreateLoginLink } from '@/actions/marketplace/seller'
import { onGetSellerPayouts } from '@/actions/marketplace/payouts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DollarSign, ExternalLink, TrendingUp, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import PayoutChart from './_components/payout-chart'
import StripeLoginButton from './_components/stripe-login-button'

type Props = {
  params: { slug: string }
}

export default async function PayoutsPage({ params }: Props) {
  const { data: sellerProfile, status } = await onGetSellerProfile()
  
  if (status === 404) {
    redirect(`/dashboard/${params.slug}/marketplace/sell/onboarding`)
  }

  const { data: onboardingStatus } = await onCheckSellerOnboarding()
  
  if (!onboardingStatus?.onboardingComplete) {
    redirect(`/dashboard/${params.slug}/marketplace/sell/onboarding`)
  }

  const { data: payouts } = await onGetSellerPayouts()

  const totalEarnings = sellerProfile?.totalRevenue || 0
  const pendingPayouts = payouts?.filter((p: any) => p.status === 'pending').reduce((sum: number, p: any) => sum + p.amount, 0) || 0
  const completedPayouts = payouts?.filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + p.amount, 0) || 0

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href={`/dashboard/${params.slug}/marketplace/sell`} className="inline-flex items-center text-[#9D9D9D] hover:text-white mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Seller Dashboard
      </Link>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Payouts & Earnings</h1>
          <p className="text-[#9D9D9D]">Track your earnings and manage payouts</p>
        </div>
        <StripeLoginButton />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="border-2 border-[#3352CC] rounded-2xl p-6 bg-[#1A1A1D]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-700 rounded-xl">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-[#9D9D9D]">Total Earnings</p>
              <p className="text-2xl font-bold">${(totalEarnings / 100).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="border-2 border-[#3352CC] rounded-2xl p-6 bg-[#1A1A1D]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-xl">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-[#9D9D9D]">Pending Payouts</p>
              <p className="text-2xl font-bold">${(pendingPayouts / 100).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="border-2 border-[#3352CC] rounded-2xl p-6 bg-[#1A1A1D]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-[#3352CC] to-[#1C2D70] rounded-xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-[#9D9D9D]">Paid Out</p>
              <p className="text-2xl font-bold">${(completedPayouts / 100).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payout Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <PayoutChart data={payouts || []} />
        
        <div className="border-2 border-[#3352CC] rounded-2xl p-6 bg-[#1A1A1D]">
          <h2 className="text-xl font-bold mb-4">Payout Information</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-[#3352CC]/30">
              <span className="text-[#9D9D9D]">Payout Schedule</span>
              <span>Weekly (Fridays)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#3352CC]/30">
              <span className="text-[#9D9D9D]">Platform Fee</span>
              <span>10%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#3352CC]/30">
              <span className="text-[#9D9D9D]">Your Share</span>
              <span className="text-green-500 font-semibold">90%</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#9D9D9D]">Minimum Payout</span>
              <span>$25.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payouts */}
      <div className="border-2 border-[#3352CC] rounded-2xl p-6 bg-[#1A1A1D]">
        <h2 className="text-2xl font-semibold mb-6">Recent Payouts</h2>
        
        {!payouts || payouts.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-[#9D9D9D]" />
            <h3 className="text-lg font-semibold mb-2">No payouts yet</h3>
            <p className="text-[#9D9D9D]">
              Your payouts will appear here once you start making sales
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {payouts.map((payout: any) => (
              <div key={payout.id} className="flex items-center justify-between p-4 border-2 border-[#3352CC]/30 rounded-xl bg-[#0e0e0e]">
                <div>
                  <p className="font-semibold">${(payout.amount / 100).toFixed(2)}</p>
                  <p className="text-sm text-[#9D9D9D]">
                    {new Date(payout.created * 1000).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={payout.status === 'paid' ? 'default' : payout.status === 'pending' ? 'secondary' : 'destructive'}
                    className={payout.status === 'paid' ? 'bg-green-600' : ''}
                  >
                    {payout.status.toUpperCase()}
                  </Badge>
                  {payout.arrival_date && (
                    <p className="text-xs text-[#9D9D9D] mt-1">
                      Arrives: {new Date(payout.arrival_date * 1000).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}