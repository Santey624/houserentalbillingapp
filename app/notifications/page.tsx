import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { markAllReadAction } from '@/app/actions/notifications'
import NotificationList from '@/components/shared/NotificationList'

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
    <div className="min-h-screen bg-gray-50 p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 text-sm bg-red-500 text-white rounded-full px-2 py-0.5">
              {unreadCount}
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <form action={markAllReadAction}>
            <button type="submit" className="text-sm text-[#0f3460] hover:underline">
              Mark all read
            </button>
          </form>
        )}
      </div>

      <NotificationList notifications={notifications} />
    </div>
  )
}
