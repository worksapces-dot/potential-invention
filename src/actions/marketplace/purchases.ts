'use server'

import { onCurrentUser } from '../user'
import { getUserPurchases, markPurchaseAsApplied, findPurchase } from './queries'

export const onGetMyPurchases = async () => {
  const user = await onCurrentUser()

  try {
    const purchases = await getUserPurchases(user.id)
    return { status: 200, data: purchases }
  } catch (error) {
    console.error('Error getting purchases:', error)
    return { status: 500, data: [] }
  }
}

export const onApplyTemplate = async (purchaseId: string) => {
  const user = await onCurrentUser()

  try {
    const purchase = await findPurchase(purchaseId)
    
    if (!purchase) {
      return { status: 404, message: 'Purchase not found' }
    }

    // Verify ownership
    const { client } = await import('@/lib/prisma')
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser || purchase.userId !== dbUser.id) {
      return { status: 403, message: 'Not authorized' }
    }

    if (purchase.applied) {
      return { status: 400, message: 'Already applied' }
    }

    // Here you would apply the template to the user's account
    // For now, just mark it as applied
    await markPurchaseAsApplied(purchaseId)

    return { status: 200, message: 'Template applied successfully' }
  } catch (error) {
    console.error('Error applying template:', error)
    return { status: 500, message: 'Failed to apply template' }
  }
}
