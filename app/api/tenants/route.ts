import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getLandlord } from '@/lib/session'

export async function GET() {
  try {
    const { landlord } = await getLandlord()

    if (!landlord) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch tenants with active tenancies
    const tenancies = await db.tenancy.findMany({
      where: {
        status: 'ACTIVE',
        unit: { building: { landlordId: landlord.id } }
      },
      select: {
        id: true,
        unitId: true,
        tenant: {
          select: {
            id: true,
            displayName: true,
          }
        },
        unit: {
          select: {
            unitNumber: true,
            building: { select: { name: true } }
          }
        }
      }
    })

    // Fetch tenants with pending join requests
    const pendingRequests = await db.joinRequest.findMany({
      where: {
        status: 'PENDING',
        building: { landlordId: landlord.id }
      },
      select: {
        id: true,
        unitId: true,
        tenant: {
          select: {
            id: true,
            displayName: true,
          }
        },
        building: { select: { name: true } },
        unit: { select: { unitNumber: true } }
      }
    })

    // Combine and format the results
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

    // Fetch all other registered tenants
    const allTenants = await db.tenant.findMany({
      select: {
        id: true,
        displayName: true,
        user: { select: { email: true } },
        tenancies: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            unitId: true,
            unit: {
              select: {
                unitNumber: true,
                building: { select: { name: true, landlordId: true } }
              }
            }
          }
        }
      }
    })

    const tenantsFromAll = allTenants.map(t => {
      const activeTenancy = t.tenancies.find(ten => ten.unit.building.landlordId === landlord.id)
      return {
        id: t.id,
        displayName: t.displayName,
        tenancyId: activeTenancy?.id,
        unitId: activeTenancy?.unitId || null,
        unitInfo: activeTenancy 
          ? `${activeTenancy.unit.building.name} - Unit ${activeTenancy.unit.unitNumber}`
          : t.user.email,
        type: activeTenancy ? 'ACTIVE_TENANT' : 'OTHER_TENANT'
      }
    })

    const combined = [...tenantsFromTenancies, ...tenantsFromRequests, ...tenantsFromAll]

    // Remove duplicates by tenant ID, keeping the most "specific" one (ACTIVE_TENANT > PENDING_REQUEST > OTHER_TENANT)
    const uniqueTenantsMap = new Map()
    for (const t of combined) {
      const existing = uniqueTenantsMap.get(t.id)
      if (!existing || 
          (existing.type === 'OTHER_TENANT' && t.type !== 'OTHER_TENANT') ||
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
