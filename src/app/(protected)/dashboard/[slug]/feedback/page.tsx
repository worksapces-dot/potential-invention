import FeedbackDashboard from '@/components/feedback/feedback-dashboard'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Feedback',
  description: 'Share your feedback and help us improve Slide.',
}

type Props = {}

const FeedbackPage = (props: Props) => {
  return <FeedbackDashboard />
}

export default FeedbackPage