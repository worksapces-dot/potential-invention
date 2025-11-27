import { onBecomeSeller, onGetSellerProfile, onCreateOnboardingLink } from '@/actions/marketplace/seller'
import { Button } from '@/components/ui/button'
import { Store, CheckCircle2, DollarSign, Shield } from 'lucide-react'
import { redirect } from 'next/navigation'

async function handleBecomeSeller() {
  'use server'
  const result = await onBecomeSeller()
  
  if (result.status === 201 && result.data?.onboardingUrl) {
    redirect(result.data.onboardingUrl)
  } else if (result.status === 200) {
    // Already a seller, get onboarding link
    const linkResult = await onCreateOnboardingLink()
    if (linkResult.status === 200 && linkResult.data?.url) {
      redirect(linkResult.data.url)
    }
  }
}

export default async function SellerOnboardingPage() {
  const { data: sellerProfile, status } = await onGetSellerProfile()

  // If already onboarded, redirect to dashboard
  if (status === 200 && sellerProfile?.onboardingComplete) {
    redirect('../sell')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#3352CC] to-[#1C2D70] mb-6 shadow-lg shadow-[#3352CC]/20">
          <Store className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-[#9D9D9D] bg-clip-text text-transparent">
          Become a Seller
        </h1>
        <p className="text-xl text-[#9D9D9D] max-w-2xl mx-auto">
          Join our marketplace and start selling your automation templates to thousands of users
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#3352CC] to-[#1C2D70] rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative border-2 border-[#3352CC] rounded-2xl p-8 bg-[#0e0e0e] text-center hover:bg-[#1A1A1D] transition-all">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-green-700 mb-6 shadow-lg shadow-green-500/20">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Earn Revenue</h3>
            <p className="text-[#9D9D9D] leading-relaxed">
              Keep 90% of every sale you make. Get paid directly to your bank account
            </p>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#3352CC] to-[#1C2D70] rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative border-2 border-[#3352CC] rounded-2xl p-8 bg-[#0e0e0e] text-center hover:bg-[#1A1A1D] transition-all">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 mb-6 shadow-lg shadow-blue-500/20">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Secure Payments</h3>
            <p className="text-[#9D9D9D] leading-relaxed">
              Powered by Stripe Connect. Bank-level security for all transactions
            </p>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#3352CC] to-[#1C2D70] rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative border-2 border-[#3352CC] rounded-2xl p-8 bg-[#0e0e0e] text-center hover:bg-[#1A1A1D] transition-all">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-700 mb-6 shadow-lg shadow-yellow-500/20">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Easy Setup</h3>
            <p className="text-[#9D9D9D] leading-relaxed">
              Get started in minutes. Simple onboarding process with Stripe
            </p>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="border-2 border-[#3352CC] rounded-2xl p-10 bg-[#0e0e0e] mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#3352CC]/10 to-transparent rounded-full blur-3xl"></div>
        <div className="relative">
          <h2 className="text-3xl font-bold mb-8 text-center">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#3352CC] to-[#1C2D70] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#3352CC]/30">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">Connect with Stripe</h3>
                  <p className="text-sm text-[#9D9D9D] leading-relaxed">
                    Set up your Stripe Connect account to receive payments securely
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#3352CC] to-[#1C2D70] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#3352CC]/30">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">Complete Verification</h3>
                  <p className="text-sm text-[#9D9D9D] leading-relaxed">
                    Provide your business information and verify your identity
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#3352CC] to-[#1C2D70] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#3352CC]/30">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">Start Selling</h3>
                  <p className="text-sm text-[#9D9D9D] leading-relaxed">
                    Create your first product and start earning money today
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <div className="inline-block">
          <form action={handleBecomeSeller}>
            <Button
              type="submit"
              size="lg"
              className="bg-gradient-to-br text-white rounded-full from-[#3352CC] to-[#1C2D70] hover:opacity-80 transition-all px-12 py-6 text-lg font-semibold shadow-lg shadow-[#3352CC]/30 hover:shadow-[#3352CC]/50 hover:scale-105"
            >
              <Store className="mr-3 h-6 w-6" />
              Connect with Stripe
            </Button>
          </form>
          <p className="text-sm text-[#9D9D9D] mt-6">
            🔒 Secure connection • You'll be redirected to Stripe to complete the setup
          </p>
        </div>
      </div>
    </div>
  )
}
