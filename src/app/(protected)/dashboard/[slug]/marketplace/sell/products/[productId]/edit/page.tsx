import { onGetProduct } from '@/actions/marketplace/products'
import { onGetSellerProfile } from '@/actions/marketplace/seller'
import { onGetProductPromotion } from '@/actions/marketplace/promotions'
import { redirect, notFound } from 'next/navigation'
import EditProductForm from './_components/edit-product-form'
import PromoteProduct from '@/components/marketplace/promote-product'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

type Props = {
  params: { slug: string; productId: string }
  searchParams: { promotion?: string }
}

export default async function EditProductPage({ params, searchParams }: Props) {
  const { data: product, status } = await onGetProduct(params.productId)
  
  if (status === 404 || !product) {
    notFound()
  }

  const { data: sellerProfile } = await onGetSellerProfile()
  
  // Check if user owns this product
  if (!sellerProfile || product.sellerId !== sellerProfile.id) {
    redirect(`/dashboard/${params.slug}/marketplace/${params.productId}`)
  }

  // Get current promotion status
  const { data: currentPromotion } = await onGetProductPromotion(params.productId)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href={`/dashboard/${params.slug}/marketplace/sell`} className="inline-flex items-center text-[#9D9D9D] hover:text-white mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Seller Dashboard
      </Link>

      {/* Promotion Success Message */}
      {searchParams.promotion === 'success' && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <p className="text-green-500">Promotion activated! Your product is now being boosted.</p>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Product</h1>
        <p className="text-[#9D9D9D]">Update your product details and settings</p>
      </div>

      <div className="space-y-8">
        <EditProductForm product={product} slug={params.slug} />
        
        {/* Promotion Section */}
        <PromoteProduct 
          productId={params.productId}
          productName={product.name}
          currentPromotion={currentPromotion ? {
            tier: currentPromotion.tier,
            status: currentPromotion.status,
            endsAt: currentPromotion.endsAt.toISOString(),
            viewsDelivered: currentPromotion.viewsDelivered,
            boostViews: currentPromotion.boostViews
          } : null}
        />
      </div>
    </div>
  )
}