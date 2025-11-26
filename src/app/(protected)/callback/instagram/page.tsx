import { onIntegrate } from '@/actions/integrations'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  searchParams: {
    code: string
  }
}

const Page = async ({ searchParams: { code } }: Props) => {
  if (!code) {
    return redirect('/sign-up?error=instagram_no_code')
  }

  try {
    const result = await onIntegrate(code.split('#_')[0])

    if (result.status === 200) {
      return redirect('/integrations')
    }

    // Non-success statuses: 401, 404, 409, 500, etc.
    return redirect(`/sign-up?error=instagram_${result.status}`)
  } catch (err) {
    console.log('🔴 Instagram callback failed', err)
    return redirect('/sign-up?error=instagram_exception')
  }
}

export default Page
