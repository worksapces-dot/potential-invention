'use server'

import { redirect } from 'next/navigation'
import { onCurrentUser } from '../user'
import { createIntegration, getIntegration } from './queries'
import { generateTokens } from '@/lib/fetch'
import axios from 'axios'
import * as Sentry from '@sentry/nextjs'

export const onOAuthInstagram = (strategy: 'INSTAGRAM' | 'CRM') => {
  if (strategy === 'INSTAGRAM') {
    return redirect(process.env.INSTAGRAM_EMBEDDED_OAUTH_URL as string)
  }
}

export const onDisconnectInstagram = async () => {
  const user = await onCurrentUser()

  try {
    const integration = await getIntegration(user.id)
    
    if (!integration || integration.integrations.length === 0) {
      return { status: 404 }
    }

    const { deleteIntegration } = await import('./queries')
    await deleteIntegration(integration.integrations[0].id)
    
    return { status: 200 }
  } catch (error) {
    console.log('🔴 Disconnect error:', error)
    Sentry.captureException(error)
    return { status: 500 }
  }
}

export const onIntegrate = async (code: string) => {
  const user = await onCurrentUser()

  try {
    const integration = await getIntegration(user.id)
    const existingIntegrations = integration?.integrations ?? []

    if (!integration) {
      console.log('🔴 404 integration user not found', user.id)
      return { status: 404 }
    }

    if (existingIntegrations.length === 0) {
      const token = await generateTokens(code)
      console.log('instagram token response', token)

      if (!token || !token.access_token) {
        console.log('🔴 401 invalid or missing Instagram token')
        return { status: 401 }
      }

      const today = new Date()
      const expire_date = today.setDate(today.getDate() + 60)
      let instagramUserId: string | undefined

      try {
        const insta_id = await axios.get(
          `${process.env.INSTAGRAM_BASE_URL}/me?fields=user_id&access_token=${token.access_token}`
        )

        instagramUserId = insta_id.data.user_id
      } catch (err: any) {
        console.log(
          '🔴 Failed to fetch Instagram user id, proceeding without instagramId',
          err?.response?.data || err
        )
      }

      const create = await createIntegration(
        user.id,
        token.access_token,
        new Date(expire_date),
        instagramUserId
      )
      return { status: 200, data: create }
    }

    console.log('🔴 409 integration already exists for user', user.id)
    return { status: 409 }
  } catch (error) {
    console.log('🔴 500', error)
    Sentry.captureException(error)
    return { status: 500 }
  }
}
