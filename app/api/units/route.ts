import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getLandlord } from '@/lib/session'

export async function GET() {
  try {
    const { landlord } = await getLandlord()

    if (!landlord) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const units = await db.unit.findMany({
      where: {
        building: { landlordId: landlord.id },
      },
      include: {
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
      ]
    })

    return NextResponse.json(units)
  } catch (error) {
    console.error('Failed to fetch units:', error)
    return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 })
  }
}
