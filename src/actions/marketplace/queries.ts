'use server'

import { client } from '@/lib/prisma'
import { ProductCategory, PurchaseStatus } from '@prisma/client'

// ============================================================================
// SELLER QUERIES
// ============================================================================

export const findSellerProfile = async (clerkId: string) => {
  // First find the user by clerkId to get the UUID
  const user = await client.user.findUnique({
    where: { clerkId },
    select: { id: true },
  })

  if (!user) return null

  return await client.sellerProfile.findUnique({
    where: { userId: user.id },
    include: {
      products: {
        orderBy: { createdAt: 'desc' },
      },
      User: {
        select: {
          firstname: true,
          lastname: true,
          email: true,
        },
      },
    },
  })
}

export const createSellerProfile = async (
  clerkId: string,
  stripeAccountId: string
) => {
  // First find the user by clerkId to get the UUID
  const user = await client.user.findUnique({
    where: { clerkId },
    select: { id: true },
  })

  if (!user) throw new Error('User not found')

  return await client.sellerProfile.create({
    data: {
      userId: user.id,
      stripeAccountId,
      onboardingComplete: false,
    },
  })
}

export const updateSellerProfile = async (
  clerkId: string,
  data: {
    stripeAccountId?: string
    onboardingComplete?: boolean
  }
) => {
  // First find the user by clerkId to get the UUID
  const user = await client.user.findUnique({
    where: { clerkId },
    select: { id: true },
  })

  if (!user) throw new Error('User not found')

  return await client.sellerProfile.update({
    where: { userId: user.id },
    data,
  })
}

export const findSellerByStripeAccountId = async (stripeAccountId: string) => {
  return await client.sellerProfile.findUnique({
    where: { stripeAccountId },
  })
}

export const updateSellerOnboardingByStripeId = async (
  stripeAccountId: string,
  onboardingComplete: boolean
) => {
  return await client.sellerProfile.update({
    where: { stripeAccountId },
    data: { onboardingComplete },
  })
}

// ============================================================================
// PRODUCT QUERIES
// ============================================================================

export const createProduct = async (data: {
  name: string
  description: string
  price: number
  category: ProductCategory
  content: any
  sellerId: string
  thumbnail?: string
  images?: string[]
  stripeProductId?: string
  stripePriceId?: string
}) => {
  return await client.product.create({
    data,
  })
}

export const updateProduct = async (
  productId: string,
  data: {
    name?: string
    description?: string
    price?: number
    category?: ProductCategory
    content?: any
    active?: boolean
    thumbnail?: string
    images?: string[]
  }
) => {
  return await client.product.update({
    where: { id: productId },
    data,
  })
}

export const deleteProduct = async (productId: string) => {
  return await client.product.delete({
    where: { id: productId },
  })
}

export const findProduct = async (productId: string) => {
  return await client.product.findUnique({
    where: { id: productId },
    include: {
      SellerProfile: {
        include: {
          User: {
            select: {
              firstname: true,
              lastname: true,
            },
          },
        },
      },
      reviews: {
        include: {
          User: {
            select: {
              firstname: true,
              lastname: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

export const getAllProducts = async (filters?: {
  category?: string
  sellerId?: string
  active?: boolean
  search?: string
  minPrice?: number
  maxPrice?: number
  sort?: string
  featured?: boolean
  limit?: number
}) => {
  const where: any = {
    active: filters?.active ?? true,
  }

  // Category filter
  if (filters?.category && filters.category !== 'all') {
    where.category = filters.category
  }

  // Seller filter
  if (filters?.sellerId) {
    where.sellerId = filters.sellerId
  }

  // Featured filter
  if (filters?.featured !== undefined) {
    where.featured = filters.featured
  }

  // Search filter
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { tags: { has: filters.search.toLowerCase() } },
    ]
  }

  // Price range filter
  if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
    where.price = {}
    if (filters.minPrice !== undefined) {
      where.price.gte = filters.minPrice * 100 // Convert to cents
    }
    if (filters.maxPrice !== undefined) {
      where.price.lte = filters.maxPrice * 100 // Convert to cents
    }
  }

  // Sorting
  let orderBy: any = [{ featured: 'desc' }]
  
  switch (filters?.sort) {
    case 'popular':
      orderBy.push({ salesCount: 'desc' })
      break
    case 'price-low':
      orderBy.push({ price: 'asc' })
      break
    case 'price-high':
      orderBy.push({ price: 'desc' })
      break
    case 'rating':
      orderBy.push({ rating: 'desc' })
      break
    case 'newest':
    default:
      orderBy.push({ createdAt: 'desc' })
      break
  }

  return await client.product.findMany({
    where,
    include: {
      SellerProfile: {
        include: {
          User: {
            select: {
              firstname: true,
              lastname: true,
            },
          },
        },
      },
    },
    orderBy,
    take: filters?.limit,
  })
}

export const incrementProductViews = async (productId: string) => {
  return await client.product.update({
    where: { id: productId },
    data: {
      views: {
        increment: 1,
      },
    },
  })
}

// ============================================================================
// PURCHASE QUERIES
// ============================================================================

export const createPurchase = async (data: {
  userId: string
  productId: string
  stripePaymentId: string
  amount: number
  platformFee: number
  sellerPayout: number
}) => {
  const refundableUntil = new Date()
  refundableUntil.setDate(refundableUntil.getDate() + 7) // 7-day refund window

  return await client.purchase.create({
    data: {
      ...data,
      status: 'COMPLETED',
      refundableUntil,
    },
  })
}

export const findPurchase = async (purchaseId: string) => {
  return await client.purchase.findUnique({
    where: { id: purchaseId },
    include: {
      Product: true,
      User: {
        select: {
          firstname: true,
          lastname: true,
          email: true,
        },
      },
    },
  })
}

export const findPurchaseByPaymentId = async (stripePaymentId: string) => {
  return await client.purchase.findUnique({
    where: { stripePaymentId },
    include: {
      Product: true,
    },
  })
}

export const getUserPurchases = async (clerkId: string) => {
  // First find the user by clerkId to get the UUID
  const user = await client.user.findUnique({
    where: { clerkId },
    select: { id: true },
  })

  if (!user) return []

  return await client.purchase.findMany({
    where: { userId: user.id },
    include: {
      Product: {
        include: {
          SellerProfile: {
            include: {
              User: {
                select: {
                  firstname: true,
                  lastname: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export const markPurchaseAsApplied = async (purchaseId: string) => {
  return await client.purchase.update({
    where: { id: purchaseId },
    data: {
      applied: true,
      appliedAt: new Date(),
    },
  })
}

export const updatePurchaseStatus = async (
  purchaseId: string,
  status: PurchaseStatus
) => {
  return await client.purchase.update({
    where: { id: purchaseId },
    data: { status },
  })
}

// ============================================================================
// REVIEW QUERIES
// ============================================================================

export const createReview = async (data: {
  productId: string
  userId: string
  rating: number
  comment?: string
}) => {
  const review = await client.review.create({
    data,
  })

  // Update product rating
  const reviews = await client.review.findMany({
    where: { productId: data.productId },
  })

  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  await client.product.update({
    where: { id: data.productId },
    data: { rating: avgRating },
  })

  return review
}

export const getProductReviews = async (productId: string) => {
  return await client.review.findMany({
    where: { productId },
    include: {
      User: {
        select: {
          firstname: true,
          lastname: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// ============================================================================
// STATS QUERIES
// ============================================================================

export const updateSellerStats = async (sellerId: string) => {
  const purchases = await client.purchase.findMany({
    where: {
      Product: {
        sellerId,
      },
      status: 'COMPLETED',
    },
  })

  const totalSales = purchases.length
  const totalRevenue = purchases.reduce((sum, p) => sum + p.sellerPayout, 0)

  return await client.sellerProfile.update({
    where: { id: sellerId },
    data: {
      totalSales,
      totalRevenue,
    },
  })
}

export const incrementProductSales = async (productId: string) => {
  return await client.product.update({
    where: { id: productId },
    data: {
      salesCount: {
        increment: 1,
      },
    },
  })
}

// Get seller revenue data for charts
export const getSellerRevenueData = async (sellerId: string) => {
  // Get purchases from last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const purchases = await client.purchase.findMany({
    where: {
      Product: {
        sellerId,
      },
      status: 'COMPLETED',
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    include: {
      Product: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  // Group by day
  const revenueByDay: { [key: string]: { revenue: number; sales: number } } = {}
  
  // Initialize last 7 days
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayName = days[date.getDay()]
    revenueByDay[dayName] = { revenue: 0, sales: 0 }
  }

  // Aggregate purchases by day
  purchases.forEach((purchase: any) => {
    const dayName = days[purchase.createdAt.getDay()]
    if (revenueByDay[dayName]) {
      revenueByDay[dayName].revenue += purchase.sellerPayout / 100 // Convert to dollars
      revenueByDay[dayName].sales += 1
    }
  })

  // Convert to array format for chart
  return Object.entries(revenueByDay).map(([date, data]) => ({
    date,
    revenue: Math.round(data.revenue * 100) / 100, // Round to 2 decimals
    sales: data.sales,
  }))
}
