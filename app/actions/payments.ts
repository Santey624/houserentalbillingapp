'use server'

import { after } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { PaymentSchema } from '@/lib/validations'
import { uploadBlob } from '@/lib/blob'
import { createNotification } from './notifications'
import { sendPaymentProofNotification, sendPaymentVerificationResult } from '@/lib/email'

type ActionState = { errors?: Record<string, string[]>; message?: string } | null

export async function submitPaymentProofAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole('TENANT')
  const tenant = await db.tenant.findUnique({ where: { userId: session.user.id } })
  if (!tenant) return { errors: { _: ['Tenant profile not found'] } }

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
  if (!invoice || invoice.tenancy.tenant.id !== tenant.id) {
    return { errors: { _: ['Invoice not found'] } }
  }

  let proofImageUrl: string | undefined
  const proofFile = formData.get('proof') as File | null
  if (proofFile && proofFile.size > 0) {
    proofImageUrl = await uploadBlob(proofFile, 'payment-proofs')
  }

  await db.$transaction([
    db.payment.create({
      data: {
        invoiceId: parsed.data.invoiceId,
        method: parsed.data.method,
        referenceNum: parsed.data.referenceNum,
        proofImageUrl,
        amount: parsed.data.amount,
      },
    }),
    db.invoice.update({
      where: { id: parsed.data.invoiceId },
      data: { status: 'PAYMENT_SUBMITTED' },
    }),
  ])

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

  await db.$transaction([
    db.payment.update({
      where: { id: paymentId },
      data: {
        status: newStatus,
        verifiedBy: session.user.id,
        verifiedAt: new Date(),
        rejectionNote: rejectionNote || null,
      },
    }),
    db.invoice.update({
      where: { id: payment.invoiceId },
      data: { status: invoiceStatus },
    }),
  ])

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

  revalidatePath(`/landlord/invoices/${payment.invoiceId}`)
}
