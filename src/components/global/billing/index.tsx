'use client'

import PaymentCard from './payment-card'
import { useQueryUser } from '@/hooks/user-queries'

const Billing = () => {
  const { data } = useQueryUser()
  const currentPlan = data?.data?.subscription?.plan || 'FREE'

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight mb-2">Plans</h2>
        <p className="text-muted-foreground">
          Choose the plan that works best for you
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <PaymentCard current={currentPlan} label="FREE" />
        <PaymentCard current={currentPlan} label="PRO" />
      </div>

      {/* Footer note */}
      <p className="text-center text-sm text-muted-foreground mt-8">
        All plans include a 7-day money back guarantee
      </p>
    </div>
  )
}

export default Billing
