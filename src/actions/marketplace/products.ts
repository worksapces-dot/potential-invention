'use server'

import { onCurrentUser } from '../user'
import { stripe } from '@/lib/stripe'
import {
  createProduct,
  updateProduct,
  deleteProduct,
  findProduct,
  getAllProducts,
  findSellerProfile,
  incrementProductViews,
} from './queries'
// import { ProductCategory } from '@prisma/client'
type ProductCategory = 'AUTOMATION_TEMPLATE' | 'AI_PROMPT_PACK' | 'KEYWORD_LIST' | 'ANALYTICS_TEMPLATE' | 'INTEGRATION_CONFIG'

export const onCreateProduct = async (data: {
  name: string
  description: string
  price: number // in dollars
  category: ProductCategory
  content: any
  thumbnail?: string
  images?: string[]
}) => {
  const user = await onCurrentUser()

  try {
    console.log('Creating product for user:', user.id)
    
    // Check if user is a seller
    const sellerProfile = await findSellerProfile(user.id)
    console.log('Seller profile:', sellerProfile?.id, 'Onboarding complete:', sellerProfile?.onboardingComplete)
    
    if (!sellerProfile) {
      return {
        status: 403,
        message: 'You need to become a seller first',
      }
    }
    
    if (!sellerProfile.onboardingComplete) {
      return {
        status: 403,
        message: 'Complete seller onboarding first',
      }
    }

    console.log('Creating Stripe product...')
    
    // Create Stripe product
    const stripeProduct = await stripe.products.create({
      name: data.name,
      description: data.description,
      metadata: {
        category: data.category,
        sellerId: sellerProfile.id,
      },
    })

    console.log('Stripe product created:', stripeProduct.id)

    // Create Stripe price (in cents)
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(data.price * 100), // Convert to cents
      currency: 'usd',
    })

    console.log('Stripe price created:', stripePrice.id)

    // Create product in database
    const product = await createProduct({
      name: data.name,
      description: data.description,
      price: Math.round(data.price * 100), // Store in cents
      category: data.category,
      content: data.content,
      sellerId: sellerProfile.id,
      thumbnail: data.thumbnail,
      images: data.images,
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id,
    })

    console.log('Product created in DB:', product.id)

    return { status: 201, data: product }
  } catch (error: any) {
    console.error('Error creating product:', error)
    return { status: 500, message: error.message || 'Failed to create product' }
  }
}

export const onUpdateProduct = async (
  productId: string,
  data: {
    name?: string
    description?: string
    price?: number // in dollars
    category?: ProductCategory
    content?: any
    active?: boolean
    thumbnail?: string
    images?: string[]
  }
) => {
  const user = await onCurrentUser()

  try {
    // Verify ownership
    const product = await findProduct(productId)
    if (!product) {
      return { status: 404, message: 'Product not found' }
    }

    const sellerProfile = await findSellerProfile(user.id)
    if (!sellerProfile || product.sellerId !== sellerProfile.id) {
      return { status: 403, message: 'Not authorized' }
    }

    // Update Stripe product if needed
    if (data.name || data.description || data.images) {
      await stripe.products.update(product.stripeProductId!, {
        name: data.name,
        description: data.description,
        images: data.images,
      })
    }

    // Update Stripe price if price changed
    if (data.price && data.price !== product.price / 100) {
      // Archive old price
      await stripe.prices.update(product.stripePriceId!, { active: false })

      // Create new price
      const newPrice = await stripe.prices.create({
        product: product.stripeProductId!,
        unit_amount: Math.round(data.price * 100),
        currency: 'usd',
      })

      data.price = Math.round(data.price * 100) // Convert to cents
      await updateProduct(productId, {
        ...data,
        stripePriceId: newPrice.id,
      } as any)
    } else {
      // Update without price change
      const updateData = { ...data }
      if (updateData.price) {
        updateData.price = Math.round(updateData.price * 100)
      }
      await updateProduct(productId, updateData as any)
    }

    return { status: 200, message: 'Product updated' }
  } catch (error) {
    console.error('Error updating product:', error)
    return { status: 500, message: 'Failed to update product' }
  }
}

export const onDeleteProduct = async (productId: string) => {
  const user = await onCurrentUser()

  try {
    const product = await findProduct(productId)
    if (!product) {
      return { status: 404, message: 'Product not found' }
    }

    const sellerProfile = await findSellerProfile(user.id)
    if (!sellerProfile || product.sellerId !== sellerProfile.id) {
      return { status: 403, message: 'Not authorized' }
    }

    // Archive Stripe product
    if (product.stripeProductId) {
      await stripe.products.update(product.stripeProductId, { active: false })
    }

    // Soft delete - just mark as inactive
    await updateProduct(productId, { active: false })

    return { status: 200, message: 'Product deleted' }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { status: 500, message: 'Failed to delete product' }
  }
}

export const onGetProduct = async (productId: string) => {
  try {
    const product = await findProduct(productId)
    if (!product) {
      return { status: 404, message: 'Product not found' }
    }

    // Increment views
    await incrementProductViews(productId)

    return { status: 200, data: product }
  } catch (error) {
    console.error('Error getting product:', error)
    return { status: 500 }
  }
}

export const onGetAllProducts = async (filters?: {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  sort?: string
  featured?: boolean
  limit?: number
}) => {
  try {
    const products = await getAllProducts({
      active: true,
      ...filters,
    })

    return { status: 200, data: products }
  } catch (error) {
    console.error('Error getting products:', error)
    return { status: 500, data: [] }
  }
}

export const onGetMyProducts = async () => {
  const user = await onCurrentUser()

  try {
    const sellerProfile = await findSellerProfile(user.id)
    if (!sellerProfile) {
      return { status: 404, data: [] }
    }

    const products = await getAllProducts({
      sellerId: sellerProfile.id,
    })

    return { status: 200, data: products }
  } catch (error) {
    console.error('Error getting my products:', error)
    return { status: 500, data: [] }
  }
}
