import { InstagramDuoToneBlue, SalesForceDuoToneBlue } from "@/icons"
import { Store } from "lucide-react"

type Props = {
  title: string
  icon: React.ReactNode
  description: string
  strategy: 'INSTAGRAM' | 'CRM' | 'MARKETPLACE'
}

export const INTEGRATION_CARDS: Props[] = [
  {
    title: 'Connect Instagram',
    description:
      'Lorem ipsum dolor sit amet consectetur. Mauris scelerisque tincidunt ultrices',
    icon: <InstagramDuoToneBlue />,
    strategy: 'INSTAGRAM',
    
  },
  {
    title: 'Connect Salesforce',
    description:
      'Lorem ipsum dolor sit amet consectetur. Mauris scelerisque tincidunt ultrices',
    icon: <SalesForceDuoToneBlue />,
    strategy: 'CRM',
  },
  {
    title: 'Become a Seller',
    description:
      'Start selling automation templates and digital products in our marketplace. Earn 90% on every sale with Stripe Connect.',
    icon: <Store className="h-10 w-10 text-blue-500" />,
    strategy: 'MARKETPLACE',
  },
]
