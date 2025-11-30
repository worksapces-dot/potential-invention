'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Bell, MessageCircle, Zap, CheckCircle, Settings, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { usePaths } from '@/hooks/user-nav'
import { getNotifications, markAsRead, markAllAsRead } from '@/actions/notifications'
import { formatDistanceToNow } from 'date-fns'

type NotificationType = 'DM_SENT' | 'COMMENT_REPLY' | 'AUTOMATION_TRIGGER' | 'SYSTEM' | 'UPGRADE'

type Notification = {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  linkUrl: string | null
  createdAt: Date
}

const iconMap: Record<NotificationType, typeof MessageCircle> = {
  DM_SENT: MessageCircle,
  COMMENT_REPLY: MessageCircle,
  AUTOMATION_TRIGGER: Zap,
  SYSTEM: CheckCircle,
  UPGRADE: TrendingUp,
}

const colorMap: Record<NotificationType, string> = {
  DM_SENT: 'bg-blue-500/20 text-blue-500',
  COMMENT_REPLY: 'bg-purple-500/20 text-purple-500',
  AUTOMATION_TRIGGER: 'bg-yellow-500/20 text-yellow-500',
  SYSTEM: 'bg-green-500/20 text-green-500',
  UPGRADE: 'bg-orange-500/20 text-orange-500',
}

export const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const { pathname } = usePaths()
  
  const unreadCount = notifications.filter(n => !n.read).length
  const basePath = pathname.split('/').slice(0, 3).join('/')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    const result = await getNotifications(20)
    if (result.status === 200) {
      setNotifications(result.data as Notification[])
    }
    setLoading(false)
  }

  const handleMarkAllRead = async () => {
    await markAllAsRead()
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="bg-white rounded-full py-6 relative">
          <Bell color="#3352CC" fill="#3352CC" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = iconMap[notification.type] || CheckCircle
              const colorClass = colorMap[notification.type] || 'bg-gray-500/20 text-gray-500'
              
              return (
                <div
                  key={notification.id}
                  onClick={() => handleMarkAsRead(notification.id)}
                  className={`flex gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer border-b border-border last:border-0 ${
                    !notification.read ? 'bg-muted/30' : ''
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{notification.title}</p>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-3">
          <Link 
            href={`${basePath}/settings`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-3 w-3" />
            Notification settings
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
