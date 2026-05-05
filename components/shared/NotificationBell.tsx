import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'

export default async function NotificationBell() {
  const session = await auth()
  if (!session?.user) return null

  const unreadCount = await db.notification.count({
    where: { userId: session.user.id, isRead: false },
  })

  return (
    <Link href="/notifications" className="relative inline-flex items-center">
      <span className="text-xl">🔔</span>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  )
}
