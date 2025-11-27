import { onGetAllProducts } from '@/actions/marketplace/products'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SearchFilters from '@/components/marketplace/search-filters'
import ProductCard from '@/components/marketplace/product-card'
import Link from 'next/link'
import { Store, Flame as Fire, Clock, Award, ShoppingBag } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Marketplace',
  description: 'Browse and purchase automation templates, AI prompts, and keyword lists. Monetize your expertise by selling your own templates.',
}

type Props = {
  searchParams: { [key: string]: string | undefined }
}

export default async function MarketplacePage({ searchParams }: Props) {
  const filters = {
    search: searchParams.search,
    category: searchParams.category,
    sort: searchParams.sort,
    minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
  }

  const { data: allProducts } = await onGetAllProducts(filters)
  const { data: trendingProducts } = await onGetAllProducts({ sort: 'popular', limit: 8 })
  const { data: newestProducts } = await onGetAllProducts({ sort: 'newest', limit: 8 })
  const { data: topRatedProducts } = await onGetAllProducts({ sort: 'rating', limit: 8 })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
          <p className="text-[#9D9D9D]">Browse automation templates and tools</p>
        </div>
        <div className="flex gap-3">
          <Link href="marketplace/my-purchases">
            <Button variant="outline" className="rounded-full border-[#3352CC]">
              <ShoppingBag className="mr-2 h-4 w-4" />
              My Purchases
            </Button>
          </Link>
          <Link href="marketplace/sell">
            <Button className="bg-gradient-to-r from-[#3352CC] to-[#5577FF] text-white rounded-full">
              <Store className="mr-2 h-4 w-4" />
              Sell
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mb-8">
        <SearchFilters />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#1A1A1D] border border-[#3352CC]/30 rounded-xl p-1 mb-8">
          <TabsTrigger value="all" className="flex items-center gap-2 data-[state=active]:bg-[#3352CC] data-[state=active]:text-white rounded-lg">
            <Store className="h-4 w-4" />
            All
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2 data-[state=active]:bg-[#3352CC] data-[state=active]:text-white rounded-lg">
            <Fire className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="newest" className="flex items-center gap-2 data-[state=active]:bg-[#3352CC] data-[state=active]:text-white rounded-lg">
            <Clock className="h-4 w-4" />
            Newest
          </TabsTrigger>
          <TabsTrigger value="top-rated" className="flex items-center gap-2 data-[state=active]:bg-[#3352CC] data-[state=active]:text-white rounded-lg">
            <Award className="h-4 w-4" />
            Top Rated
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ProductGrid products={allProducts} />
        </TabsContent>

        <TabsContent value="trending">
          <ProductGrid products={trendingProducts} />
        </TabsContent>

        <TabsContent value="newest">
          <ProductGrid products={newestProducts} />
        </TabsContent>

        <TabsContent value="top-rated">
          <ProductGrid products={topRatedProducts} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProductGrid({ products }: { products: any[] | undefined }) {
  if (!products || products.length === 0) {
    return (
      <div className="border-2 border-dashed border-[#3352CC]/30 rounded-2xl p-12 text-center">
        <Store className="h-12 w-12 mx-auto mb-4 text-[#9D9D9D]" />
        <h3 className="text-xl font-semibold mb-2">No products found</h3>
        <p className="text-[#9D9D9D] mb-4">Try adjusting your filters or check back later</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product: any) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}