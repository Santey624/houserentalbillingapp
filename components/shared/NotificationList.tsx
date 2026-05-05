'use client'

import Link from 'next/link'
import { markNotificationReadAction } from '@/app/actions/notifications'
import type { Notification } from '@prisma/client'

interface Props {
  notifications: Notification[]
}

export default function NotificationList({ notifications }: Props) {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <div className="text-5xl mb-3">🔔</div>
        <p>No notifications yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
      {notifications.map((n) => (
        <div key={n.id} className={`px-6 py-4 ${n.isRead ? 'opacity-60' : ''}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {n.linkUrl ? (
                <Link href={n.linkUrl} className="text-sm text-gray-900 hover:text-[#0f3460]">
                  {n.message}
                </Link>
              ) : (
                <p className="text-sm text-gray-900">{n.message}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
            {!n.isRead && (
              <form action={markNotificationReadAction.bind(null, n.id)}>
                <button type="submit" className="text-xs text-[#0f3460] hover:underline whitespace-nowrap">
                  Mark read
                </button>
              </form>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
