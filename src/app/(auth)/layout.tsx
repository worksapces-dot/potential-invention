import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
}

type Props = {
  children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  return (
    <div className="h-screen flex justify-center items-center">{children}</div>
  )
}

export default Layout
