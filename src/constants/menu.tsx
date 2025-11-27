import {
  AutomationDuoToneWhite,
  HomeDuoToneWhite,
  RocketDuoToneWhite,
  SettingsDuoToneWhite,
  BarDuoToneBlue,
  BriefCaseDuoToneWhite,
} from '@/icons'
import { Lightbulb } from 'lucide-react'
import { v4 as uuid } from 'uuid'

export type FieldProps = {
  label: string
  id: string
}

type SideBarProps = {
  icon: React.ReactNode
} & FieldProps

export const SIDEBAR_MENU: SideBarProps[] = [
  {
    id: uuid(),
    label: 'home',
    icon: <HomeDuoToneWhite />,
  },
  {
    id: uuid(),
    label: 'automations',
    icon: <AutomationDuoToneWhite />,
  },
  {
    id: uuid(),
    label: 'integrations',
    icon: <RocketDuoToneWhite />,
  },
  {
    id: uuid(),
    label: 'analytics',
    icon: <BarDuoToneBlue />,
  },
  {
    id: uuid(),
    label: 'marketplace',
    icon: <BriefCaseDuoToneWhite />,
  },
  {
    id: uuid(),
    label: 'feedback',
    icon: <Lightbulb className="h-5 w-5" />,
  },
  {
    id: uuid(),
    label: 'settings',
    icon: <SettingsDuoToneWhite />,
  },
]
