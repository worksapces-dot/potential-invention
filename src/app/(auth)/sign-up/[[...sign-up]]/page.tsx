import { SignUp } from '@clerk/nextjs'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your free Slide account and start automating your Instagram DMs and comments today.',
}

type Props = {}

const Page = (props: Props) => {
  return <SignUp />
}

export default Page
