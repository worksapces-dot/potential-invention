import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { onCreateProduct } from '@/actions/marketplace/products'

export async function POST(req: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    console.log('Create product request:', body)
    
    const { name, description, price, category, content, thumbnail, images } = body

    if (!name || !description || !price || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (price < 1) {
      return NextResponse.json({ error: 'Price must be at least $1.00' }, { status: 400 })
    }

    const result = await onCreateProduct({
      name,
      description,
      price,
      category,
      content: content || {},
      thumbnail,
      images,
    })

    console.log('Create product result:', result)

    if (result.status !== 201) {
      return NextResponse.json({ error: result.message || 'Failed to create product' }, { status: result.status })
    }

    return NextResponse.json({ data: result.data })
  } catch (error: any) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 })
  }
}
