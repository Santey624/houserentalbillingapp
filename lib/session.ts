import { cache } from 'react'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

/**
 * Memoized per-request — calling this from both layout and page costs only
 * one JWT decode, not two.
 */
export const getSession = cache(auth)

/**
 * Returns { session, landlord } with only the fields pages actually need.
 * Memoized per-request: the DB is only hit once even if called from multiple
 * server components in the same render tree.
 */
export const getLandlord = cache(async () => {
  const session = await getSession()
  if (!session?.user) redirect('/auth/signin')

  const landlord = await db.landlord.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      displayName: true,
      onboardingDone: true,
      electricityRate: true,
      paymentDueDay: true,
      address: true,
      contact: true,
    },
  })

  if (!landlord) redirect('/auth/signin')
  return { session, landlord }
})
