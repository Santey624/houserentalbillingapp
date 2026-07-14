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

    const [tenancies, pendingRequests] = await Promise.all([
      db.tenancy.findMany({
        where: {
          status: 'ACTIVE',
          unit: { building: { landlordId: landlord.id } },
        },
        select: {
          id: true,
          unitId: true,
          tenant: { select: { id: true, displayName: true } },
          unit: {
            select: {
              unitNumber: true,
              building: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      db.joinRequest.findMany({
        where: {
          status: 'PENDING',
          building: { landlordId: landlord.id },
        },
        select: {
          id: true,
          unitId: true,
          tenant: { select: { id: true, displayName: true } },
          building: { select: { name: true } },
          unit: { select: { unitNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ])

    const tenantsFromTenancies = tenancies.map(t => ({
      id: t.tenant.id,
      displayName: t.tenant.displayName,
      tenancyId: t.id,
      unitId: t.unitId,
      unitInfo: `${t.unit.building.name} - Unit ${t.unit.unitNumber}`,
      type: 'ACTIVE_TENANT'
    }))

    const tenantsFromRequests = pendingRequests.map(r => ({
      id: r.tenant.id,
      displayName: r.tenant.displayName,
      joinRequestId: r.id,
      unitId: r.unitId,
      unitInfo: r.unit ? `${r.building.name} - Unit ${r.unit.unitNumber}` : `Request for ${r.building.name}`,
      type: 'PENDING_REQUEST'
    }))

    const combined = [...tenantsFromTenancies, ...tenantsFromRequests]

    // Remove duplicates by tenant ID, keeping the most "specific" one (ACTIVE_TENANT > PENDING_REQUEST > OTHER_TENANT)
    const uniqueTenantsMap = new Map()
    for (const t of combined) {
      const existing = uniqueTenantsMap.get(t.id)
      if (!existing || 
          (existing.type === 'PENDING_REQUEST' && t.type === 'ACTIVE_TENANT')) {
        uniqueTenantsMap.set(t.id, t)
      }
    }

    return NextResponse.json(Array.from(uniqueTenantsMap.values()))
  } catch (error) {
    console.error('Failed to fetch tenants:', error)
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 })
  }
}
