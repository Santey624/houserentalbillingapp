'use server'

import { after } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { MaintenanceSchema } from '@/lib/validations'
import { uploadBlob } from '@/lib/blob'
import { createNotification } from './notifications'
import { sendMaintenanceNotification, sendMaintenanceStatusUpdate } from '@/lib/email'
import type { MaintenanceStatus } from '@prisma/client'

type ActionState = { errors?: Record<string, string[]>; message?: string } | null

export async function submitMaintenanceRequestAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole('TENANT')
  const tenant = await db.tenant.findUnique({
    where: { userId: session.user.id },
    include: { tenancies: { where: { status: 'ACTIVE' }, include: { unit: { include: { building: { include: { landlord: { include: { user: true } } } } } } } } },
  })
  if (!tenant) return { errors: { _: ['Tenant profile not found'] } }

  const parsed = MaintenanceSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }

  let photoUrl: string | undefined
  const photoFile = formData.get('photo') as File | null
  if (photoFile && photoFile.size > 0) {
    photoUrl = await uploadBlob(photoFile, 'maintenance')
  }

  await db.maintenanceRequest.create({
    data: {
      tenantId: tenant.id,
      title: parsed.data.title,
      description: parsed.data.description,
      photoUrl,
    },
  })

  // Notify all landlords of active tenancies
  const landlords = tenant.tenancies.flatMap((t) => [
    { email: t.unit.building.landlord.user.email, userId: t.unit.building.landlord.user.id },
  ])

  after(async () => {
    for (const landlord of landlords) {
      await createNotification(
        landlord.userId,
        'MAINTENANCE_SUBMITTED',
        `New maintenance request: ${parsed.data.title}`,
        '/landlord/maintenance'
      )
      await sendMaintenanceNotification(landlord.email, parsed.data.title)
    }
  })

  revalidatePath('/tenant/maintenance')
  return { message: 'Maintenance request submitted.' }
}

export async function updateMaintenanceStatusAction(
  requestId: string,
  status: MaintenanceStatus,
  landlordNote?: string
): Promise<void> {
  const session = await requireRole('LANDLORD')
  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
  if (!landlord) throw new Error('Landlord not found')

  const request = await db.maintenanceRequest.findFirst({
    where: { id: requestId },
    include: {
      tenant: {
        include: {
          user: true,
          tenancies: {
            where: { status: 'ACTIVE' },
            include: { unit: { include: { building: true } } },
          },
        },
      },
    },
  })
  if (!request) throw new Error('Request not found')

  // Verify request belongs to one of landlord's tenants
  const isLandlordsTenant = request.tenant.tenancies.some(
    (t) => t.unit.building.landlordId === landlord.id
  )
  if (!isLandlordsTenant) throw new Error('Not authorized')

  const updateData: { status: MaintenanceStatus; landlordNote?: string; resolvedAt?: Date } = {
    status,
    landlordNote: landlordNote || undefined,
  }
  if (status === 'RESOLVED') updateData.resolvedAt = new Date()

  await db.maintenanceRequest.update({ where: { id: requestId }, data: updateData })

  const tenantEmail = request.tenant.user.email
  const tenantUserId = request.tenant.user.id

  after(async () => {
    await createNotification(
      tenantUserId,
      'MAINTENANCE_UPDATE',
      `Your maintenance request "${request.title}" status: ${status}`,
      '/tenant/maintenance'
    )
    await sendMaintenanceStatusUpdate(tenantEmail, request.title, status)
  })

  revalidatePath('/landlord/maintenance')
}
