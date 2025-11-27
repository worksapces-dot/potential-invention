import { Button } from '@/components/ui/button'
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react'
import Link from 'next/link'

type Props = {
  params: { slug: string }
  searchParams: { session_id?: string }
}

export default function PurchaseSuccessPage({ params, searchParams }: Props) {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
      <div className="border-2 border-green-500 rounded-2xl p-12 bg-green-500/10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500 mb-6">
          <CheckCircle className="h-10 w-10 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">Purchase Successful!</h1>
        <p className="text-lg text-[#9D9D9D] mb-8">
          Thank you for your purchase. Your product has been added to your account.
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-center gap-2 text-green-500">
            <CheckCircle className="h-5 w-5" />
            <span>Payment processed successfully</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-green-500">
            <CheckCircle className="h-5 w-5" />
            <span>Product added to your purchases</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-green-500">
            <CheckCircle className="h-5 w-5" />
            <span>Receipt sent to your email</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`/dashboard/${params.slug}/marketplace/my-purchases`}>
            <Button className="bg-gradient-to-br text-white rounded-full from-[#3352CC] to-[#1C2D70] hover:opacity-70">
              <ShoppingBag className="mr-2 h-5 w-5" />
              View My Purchases
            </Button>
          </Link>
          <Link href={`/dashboard/${params.slug}/marketplace`}>
            <Button variant="outline" className="rounded-full border-[#3352CC] text-[#3352CC] hover:bg-[#3352CC] hover:text-white">
              Continue Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        <p className="text-sm text-[#9D9D9D] mt-8">
          Need help? Contact our support team or check your purchase in the &quot;My Purchases&quot; section.
        </p>
      </div>
    </div>
  )
}