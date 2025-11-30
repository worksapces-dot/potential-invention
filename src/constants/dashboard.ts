import { v4 } from 'uuid'

type Props = {
  id: string
  label: string
  subLabel: string
  description: string
  href: string
}

export const DASHBOARD_CARDS: Props[] = [
  {
    id: v4(),
    label: 'Create Automation',
    subLabel: 'Set up keyword triggers and auto-replies',
    description: 'Respond to DMs and comments automatically',
    href: 'automations',
  },
  {
    id: v4(),
    label: 'AI Smart Replies',
    subLabel: 'Let AI craft personalized responses',
    description: 'Human-like conversations at scale',
    href: 'automations',
  },
  {
    id: v4(),
    label: 'Cold Outreach',
    subLabel: 'Find leads and close deals',
    description: 'AI-powered prospect discovery',
    href: 'cold-call',
  },
]
