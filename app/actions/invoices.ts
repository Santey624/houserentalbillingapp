'use server'

import { after } from 'next/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { computeMeters, filterCosts } from '@/lib/calculations'
import { generateInvoiceNumber } from '@/lib/utils'
import { createNotification } from './notifications'
import { sendInvoiceNotification } from '@/lib/email'
import type { MeterRow, CostRow } from '@/lib/invoiceTypes'

export async function createInvoiceAction(formData: FormData) {
  const session = await requireRole('LANDLORD')
  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
  if (!landlord) throw new Error('Landlord not found')

  const tenancyId = formData.get('tenancyId') as string
  const unitId = formData.get('unitId') as string
  const tenantName = formData.get('tenantName') as string
  const nepaliMonth = formData.get('nepaliMonth') as string
  const nepaliYear = formData.get('nepaliYear') as string
  const invoiceDate = formData.get('invoiceDate') as string
  const dueDate = (formData.get('dueDate') as string) || null
  const rentCost = parseFloat(formData.get('rentCost') as string) || 0
  const serviceCharge = parseFloat(formData.get('serviceCharge') as string) || 0
  const notes = (formData.get('notes') as string) || null
  const electricityRate = landlord.electricityRate

  // Parse meters JSON
  const metersJson = formData.get('meters') as string
  const costsJson = formData.get('costs') as string
  const meterRows: MeterRow[] = metersJson ? JSON.parse(metersJson) : []
  const costRows: CostRow[] = costsJson ? JSON.parse(costsJson) : []

  // Verify tenancy belongs to landlord
  const tenancy = await db.tenancy.findFirst({
    where: { id: tenancyId },
    include: { unit: { include: { building: true } }, tenant: { include: { user: true } } },
  })
  if (!tenancy || tenancy.unit.building.landlordId !== landlord.id) {
    throw new Error('Tenancy not found')
  }

  // Compute totals
  const { details: meterDetails, totalElec } = computeMeters(meterRows, electricityRate)
  const additionalCosts = filterCosts(costRows)
  const extraTotal = additionalCosts.reduce((s, c) => s + c.amount, 0)
  const grandTotal = rentCost + totalElec + serviceCharge + extraTotal

  // Get sequential invoice number
  const count = await db.invoice.count()
  const year = new Date().getFullYear()
  const invoiceNumber = generateInvoiceNumber(year, count + 1)

  let sortOrder = 0
  const invoice = await db.invoice.create({
    data: {
      invoiceNumber,
      tenancyId,
      unitId,
      tenantName,
      nepaliMonth,
      nepaliYear,
      invoiceDate,
      dueDate,
      rentCost,
      serviceCharge,
      totalElec,
      grandTotal,
      notes,
      lineItems: {
        create: [
          { description: 'House Rent', amount: rentCost, sortOrder: sortOrder++ },
          ...(serviceCharge > 0
            ? [{ description: 'Service / Minimum Charge', amount: serviceCharge, sortOrder: sortOrder++ }]
            : []),
          ...meterDetails.map((m) => ({
            description: `Electricity — ${m.name}`,
            units: m.consumed,
            rate: electricityRate,
            amount: m.cost,
            sortOrder: sortOrder++,
            meterReading: {
              create: {
                meterName: m.name,
                prevReading: m.prev,
                currReading: m.curr,
                consumed: m.consumed,
                rate: electricityRate,
              },
            },
          })),
          ...additionalCosts.map((c) => ({
            description: c.desc,
            amount: c.amount,
            sortOrder: sortOrder++,
          })),
        ],
      },
    },
  })

  const tenantEmail = tenancy.tenant.user.email
  const tenantUserId = tenancy.tenant.user.id

  after(async () => {
    await createNotification(
      tenantUserId,
      'NEW_INVOICE',
      `Invoice ${invoiceNumber} for ${nepaliMonth} ${nepaliYear} has been issued.`,
      `/tenant/invoices/${invoice.id}`
    )
    await sendInvoiceNotification(tenantEmail, invoiceNumber, invoice.id)
  })

  revalidatePath('/landlord/invoices')
  redirect(`/landlord/invoices/${invoice.id}`)
}

export async function updateInvoiceStatusAction(invoiceId: string, status: 'UNPAID' | 'PAID' | 'OVERDUE'): Promise<void> {
  const session = await requireRole('LANDLORD')
  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
  if (!landlord) throw new Error('Landlord not found')

  const invoice = await db.invoice.findFirst({
    where: { id: invoiceId },
    include: { tenancy: { include: { unit: { include: { building: true } } } } },
  })
  if (!invoice || invoice.tenancy.unit.building.landlordId !== landlord.id) {
    throw new Error('Invoice not found')
  }

  await db.invoice.update({ where: { id: invoiceId }, data: { status } })
  revalidatePath(`/landlord/invoices/${invoiceId}`)
  revalidatePath('/landlord/invoices')
}
