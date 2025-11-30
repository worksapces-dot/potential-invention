import {
  AutomationDuoToneBlue,
  ContactsDuoToneBlue,
  HomeDuoToneBlue,
  RocketDuoToneBlue,
  SettingsDuoToneWhite,
} from '@/icons'

export const PAGE_BREAD_CRUMBS: string[] = [
  'contacts',
  'automations',
  'integrations',
  'settings',
]

type Props = {
  [page in string]: React.ReactNode
}

export const PAGE_ICON: Props = {
  AUTOMATIONS: <AutomationDuoToneBlue />,
  CONTACTS: <ContactsDuoToneBlue />,
  INTEGRATIONS: <RocketDuoToneBlue />,
  SETTINGS: <SettingsDuoToneWhite />,
  HOME: <HomeDuoToneBlue />,
}

export const PLANS = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    price: '$0',
    features: [
      '1 automation',
      '50 DMs per month',
      'Basic keyword triggers',
      'Comment auto-replies',
    ],
    cta: 'Current Plan',
  },
  {
    name: 'Pro',
    description: 'For serious Instagram growth',
    price: '$29',
    features: [
      'Unlimited automations',
      'Unlimited DMs',
      'AI-powered smart replies',
      'Cold outreach tools',
      'Advanced analytics',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
  },
]
