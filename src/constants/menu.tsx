import {
  AutomationDuoToneWhite,
  HomeDuoToneWhite,
  RocketDuoToneWhite,
  SettingsDuoToneWhite,
  BarDuoToneBlue,
  PhoneCallDuoToneWhite,
} from '@/icons'
import { v4 as uuid } from 'uuid'

export type FieldProps = {
  label: string
  id: string
}

export type UserType = 'CREATOR' | 'COLD_CALLER' | 'BOTH' | null

type SideBarProps = {
  icon: React.ReactNode
  // Which user types can see this menu item
  allowedTypes: ('CREATOR' | 'COLD_CALLER' | 'BOTH' | 'ALL')[]
} & FieldProps

export const SIDEBAR_MENU: SideBarProps[] = [
  {
    id: uuid(),
    label: 'home',
    icon: <HomeDuoToneWhite />,
    allowedTypes: ['ALL'],
  },
  {
    id: uuid(),
    label: 'automations',
    icon: <AutomationDuoToneWhite />,
    allowedTypes: ['CREATOR', 'BOTH'],
  },
  {
    id: uuid(),
    label: 'integrations',
    icon: <RocketDuoToneWhite />,
    allowedTypes: ['CREATOR', 'BOTH'],
  },
  {
    id: uuid(),
    label: 'analytics',
    icon: <BarDuoToneBlue />,
    allowedTypes: ['ALL'],
  },
  {
    id: uuid(),
    label: 'cold-call',
    icon: <PhoneCallDuoToneWhite />,
    allowedTypes: ['COLD_CALLER', 'BOTH'],
  },
  {
    id: uuid(),
    label: 'settings',
    icon: <SettingsDuoToneWhite />,
    allowedTypes: ['ALL'],
  },
]

export function getFilteredMenu(userType: UserType) {
  if (!userType) return SIDEBAR_MENU // Show all if not set
  
  return SIDEBAR_MENU.filter((item) => {
    if (item.allowedTypes.includes('ALL')) return true
    if (userType === 'BOTH') return true
    return item.allowedTypes.includes(userType)
  })
}
