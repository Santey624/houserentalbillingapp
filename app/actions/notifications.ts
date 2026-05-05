'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function createNotification(userId: string, type: string, message: string, linkUrl?: string) {
  await db.notification.create({
    data: { userId, type, message, linkUrl },
  })
}

export async function markNotificationReadAction(id: string): Promise<void> {
  const session = await requireAuth()
  await db.notification.updateMany({
    where: { id, userId: session.user.id },
    data: { isRead: true },
  })
  revalidatePath('/notifications')
}

export async function markAllReadAction(): Promise<void> {
  const session = await requireAuth()
  await db.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  })
  revalidatePath('/notifications')
}
