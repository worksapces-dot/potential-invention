import { onGetSellerProfile, onCheckSellerOnboarding, onGetSellerRevenueData } from '@/actions/marketplace/seller'
import { onGetMyProducts } from '@/actions/marketplace/products'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Store, Plus, DollarSign, TrendingUp, Package, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import RevenueChart from './_components/revenue-chart'
import SalesChart from './_components/sales-chart'

export default async function SellerDashboardPage() {
  const { data: sellerProfile, status } = await onGetSellerProfile()

  // Not a seller yet - redirect to onboarding
  if (status === 404) {
    redirect('./sell/onboarding')
  }

  const { data: onboardingStatus } = await onCheckSellerOnboarding()
  
  // If onboarding not complete, redirect to onboarding page
  if (!onboardingStatus?.onboardingComplete) {
    redirect('./sell/onboarding')
  }

  const { data: products } = await onGetMyProducts()
  const { data: revenueData } = await onGetSellerRevenueData()

  const topProducts = products
    ?.sort((a: any, b: any) => b.salesCount - a.salesCount)
    .slice(0, 5)
    .map((p: any) => ({
      name: p.name.substring(0, 15) + (p.name.length > 15 ? '...' : ''),
      sales: p.salesCount,
      revenue: (p.price * p.salesCount) / 100,
    })) || []

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
          <p className="text-[#9D9D9D]">Manage your products and track sales</p>
        </div>
        <div className="flex gap-3">
          <Link href="../marketplace">
            <Button variant="outline" className="rounded-full">View Marketplace</Button>
          </Link>
          <Link href="sell/payouts">
            <Button variant="outline" className="rounded-full">
              <DollarSign className="mr-2 h-4 w-4" />
              Payouts
            </Button>
          </Link>
          <Link href="sell/products/new">
            <Button className="bg-gradient-to-r from-[#3352CC] to-[#5577FF] text-white rounded-full">
              <Plus className="mr-2 h-4 w-4" />
              New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="border border-[#3352CC]/30 rounded-xl p-6 bg-[#1A1A1D]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-[#3352CC] to-[#1C2D70] rounded-xl">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-[#9D9D9D]">Products</p>
              <p className="text-2xl font-bold">{products?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="border border-green-500/30 rounded-xl p-6 bg-[#1A1A1D]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-700 rounded-xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-[#9D9D9D]">Total Sales</p>
              <p className="text-2xl font-bold">{sellerProfile?.totalSales || 0}</p>
            </div>
          </div>
        </div>

        <div className="border border-blue-500/30 rounded-xl p-6 bg-[#1A1A1D]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-[#9D9D9D]">Revenue</p>
              <p className="text-2xl font-bold">${((sellerProfile?.totalRevenue || 0) / 100).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="border border-yellow-500/30 rounded-xl p-6 bg-[#1A1A1D]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-xl">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-[#9D9D9D]">Rating</p>
              <p className="text-2xl font-bold">{sellerProfile?.rating?.toFixed(1) || '0.0'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {(revenueData && revenueData.length > 0) || topProducts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          <RevenueChart data={revenueData || []} />
          {topProducts.length > 0 && <SalesChart data={topProducts} />}
        </div>
      ) : null}

      {/* Products List */}
      <div className="border border-[#3352CC]/30 rounded-xl p-6 bg-[#1A1A1D]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Your Products</h2>
          <Link href="sell/products/new">
            <Button size="sm" className="bg-gradient-to-r from-[#3352CC] to-[#5577FF] text-white rounded-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>

        {!products || products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 text-[#9D9D9D]" />
            <h3 className="text-lg font-semibold mb-2">No products yet</h3>
            <p className="text-[#9D9D9D] mb-4">Create your first product to start selling</p>
            <Link href="sell/products/new">
              <Button className="bg-gradient-to-r from-[#3352CC] to-[#5577FF] text-white rounded-full">
                Create Product
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product: any) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border border-[#3352CC]/20 rounded-xl hover:border-[#3352CC]/50 transition-colors bg-[#0e0e0e]"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{product.name}</h3>
                    <Badge variant={product.active ? 'default' : 'secondary'} className={product.active ? 'bg-green-500' : ''}>
                      {product.active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline" className="border-[#3352CC] text-[#3352CC]">
                      {product.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[#9D9D9D]">
                    <span>${(product.price / 100).toFixed(2)}</span>
                    <span>{product.salesCount} sales</span>
                    <span>⭐ {product.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`../marketplace/${product.id}`}>
                    <Button variant="outline" size="sm" className="rounded-full">View</Button>
                  </Link>
                  <Link href={`sell/products/${product.id}/edit`}>
                    <Button variant="outline" size="sm" className="rounded-full">Edit</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}