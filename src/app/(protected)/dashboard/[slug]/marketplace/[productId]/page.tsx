import { onGetProduct } from '@/actions/marketplace/products'
import { onGetSellerProfile } from '@/actions/marketplace/seller'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Store, Star, ShoppingCart, ArrowLeft, User, Calendar, Eye, Package } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import BuyButton from './_components/buy-button'

type Props = {
  params: { slug: string; productId: string }
}

export default async function ProductDetailPage({ params }: Props) {
  const { data: product, status } = await onGetProduct(params.productId)
  
  if (status === 404 || !product) {
    notFound()
  }

  const { data: currentUserSeller } = await onGetSellerProfile()
  const isOwner = currentUserSeller?.id === product.sellerId

  const sellerName = `${product.SellerProfile?.User?.firstname || 'Unknown'} ${product.SellerProfile?.User?.lastname || ''}`

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back Button */}
      <Link href={`/dashboard/${params.slug}/marketplace`} className="inline-flex items-center text-[#9D9D9D] hover:text-white mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images */}
        <div className="lg:col-span-2">
          <div className="border-2 border-[#3352CC] rounded-2xl overflow-hidden bg-[#0e0e0e]">
            <div className="relative h-80 md:h-96">
              {product.thumbnail ? (
                <Image src={product.thumbnail} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full bg-[#1A1A1D]">
                  <Store className="h-24 w-24 text-[#9D9D9D]" />
                </div>
              )}
              {product.featured && (
                <Badge className="absolute top-4 right-4 bg-gradient-to-br from-[#3352CC] to-[#1C2D70]">Featured</Badge>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="border-2 border-[#3352CC] rounded-2xl p-6 bg-[#1A1A1D] mt-6">
            <h2 className="text-xl font-bold mb-4">Description</h2>
            <p className="text-[#9D9D9D] whitespace-pre-wrap">{product.description}</p>
          </div>

          {/* What's Included */}
          <div className="border-2 border-[#3352CC] rounded-2xl p-6 bg-[#1A1A1D] mt-6">
            <h2 className="text-xl font-bold mb-4">What's Included</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[#9D9D9D]">
                <Package className="h-5 w-5 text-[#3352CC]" />
                <span>Full automation template</span>
              </div>
              <div className="flex items-center gap-3 text-[#9D9D9D]">
                <Package className="h-5 w-5 text-[#3352CC]" />
                <span>One-click import to your account</span>
              </div>
              <div className="flex items-center gap-3 text-[#9D9D9D]">
                <Package className="h-5 w-5 text-[#3352CC]" />
                <span>Lifetime access</span>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="border-2 border-[#3352CC] rounded-2xl p-6 bg-[#1A1A1D] mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Reviews ({product.reviewCount || 0})</h2>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                <span className="font-bold">{(product.rating || 0).toFixed(1)}</span>
              </div>
            </div>
            
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-4">
                {product.reviews.map((review: any) => (
                  <div key={review.id} className="border border-[#3352CC]/30 rounded-xl p-4 bg-[#0e0e0e]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[#9D9D9D]" />
                        <span className="font-medium">{review.User?.firstname || 'Anonymous'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-[#9D9D9D]'}`} />
                        ))}
                      </div>
                    </div>
                    {review.comment && <p className="text-sm text-[#9D9D9D]">{review.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#9D9D9D] text-center py-4">No reviews yet</p>
            )}
          </div>
        </div>

        {/* Right Column - Purchase Card */}
        <div className="lg:col-span-1">
          <div className="border-2 border-[#3352CC] rounded-2xl p-6 bg-[#1A1A1D] sticky top-6">
            <Badge variant="outline" className="border-[#3352CC] text-[#3352CC] mb-4">
              {product.category.replace(/_/g, ' ')}
            </Badge>
            
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span className="font-medium">{(product.rating || 0).toFixed(1)}</span>
              </div>
              <span className="text-[#9D9D9D]">•</span>
              <span className="text-[#9D9D9D]">{product.salesCount} sales</span>
              <span className="text-[#9D9D9D]">•</span>
              <span className="text-[#9D9D9D]">{product.views} views</span>
            </div>

            <div className="text-4xl font-bold mb-6">
              ${(product.price / 100).toFixed(2)}
            </div>

            {isOwner ? (
              <Link href={`/dashboard/${params.slug}/marketplace/sell/products/${product.id}/edit`}>
                <Button className="w-full bg-gradient-to-br text-white rounded-full from-[#3352CC] to-[#1C2D70] hover:opacity-70">
                  Edit Product
                </Button>
              </Link>
            ) : (
              <BuyButton productId={product.id} price={product.price} slug={params.slug} />
            )}

            {/* Seller Info */}
            <div className="mt-6 pt-6 border-t border-[#3352CC]/30">
              <p className="text-sm text-[#9D9D9D] mb-2">Sold by</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3352CC] to-[#1C2D70] flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">{sellerName}</p>
                  <p className="text-xs text-[#9D9D9D]">
                    ⭐ {(product.SellerProfile?.rating || 0).toFixed(1)} seller rating
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 pt-6 border-t border-[#3352CC]/30 grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-[#9D9D9D] mb-1">
                  <Eye className="h-4 w-4" />
                </div>
                <p className="text-lg font-bold">{product.views}</p>
                <p className="text-xs text-[#9D9D9D]">Views</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-[#9D9D9D] mb-1">
                  <ShoppingCart className="h-4 w-4" />
                </div>
                <p className="text-lg font-bold">{product.salesCount}</p>
                <p className="text-xs text-[#9D9D9D]">Sales</p>
              </div>
            </div>

            {/* Guarantee */}
            <div className="mt-6 pt-6 border-t border-[#3352CC]/30">
              <p className="text-sm text-[#9D9D9D] text-center">
                🔒 7-day money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
