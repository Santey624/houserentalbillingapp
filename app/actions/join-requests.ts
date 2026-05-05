'use server'

import { after } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { JoinRequestSchema } from '@/lib/validations'
import { createNotification } from './notifications'
import { sendJoinRequestNotification, sendJoinRequestResult } from '@/lib/email'

type ActionState = { errors?: Record<string, string[]>; message?: string } | null

export async function submitJoinRequestAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole('TENANT')
  const tenant = await db.tenant.findUnique({ where: { userId: session.user.id } })
  if (!tenant) return { errors: { _: ['Tenant profile not found'] } }

  const parsed = JoinRequestSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }

  // Check for existing pending request to same building
  const existing = await db.joinRequest.findFirst({
    where: { tenantId: tenant.id, buildingId: parsed.data.buildingId, status: 'PENDING' },
  })
  if (existing) return { errors: { _: ['You already have a pending request for this building.'] } }

  const request = await db.joinRequest.create({
    data: {
      tenantId: tenant.id,
      buildingId: parsed.data.buildingId,
      unitId: parsed.data.unitId || null,
      note: parsed.data.note,
    },
    include: { building: { include: { landlord: { include: { user: true } } } } },
  })

  const landlordEmail = request.building.landlord.user.email
  const landlordUserId = request.building.landlord.user.id
  const tenantName = tenant.displayName

  after(async () => {
    await createNotification(
      landlordUserId,
      'JOIN_REQUEST',
      `${tenantName} has requested to join ${request.building.name}`,
      '/landlord/join-requests'
    )
    await sendJoinRequestNotification(landlordEmail, tenantName)
  })

  revalidatePath('/tenant/buildings')
  return { message: 'Join request submitted! Waiting for landlord approval.' }
}

export async function approveJoinRequestAction(requestId: string): Promise<void> {
  const session = await requireRole('LANDLORD')
  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
  if (!landlord) throw new Error('Landlord not found')

  const request = await db.joinRequest.findFirst({
    where: { id: requestId },
    include: {
      building: true,
      tenant: { include: { user: true } },
    },
  })
  if (!request || request.building.landlordId !== landlord.id) throw new Error('Request not found')

  // Create tenancy
  await db.$transaction([
    db.joinRequest.update({ where: { id: requestId }, data: { status: 'APPROVED' } }),
    db.tenancy.create({
      data: {
        tenantId: request.tenantId,
        unitId: request.unitId!,
        status: 'ACTIVE',
      },
    }),
  ])

  const tenantEmail = request.tenant.user.email
  const tenantUserId = request.tenant.user.id
  const buildingName = request.building.name

  after(async () => {
    await createNotification(
      tenantUserId,
      'JOIN_APPROVED',
      `Your request to join ${buildingName} has been approved!`,
      '/tenant'
    )
    await sendJoinRequestResult(tenantEmail, true, buildingName)
  })

  revalidatePath('/landlord/join-requests')
}

export async function rejectJoinRequestAction(requestId: string): Promise<void> {
  const session = await requireRole('LANDLORD')
  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
  if (!landlord) throw new Error('Landlord not found')

  const request = await db.joinRequest.findFirst({
    where: { id: requestId },
    include: {
      building: true,
      tenant: { include: { user: true } },
    },
  })
  if (!request || request.building.landlordId !== landlord.id) throw new Error('Request not found')

  await db.joinRequest.update({ where: { id: requestId }, data: { status: 'REJECTED' } })

  const tenantEmail = request.tenant.user.email
  const tenantUserId = request.tenant.user.id
  const buildingName = request.building.name

  after(async () => {
    await createNotification(
      tenantUserId,
      'JOIN_REJECTED',
      `Your request to join ${buildingName} was not approved.`,
      '/tenant/buildings'
    )
    await sendJoinRequestResult(tenantEmail, false, buildingName)
  })

  revalidatePath('/landlord/join-requests')
}
