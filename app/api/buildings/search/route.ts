import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? ''

  const buildings = await db.building.findMany({
    where: {
      isOpen: true,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { landlord: { displayName: { contains: q, mode: 'insensitive' } } },
        { address: { contains: q, mode: 'insensitive' } },
      ],
    },
    include: {
      landlord: { select: { displayName: true } },
      units: {
        include: { tenancies: { where: { status: 'ACTIVE' } } },
      },
    },
    take: 20,
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ buildings })
}
