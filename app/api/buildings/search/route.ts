import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import {
  enforceRateLimit,
  getClientAddress,
  RateLimitExceededError,
} from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.user.role !== 'TENANT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 2 || q.length > 80) {
    return NextResponse.json(
      { error: 'Search query must be between 2 and 80 characters.' },
      { status: 400 }
    )
  }

  try {
    await enforceRateLimit(
      `${session.user.id}:${getClientAddress(request.headers)}`,
      { scope: 'building-search', limit: 30, windowMs: 60 * 1000 }
    )

    const buildings = await db.building.findMany({
      where: {
        isOpen: true,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { landlord: { displayName: { contains: q, mode: 'insensitive' } } },
          { address: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        address: true,
        landlord: { select: { displayName: true } },
        units: {
          select: {
            id: true,
            unitNumber: true,
            _count: { select: { tenancies: { where: { status: 'ACTIVE' } } } },
          },
        },
      },
      take: 20,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      buildings: buildings.map((building) => ({
        ...building,
        units: building.units.map(({ _count, ...unit }) => ({
          ...unit,
          isVacant: _count.tenancies === 0,
        })),
      })),
    })
  } catch (error) {
    if (error instanceof RateLimitExceededError) {
      return NextResponse.json(
        { error: error.message },
        {
          status: 429,
          headers: { 'Retry-After': String(error.retryAfterSeconds) },
        }
      )
    }
    console.error('Building search failed')
    return NextResponse.json({ error: 'Search unavailable' }, { status: 500 })
  }
}
