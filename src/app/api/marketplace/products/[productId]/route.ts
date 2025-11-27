import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { onUpdateProduct, onDeleteProduct } from '@/actions/marketplace/products'

export async function PUT(req: Request, { params }: { params: { productId: string } }) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, price, category, content, active, thumbnail, images } = body

    const result = await onUpdateProduct(params.productId, {
      name,
      description,
      price,
      category,
      content,
      active,
      thumbnail,
      images,
    })

    if (result.status !== 200) {
      return NextResponse.json({ error: result.message }, { status: result.status })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Update product error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { productId: string } }) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await onDeleteProduct(params.productId)

    if (result.status !== 200) {
      return NextResponse.json({ error: result.message }, { status: result.status })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete product error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 })
  }
}