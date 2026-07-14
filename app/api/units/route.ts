import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role !== 'LANDLORD') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const landlord = await db.landlord.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!landlord) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const units = await db.unit.findMany({
      where: {
        building: { landlordId: landlord.id },
      },
      select: {
        id: true,
        buildingId: true,
        unitNumber: true,
        building: {
          select: { name: true }
        },
        tenancies: {
          where: { status: 'ACTIVE' },
          select: { id: true, tenant: { select: { displayName: true } } }
        }
      },
      orderBy: [
        { building: { name: 'asc' } },
        { unitNumber: 'asc' }
      ],
      take: 200,
    })

    return NextResponse.json(units)
  } catch (error) {
    console.error('Failed to fetch units:', error)
    return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 })
  }
}
