import { SignIn } from '@clerk/nextjs'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Slide account to manage your Instagram automations.',
}

type Props = {}

const Page = (props: Props) => {
  return <SignIn />
}

export default Page
