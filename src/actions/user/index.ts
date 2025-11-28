'use server'

import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createUser, findUser, updateSubscription } from './queries'
import { refreshToken, getUserProfile } from '@/lib/fetch'
import { updateIntegration } from '../integrations/queries'
import { stripe } from '@/lib/stripe'
import { cache } from 'react'

// Cache currentUser call per request
export const onCurrentUser = cache(async () => {
  const user = await currentUser()
  if (!user) return redirect('/sign-in')

  return user
})

export const onBoardUser = async () => {
  const user = await onCurrentUser()
  try {
    const found = await findUser(user.id)
    if (found) {
      if (found.integrations.length > 0) {
        const today = new Date()
        const expiresAt = found.integrations[0].expiresAt
        
        // Check if token is expired or will expire soon (within 5 days)
        const isExpired = expiresAt ? expiresAt.getTime() < today.getTime() : false
        const time_left = expiresAt ? expiresAt.getTime() - today.getTime() : 0
        const days = Math.round(time_left / (1000 * 3600 * 24))
        
        if (isExpired || days < 5) {
          console.log('🔄 Token expired or expiring soon, attempting refresh...')

          try {
            const refresh = await refreshToken(found.integrations[0].token)
            
            if (refresh?.access_token) {
              const newExpireDate = new Date()
              newExpireDate.setDate(newExpireDate.getDate() + 60)

              const update_token = await updateIntegration(
                refresh.access_token,
                newExpireDate,
                found.integrations[0].id
              )
              
              if (update_token) {
                console.log('🟢 Token refreshed successfully')
              } else {
                console.log('🔴 Update token failed')
              }
            } else {
              console.log('🔴 Refresh token response invalid:', refresh)
            }
          } catch (refreshError) {
            console.log('🔴 Token refresh failed - user needs to reconnect Instagram:', refreshError)
          }
        }
      }

      return {
        status: 200,
        data: {
          firstname: found.firstname,
          lastname: found.lastname,
        },
      }
    }
    const created = await createUser(
      user.id,
      user.firstName!,
      user.lastName!,
      user.emailAddresses[0].emailAddress
    )
    return { status: 201, data: created }
  } catch (error) {
    console.log(error)
    return { status: 500 }
  }
}

export const onUserInfo = async () => {
  const user = await onCurrentUser()
  try {
    const profile = await findUser(user.id)
    if (profile) return { status: 200, data: profile }

    return { status: 404 }
  } catch (error) {
    return { status: 500 }
  }
}

export const onSubscribe = async (session_id: string) => {
  const user = await onCurrentUser()
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id)
    if (session) {
      const subscribed = await updateSubscription(user.id, {
        customerId: session.customer as string,
        plan: 'PRO',
      })

      if (subscribed) return { status: 200 }
      return { status: 401 }
    }
    return { status: 404 }
  } catch (error) {
    return { status: 500 }
  }
}

export const getInstagramUserProfile = async () => {
  const user = await onCurrentUser()
  try {
    const profile = await findUser(user.id)
    
    if (!profile) {
      console.log('🔴 getInstagramUserProfile: No user profile found')
      return { status: 404 }
    }
    
    if (profile.integrations.length === 0) {
      console.log('🔴 getInstagramUserProfile: No integrations found')
      return { status: 404 }
    }
    
    const token = profile.integrations[0].token
    if (!token) {
      console.log('🔴 getInstagramUserProfile: No token found')
      return { status: 404 }
    }
    
    console.log('🟢 getInstagramUserProfile: Fetching profile with token...')
    const data = await getUserProfile(token)
    console.log('🟢 getInstagramUserProfile: Response:', data)
    
    return { status: 200, data }
  } catch (error: any) {
    console.log('🔴 getInstagramUserProfile error:', error?.response?.data || error?.message || error)
    return { status: 500 }
  }
}
