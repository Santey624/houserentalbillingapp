'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { LandlordProfileSchema, TenantProfileSchema } from '@/lib/validations'
import { uploadBlob } from '@/lib/blob'

type ActionState = { errors?: Record<string, string[]>; message?: string } | null

export async function updateLandlordSettingsAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole('LANDLORD')
  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
  if (!landlord) return { errors: { _: ['Landlord profile not found'] } }

  const parsed = LandlordProfileSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }

  let qrImageUrl = landlord.qrImageUrl
  const qrFile = formData.get('qrImage') as File | null
  if (qrFile && qrFile.size > 0) {
    qrImageUrl = await uploadBlob(qrFile, 'qr')
  }

  await db.landlord.update({
    where: { id: landlord.id },
    data: { ...parsed.data, qrImageUrl },
  })

  revalidatePath('/landlord/settings')
  return { message: 'Settings saved.' }
}

export async function updateTenantSettingsAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole('TENANT')
  const tenant = await db.tenant.findUnique({ where: { userId: session.user.id } })
  if (!tenant) return { errors: { _: ['Tenant profile not found'] } }

  const parsed = TenantProfileSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }

  await db.tenant.update({ where: { id: tenant.id }, data: parsed.data })

  revalidatePath('/tenant/settings')
  return { message: 'Settings saved.' }
}

export async function completeLandlordOnboardingAction(): Promise<void> {
  const session = await requireRole('LANDLORD')
  await db.landlord.update({
    where: { userId: session.user.id },
    data: { onboardingDone: true },
  })
  revalidatePath('/landlord')
}
