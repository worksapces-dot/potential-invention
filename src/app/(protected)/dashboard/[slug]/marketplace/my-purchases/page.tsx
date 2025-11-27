import { onGetMyPurchases } from '@/actions/marketplace/purchases'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ApplyTemplateButton } from '@/components/marketplace/apply-template-button'
import { RefundButton } from '@/components/marketplace/refund-button'
import ReviewForm from '@/components/marketplace/review-form'
import { ShoppingBag, CheckCircle, Star } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default async function MyPurchasesPage() {
  const { data: purchases } = await onGetMyPurchases()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Purchases</h1>
        <p className="text-muted-foreground">
          View and manage your purchased products
        </p>
      </div>

      {!purchases || purchases.length === 0 ? (
        <div className="border-2 border-[#3352CC] rounded-2xl p-12 text-center bg-[#1A1A1D]">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-[#9D9D9D]" />
          <h3 className="text-xl font-semibold mb-2">No purchases yet</h3>
          <p className="text-[#9D9D9D] mb-4">
            Browse the marketplace to find automation templates and more
          </p>
          <Link href="../marketplace">
            <Button className="bg-gradient-to-br text-white rounded-full from-[#3352CC] to-[#1C2D70] hover:opacity-70">Browse Marketplace</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase: any) => (
            <div key={purchase.id} className="border-2 border-[#3352CC] rounded-2xl p-6 bg-[#1A1A1D]">
              <div className="flex items-start gap-6">
                {/* Product Image */}
                <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {purchase.Product?.thumbnail ? (
                    <Image
                      src={purchase.Product?.thumbnail}
                      alt={purchase.Product?.name ?? 'Product'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Link
                        href={`../marketplace/${purchase.Product.id}`}
                        className="hover:underline"
                      >
                        <h3 className="font-semibold text-lg">
                          {purchase.Product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        by {purchase.Product?.SellerProfile?.User?.firstname ?? ''}{' '}
                        {purchase.Product?.SellerProfile?.User?.lastname ?? ''}
                      </p>                   
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        ${(purchase.amount / 100).toFixed(2)}
                      </p>
                      <Badge
                        variant={
                          purchase.status === 'COMPLETED'
                            ? 'default'
                            : purchase.status === 'REFUNDED'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {purchase.status}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {purchase.Product.description}
                  </p>

                  <div className="flex items-center gap-3 flex-wrap">
                    {purchase.Product.category === 'AUTOMATION_TEMPLATE' && (
                      <>
                        {purchase.applied ? (
                          <div className="flex items-center gap-2 text-green-600 text-sm">
                            <CheckCircle className="h-4 w-4" />
                            <span>Applied to your account</span>
                          </div>
                        ) : (
                          <ApplyTemplateButton purchaseId={purchase.id} />
                        )}
                      </>
                    )}

                    <p className="text-xs text-[#9D9D9D]">
                      Purchased on{' '}
                      {new Date(purchase.createdAt).toLocaleDateString()}
                    </p>

                    {purchase.status === 'COMPLETED' &&
                      new Date() < new Date(purchase.refundableUntil) && (
                        <>
                          <Badge variant="outline" className="text-xs border-[#3352CC] text-[#3352CC]">
                            Refundable until{' '}
                            {new Date(purchase.refundableUntil).toLocaleDateString()}
                          </Badge>
                          <RefundButton
                            purchaseId={purchase.id}
                            productName={purchase.Product.name}
                            refundableUntil={purchase.refundableUntil}
                          />
                        </>
                      )}
                  </div>
                </div>
              </div>

              {/* Review Section */}
              {purchase.status === 'COMPLETED' && !purchase.Product.reviews?.some((r: any) => r.userId === purchase.userId) && (
                <div className="mt-4 pt-4 border-t border-[#3352CC]/30">
                  <ReviewForm productId={purchase.Product.id} purchaseId={purchase.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
