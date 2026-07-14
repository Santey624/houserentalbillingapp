'use server'

import { after } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { PaymentSchema } from '@/lib/validations'
import { deleteBlob, uploadPaymentProof } from '@/lib/blob'
import { UploadValidationError } from '@/lib/upload-validation'
import { enforceRateLimit, RateLimitExceededError } from '@/lib/rate-limit'
import { createNotification } from './notifications'
import { sendPaymentProofNotification, sendPaymentVerificationResult } from '@/lib/email'
import { Prisma } from '@prisma/client'

type ActionState = { errors?: Record<string, string[]>; message?: string } | null

export async function submitPaymentProofAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole('TENANT')
  const tenant = await db.tenant.findUnique({ where: { userId: session.user.id } })
  if (!tenant) return { errors: { _: ['Tenant profile not found'] } }
  try {
    await enforceRateLimit(session.user.id, {
      scope: 'upload:payment-proof',
      limit: 10,
      windowMs: 60 * 60 * 1000,
    })
  } catch (error) {
    if (error instanceof RateLimitExceededError) {
      return { errors: { _: [error.message] } }
    }
    throw error
  }

  const parsed = PaymentSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }

  const invoice = await db.invoice.findFirst({
    where: { id: parsed.data.invoiceId },
    include: {
      tenancy: {
        include: {
          tenant: true,
          unit: { include: { building: { include: { landlord: { include: { user: true } } } } } },
        },
      },
    },
  })
  if (
    !invoice ||
    invoice.tenancy.tenant.id !== tenant.id ||
    !['UNPAID', 'OVERDUE'].includes(invoice.status)
  ) {
    return { errors: { _: ['Invoice not found'] } }
  }

  let proofImageUrl: string | undefined
  const proofFile = formData.get('proof') as File | null
  if (proofFile && proofFile.size > 0) {
    try {
      proofImageUrl = await uploadPaymentProof(proofFile)
    } catch (error) {
      if (error instanceof UploadValidationError) {
        return { errors: { proof: [error.message] } }
      }
      throw error
    }
  }

  try {
    await db.$transaction(async (tx) => {
      const transitioned = await tx.invoice.updateMany({
        where: {
          id: parsed.data.invoiceId,
          status: { in: ['UNPAID', 'OVERDUE'] },
          tenancy: { tenantId: tenant.id },
        },
        data: { status: 'PAYMENT_SUBMITTED' },
      })
      if (transitioned.count !== 1) throw new Error('Invoice is no longer payable.')

      await tx.payment.create({
        data: {
          invoiceId: parsed.data.invoiceId,
          method: parsed.data.method,
          referenceNum: parsed.data.referenceNum,
          proofImageUrl,
          amount: invoice.grandTotal,
        },
      })
    })
  } catch (error) {
    if (proofImageUrl) await deleteBlob(proofImageUrl)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { errors: { _: ['A payment is already pending for this invoice.'] } }
    }
    throw error
  }

  const landlordEmail = invoice.tenancy.unit.building.landlord.user.email
  const landlordUserId = invoice.tenancy.unit.building.landlord.user.id

  after(async () => {
    await createNotification(
      landlordUserId,
      'PAYMENT_SUBMITTED',
      `Payment proof submitted for invoice ${invoice.invoiceNumber}`,
      `/landlord/invoices/${invoice.id}`
    )
    await sendPaymentProofNotification(landlordEmail, tenant.displayName, invoice.invoiceNumber)
  })

  revalidatePath(`/tenant/invoices/${parsed.data.invoiceId}`)
  return { message: 'Payment proof submitted! Waiting for landlord verification.' }
}

export async function verifyPaymentAction(paymentId: string, approved: boolean, rejectionNote?: string): Promise<void> {
  const session = await requireRole('LANDLORD')
  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
  if (!landlord) throw new Error('Landlord not found')

  const payment = await db.payment.findFirst({
    where: { id: paymentId },
    include: {
      invoice: {
        include: {
          tenancy: {
            include: {
              tenant: { include: { user: true } },
              unit: { include: { building: true } },
            },
          },
        },
      },
    },
  })
  if (!payment || payment.invoice.tenancy.unit.building.landlordId !== landlord.id) {
    throw new Error('Payment not found')
  }

  const newStatus = approved ? 'VERIFIED' : 'REJECTED'
  const invoiceStatus = approved ? 'PAID' : 'UNPAID'

  await db.$transaction(async (tx) => {
    const transitioned = await tx.payment.updateMany({
      where: { id: paymentId, status: 'PENDING_VERIFICATION' },
      data: {
        status: newStatus,
        verifiedBy: session.user.id,
        verifiedAt: new Date(),
        rejectionNote: rejectionNote || null,
      },
    })
    if (transitioned.count !== 1) throw new Error('Payment has already been reviewed.')

    const invoiceTransitioned = await tx.invoice.updateMany({
      where: { id: payment.invoiceId, status: 'PAYMENT_SUBMITTED' },
      data: { status: invoiceStatus },
    })
    if (invoiceTransitioned.count !== 1) throw new Error('Invoice state changed; review again.')
  })

  const tenantEmail = payment.invoice.tenancy.tenant.user.email
  const tenantUserId = payment.invoice.tenancy.tenant.user.id
  const invoiceNumber = payment.invoice.invoiceNumber

  after(async () => {
    await createNotification(
      tenantUserId,
      approved ? 'PAYMENT_VERIFIED' : 'PAYMENT_REJECTED',
      approved
        ? `Payment for invoice ${invoiceNumber} has been verified!`
        : `Payment for invoice ${invoiceNumber} was not verified. ${rejectionNote || ''}`,
      `/tenant/invoices/${payment.invoiceId}`
    )
    await sendPaymentVerificationResult(tenantEmail, approved, invoiceNumber)
  })

  revalidatePath('/landlord')
  revalidatePath(`/landlord/invoices/${payment.invoiceId}`)
}
