import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { markAllReadAction } from '@/app/actions/notifications'
import NotificationList from '@/components/shared/NotificationList'
import { Bell } from 'lucide-react'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const unreadCount = notifications.filter((n: (typeof notifications)[number]) => !n.isRead).length

  return (
    <div className="min-h-screen bg-background p-5 sm:p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl text-foreground mb-1">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-3 inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full text-xs font-semibold gradient-bg text-white">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <form action={markAllReadAction}>
            <button type="submit" className="text-sm text-accent hover:underline underline-offset-2">
              Mark all read
            </button>
          </form>
        )}
      </div>

      <NotificationList notifications={notifications} />
    </div>
  )
}
