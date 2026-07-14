'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { LandlordProfileSchema, TenantProfileSchema } from '@/lib/validations'
import { deleteBlob, uploadPaymentQr } from '@/lib/blob'
import { UploadValidationError } from '@/lib/upload-validation'
import { enforceRateLimit, RateLimitExceededError } from '@/lib/rate-limit'

type ActionState = { errors?: Record<string, string[]>; message?: string } | null

export async function updateLandlordSettingsAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole('LANDLORD')
  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
  if (!landlord) return { errors: { _: ['Landlord profile not found'] } }

  const rawData = {
    displayName: formData.get('displayName'),
    address: formData.get('address'),
    contact: formData.get('contact'),
    electricityRate: formData.get('electricityRate'),
    paymentDueDay: formData.get('paymentDueDay'),
    bankDetails: formData.get('bankDetails'),
  }

  const parsed = LandlordProfileSchema.safeParse(rawData)
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }

  let qrImageUrl = landlord.qrImageUrl
  const qrFile = formData.get('qrImage') as File | null
  if (qrFile && qrFile.size > 0) {
    try {
      await enforceRateLimit(session.user.id, {
        scope: 'upload:payment-qr',
        limit: 5,
        windowMs: 60 * 60 * 1000,
      })
      qrImageUrl = await uploadPaymentQr(qrFile)
    } catch (error) {
      if (error instanceof UploadValidationError || error instanceof RateLimitExceededError) {
        return { errors: { qrImage: [error.message] } }
      }
      console.error('Failed to upload landlord QR image', { landlordId: landlord.id })
      return {
        errors: {
          qrImage: ['Failed to upload QR image. Please try again with a valid image file.'],
          _: ['Could not save settings. Please try again.'],
        },
      }
    }
  }

  try {
    await db.landlord.update({
      where: { id: landlord.id },
      data: { ...parsed.data, qrImageUrl },
    })
  } catch {
    if (qrImageUrl && qrImageUrl !== landlord.qrImageUrl) await deleteBlob(qrImageUrl)
    console.error('Failed to update landlord settings', { landlordId: landlord.id })
    return { errors: { _: ['Could not save settings. Please try again.'] } }
  }
  if (landlord.qrImageUrl && qrImageUrl !== landlord.qrImageUrl) {
    await deleteBlob(landlord.qrImageUrl)
  }

  // Revalidate multiple paths to ensure updates reflect everywhere
  revalidatePath('/landlord/settings')
  revalidatePath('/landlord/invoices', 'layout')
  revalidatePath('/tenant/invoices', 'layout')
  
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
