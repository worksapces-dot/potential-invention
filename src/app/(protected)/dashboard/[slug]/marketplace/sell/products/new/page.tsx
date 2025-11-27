import { onGetSellerProfile, onCheckSellerOnboarding } from '@/actions/marketplace/seller'
import { redirect } from 'next/navigation'
import ProductForm from './_components/product-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type Props = {
  params: { slug: string }
}

export default async function NewProductPage({ params }: Props) {
  const { data: sellerProfile, status } = await onGetSellerProfile()
  
  if (status === 404) {
    redirect(`/dashboard/${params.slug}/marketplace/sell/onboarding`)
  }

  const { data: onboardingStatus } = await onCheckSellerOnboarding()
  
  if (!onboardingStatus?.onboardingComplete) {
    redirect(`/dashboard/${params.slug}/marketplace/sell/onboarding`)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href={`/dashboard/${params.slug}/marketplace/sell`} className="inline-flex items-center text-[#9D9D9D] hover:text-white mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Seller Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Product</h1>
        <p className="text-[#9D9D9D]">List your automation template on the marketplace</p>
      </div>

      <ProductForm slug={params.slug} />
    </div>
  )
}
