import FeatureRequestDetail from '@/components/feedback/feature-request-detail'
import React from 'react'

type Props = {
  params: {
    id: string
    slug: string
  }
}

const FeatureRequestPage = ({ params }: Props) => {
  return <FeatureRequestDetail featureId={params.id} />
}

export default FeatureRequestPage