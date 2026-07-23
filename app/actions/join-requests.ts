'use server'

import { after } from 'next/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { JoinRequestSchema } from '@/lib/validations'
import { createNotification } from './notifications'
import { sendJoinRequestNotification, sendJoinRequestResult } from '@/lib/email'
import { Prisma } from '@prisma/client'
import { unitBelongsToBuilding } from '@/lib/authorization'

type ActionState = { errors?: Record<string, string[]>; message?: string } | null

function failApprove(message: string): never {
  redirect(`/landlord/join-requests?error=${encodeURIComponent(message)}`)
}

export async function submitJoinRequestAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole('TENANT')
  const tenant = await db.tenant.findUnique({ where: { userId: session.user.id } })
  if (!tenant) return { errors: { _: ['Tenant profile not found'] } }

  const parsed = JoinRequestSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }

  const building = await db.building.findFirst({
    where: { id: parsed.data.buildingId, isOpen: true },
    select: { id: true },
  })
  if (!building) return { errors: { buildingId: ['Building not found'] } }

  if (parsed.data.unitId) {
    const unit = await db.unit.findFirst({
      where: { id: parsed.data.unitId, buildingId: building.id },
      select: { id: true, buildingId: true },
    })
    if (!unitBelongsToBuilding(unit, building.id)) {
      return { errors: { unitId: ['Unit does not belong to this building.'] } }
    }
  }

  const existing = await db.joinRequest.findFirst({
    where: { tenantId: tenant.id, buildingId: parsed.data.buildingId, status: 'PENDING' },
  })
  if (existing) return { errors: { _: ['You already have a pending request for this building.'] } }

  let request
  try {
    request = await db.joinRequest.create({
      data: {
        tenantId: tenant.id,
        buildingId: parsed.data.buildingId,
        unitId: parsed.data.unitId || null,
        note: parsed.data.note,
      },
      include: { building: { include: { landlord: { include: { user: true } } } } },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { errors: { _: ['You already have a pending request for this building.'] } }
    }
    throw error
  }

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

export async function approveJoinRequestAction(formData: FormData): Promise<void> {
  const requestId = String(formData.get('requestId') ?? '')
  const selectedUnitId = String(formData.get('unitId') ?? '').trim() || null
  const newUnitNumber = String(formData.get('newUnitNumber') ?? '').trim() || null

  // #region agent log
  fetch('http://127.0.0.1:7593/ingest/befd32db-d4a6-43bd-be73-44f8795636bc',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c130cd'},body:JSON.stringify({sessionId:'c130cd',runId:'assign-unit',hypothesisId:'A',location:'join-requests.ts:approve:entry',message:'approve with assign/create unit',data:{hasSelectedUnitId:Boolean(selectedUnitId),hasNewUnitNumber:Boolean(newUnitNumber)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  const session = await requireRole('LANDLORD')
  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
  if (!landlord) failApprove('Landlord profile not found.')

  const request = await db.joinRequest.findFirst({
    where: { id: requestId },
    include: {
      building: true,
      unit: { select: { id: true, buildingId: true } },
      tenant: { include: { user: true } },
    },
  })
  if (!request || request.building.landlordId !== landlord.id) {
    failApprove('Join request not found.')
  }

  if (request.status !== 'PENDING') {
    failApprove('This join request is no longer valid.')
  }

  let unitId = request.unitId ?? selectedUnitId

  try {
    await db.$transaction(async (tx) => {
      if (!unitId) {
        if (!newUnitNumber) {
          throw new Error('Select a unit or enter a new unit number before approving.')
        }

        const created = await tx.unit.create({
          data: {
            buildingId: request.buildingId,
            unitNumber: newUnitNumber,
          },
          select: { id: true },
        })
        unitId = created.id
      } else {
        const unit = await tx.unit.findFirst({
          where: { id: unitId, buildingId: request.buildingId },
          select: { id: true, buildingId: true },
        })
        if (!unitBelongsToBuilding(unit, request.buildingId)) {
          throw new Error('Selected unit does not belong to this building.')
        }

        const existingTenancy = await tx.tenancy.findFirst({
          where: { unitId, status: 'ACTIVE' },
        })
        if (existingTenancy) {
          throw new Error('This unit already has an active tenant. End the existing tenancy first.')
        }
      }

      const transitioned = await tx.joinRequest.updateMany({
        where: {
          id: requestId,
          status: 'PENDING',
          buildingId: request.buildingId,
        },
        data: { status: 'APPROVED', unitId },
      })
      if (transitioned.count !== 1) {
        throw new Error('This join request is no longer valid.')
      }

      await tx.tenancy.create({
        data: {
          tenantId: request.tenantId,
          unitId,
          status: 'ACTIVE',
        },
      })
    })
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7593/ingest/befd32db-d4a6-43bd-be73-44f8795636bc',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c130cd'},body:JSON.stringify({sessionId:'c130cd',runId:'assign-unit',hypothesisId:'D',location:'join-requests.ts:approve:catch',message:'approve failed',data:{errorMessage:error instanceof Error?error.message.slice(0,180):'unknown',prismaCode:error instanceof Prisma.PrismaClientKnownRequestError?error.code:null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      failApprove('That unit number already exists or the unit is already occupied.')
    }
    if (error instanceof Error) {
      failApprove(error.message)
    }
    failApprove('Could not approve this join request. Please try again.')
  }

  // #region agent log
  fetch('http://127.0.0.1:7593/ingest/befd32db-d4a6-43bd-be73-44f8795636bc',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c130cd'},body:JSON.stringify({sessionId:'c130cd',runId:'assign-unit',hypothesisId:'E',location:'join-requests.ts:approve:success',message:'approve succeeded',data:{ok:true},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

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

  revalidatePath('/landlord')
  revalidatePath('/landlord/join-requests')
  revalidatePath('/landlord/tenants')
  revalidatePath(`/landlord/buildings/${request.buildingId}`)
  redirect('/landlord/join-requests?approved=1')
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

  revalidatePath('/landlord')
  revalidatePath('/landlord/join-requests')
}
