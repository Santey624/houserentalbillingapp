'use client'

import Link from 'next/link'
import { markNotificationReadAction } from '@/app/actions/notifications'
import type { Notification } from '@prisma/client'
import { Bell } from 'lucide-react'

interface Props {
  notifications: Notification[]
}

export default function NotificationList({ notifications }: Props) {
  if (notifications.length === 0) {
    return (
      <div className="card-modern flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Bell size={24} className="text-muted-foreground" />
        </div>
        <p className="font-medium text-foreground">No notifications yet</p>
        <p className="text-sm text-muted-foreground mt-1">You are all caught up!</p>
      </div>
    )
  }

  return (
    <div className="card-modern overflow-hidden">
      <div className="divide-y divide-border">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`px-6 py-4 transition-colors hover:bg-muted/50 ${n.isRead ? 'opacity-50' : ''}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {!n.isRead && (
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-accent flex-shrink-0" />
                )}
                <div className={cn('flex-1 min-w-0', n.isRead && 'ml-5')}>
                  {n.linkUrl ? (
                    <Link
                      href={n.linkUrl}
                      className="text-sm text-foreground hover:text-accent transition-colors leading-relaxed"
                    >
                      {n.message}
                    </Link>
                  ) : (
                    <p className="text-sm text-foreground leading-relaxed">{n.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {!n.isRead && (
                <form action={markNotificationReadAction.bind(null, n.id)}>
                  <button
                    type="submit"
                    className="text-xs text-muted-foreground hover:text-accent transition-colors whitespace-nowrap flex-shrink-0"
                  >
                    Mark read
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
