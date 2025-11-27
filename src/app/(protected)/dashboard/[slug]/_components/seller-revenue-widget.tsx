import { onGetSellerProfile } from '@/actions/marketplace/seller'
import { Card } from '@/components/ui/card'
import { DollarSign, TrendingUp, Package, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function SellerRevenueWidget() {
  const { data: sellerProfile, status } = await onGetSellerProfile()

  // Not a seller - don't show widget
  if (status === 404 || !sellerProfile) {
    return null
  }

  const totalRevenue = (sellerProfile.totalRevenue / 100).toFixed(2)
  const totalSales = sellerProfile.totalSales
  const productsCount = sellerProfile.products.length

  return (
    <div className="border-[1px] border-in-active/50 p-5 rounded-xl bg-[#1A1A1D]">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-[#3352CC] to-[#1C2D70] rounded-lg">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-white">
              Marketplace Earnings
            </h2>
            <p className="text-text-secondary text-sm">
              Your seller performance
            </p>
          </div>
        </div>
        <Link href="marketplace/sell">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-[#3352CC] text-[#3352CC] hover:bg-[#3352CC] hover:text-white"
          >
            View Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Revenue */}
        <div className="border-2 border-[#3352CC] rounded-xl p-4 bg-[#0e0e0e]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-green-500 to-green-700 rounded-lg">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm text-[#9D9D9D]">Total Revenue</p>
          </div>
          <p className="text-2xl font-bold text-white">${totalRevenue}</p>
          <p className="text-xs text-[#9D9D9D] mt-1">90% of sales</p>
        </div>

        {/* Total Sales */}
        <div className="border-2 border-[#3352CC] rounded-xl p-4 bg-[#0e0e0e]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg">
              <ShoppingCart className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm text-[#9D9D9D]">Total Sales</p>
          </div>
          <p className="text-2xl font-bold text-white">{totalSales}</p>
          <p className="text-xs text-[#9D9D9D] mt-1">Products sold</p>
        </div>

        {/* Products Listed */}
        <div className="border-2 border-[#3352CC] rounded-xl p-4 bg-[#0e0e0e]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg">
              <Package className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm text-[#9D9D9D]">Products</p>
          </div>
          <p className="text-2xl font-bold text-white">{productsCount}</p>
          <p className="text-xs text-[#9D9D9D] mt-1">Active listings</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-[#3352CC]/30">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-[#9D9D9D]">Average per sale:</span>
          </div>
          <span className="font-semibold text-white">
            ${totalSales > 0 ? ((sellerProfile.totalRevenue / 100) / totalSales).toFixed(2) : '0.00'}
          </span>
        </div>
      </div>
    </div>
  )
}
