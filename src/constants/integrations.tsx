import { InstagramDuoToneBlue, SalesForceDuoToneBlue } from "@/icons"
import { Store, CreditCard } from "lucide-react"

type Props = {
  title: string
  icon: React.ReactNode
  description: string
  strategy: 'INSTAGRAM' | 'CRM' | 'MARKETPLACE' | 'STRIPE_CONNECT'
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
    title: 'Connect Stripe for Payouts',
    description:
      'Connect your Stripe account to receive automatic payouts from Cold Call deals. Get paid instantly when clients purchase websites.',
    icon: <CreditCard className="h-10 w-10 text-purple-500" />,
    strategy: 'STRIPE_CONNECT',
  },
  {
    title: 'Become a Seller',
    description:
      'Start selling automation templates and digital products in our marketplace. Earn 90% on every sale with Stripe Connect.',
    icon: <Store className="h-10 w-10 text-blue-500" />,
    strategy: 'MARKETPLACE',
  },
]
