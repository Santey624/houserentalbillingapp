import { get } from '@vercel/blob'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  canAccessMaintenancePhoto,
  canAccessPaymentProof,
} from '@/lib/authorization'

export async function GET(
  _request: Request,
  context: { params: Promise<{ kind: string; id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { kind, id } = await context.params
  let blobUrl: string | null = null
  let authorized = false

  if (kind === 'payment-proof') {
    const payment = await db.payment.findUnique({
      where: { id },
      select: {
        proofImageUrl: true,
        invoice: {
          select: {
            tenancy: {
              select: {
                tenant: { select: { userId: true } },
                unit: { select: { building: { select: { landlord: { select: { userId: true } } } } } },
              },
            },
          },
        },
      },
    })
    blobUrl = payment?.proofImageUrl ?? null
    authorized = Boolean(payment && canAccessPaymentProof(session.user.id, {
      tenantUserId: payment.invoice.tenancy.tenant.userId,
      landlordUserId: payment.invoice.tenancy.unit.building.landlord.userId,
    }))
  } else if (kind === 'maintenance') {
    const request = await db.maintenanceRequest.findUnique({
      where: { id },
      select: {
        photoUrl: true,
        tenant: {
          select: {
            userId: true,
            tenancies: {
              where: { status: 'ACTIVE' },
              select: { unit: { select: { building: { select: { landlord: { select: { userId: true } } } } } } },
            },
          },
        },
        tenancy: {
          select: {
            unit: { select: { building: { select: { landlord: { select: { userId: true } } } } } },
          },
        },
      },
    })
    blobUrl = request?.photoUrl ?? null
    if (request) {
      const landlordUserIds = request.tenancy
        ? [request.tenancy.unit.building.landlord.userId]
        : request.tenant.tenancies.map(
            (tenancy) => tenancy.unit.building.landlord.userId
          )
      authorized = canAccessMaintenancePhoto(session.user.id, {
        tenantUserId: request.tenant.userId,
        landlordUserIds,
      })
    }
  }

  if (!authorized || !blobUrl) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  const result = await get(blobUrl, { access: 'private', useCache: false })
  if (!result || result.statusCode !== 200) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  return new Response(result.stream, {
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Disposition': 'inline',
      'Content-Length': String(result.blob.size),
      'Content-Type': result.blob.contentType,
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
