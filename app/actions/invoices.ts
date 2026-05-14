'use server'

import { after } from 'next/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Prisma, Role } from '@prisma/client'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { computeMeters, filterCosts } from '@/lib/calculations'
import { generateInvoiceNumber } from '@/lib/utils'
import { createNotification } from './notifications'
import { sendInvoiceNotification } from '@/lib/email'
import { InvoiceSchema } from '@/lib/validations'
import type { MeterRow, CostRow } from '@/lib/invoiceTypes'

const MAX_INVOICE_NUMBER_RETRIES = 5

function parseJsonRows<T>(value: FormDataEntryValue | null, fallback: T): T {
  if (typeof value !== 'string' || value.trim() === '') return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    throw new Error('Invoice line items are malformed. Please refresh and try again.')
  }
}

function assertValidMeters(rows: MeterRow[]) {
  for (const row of rows) {
    if (row.prev === '' && row.curr === '') continue

    const prev = Number(row.prev)
    const curr = Number(row.curr)

    if (!Number.isFinite(prev) || !Number.isFinite(curr)) {
      throw new Error(`Invalid reading for ${row.name || 'meter'}.`)
    }
    if (prev < 0 || curr < 0) {
      throw new Error(`Meter readings cannot be negative for ${row.name || 'meter'}.`)
    }
    if (curr < prev) {
      throw new Error(`Current reading must be greater than previous reading for ${row.name || 'meter'}.`)
    }
  }
}

async function createInvoiceWithNumber(data: Omit<Prisma.InvoiceCreateInput, 'invoiceNumber'>) {
  const year = new Date().getFullYear()

  for (let attempt = 0; attempt < MAX_INVOICE_NUMBER_RETRIES; attempt++) {
    const count = await db.invoice.count({
      where: {
        invoiceNumber: {
          startsWith: `INV-${year}-`,
        },
      },
    })

    try {
      return await db.invoice.create({
        data: {
          ...data,
          invoiceNumber: generateInvoiceNumber(year, count + attempt + 1),
        },
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        attempt < MAX_INVOICE_NUMBER_RETRIES - 1
      ) {
        continue
      }
      throw error
    }
  }

  throw new Error('Could not allocate an invoice number. Please try again.')
}

export async function createInvoiceAction(formData: FormData) {
  const session = await requireRole('LANDLORD')
  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
  if (!landlord) throw new Error('Landlord not found')

  const invoiceInput = InvoiceSchema.safeParse({
    tenancyId: formData.get('tenancyId') || undefined,
    joinRequestId: formData.get('joinRequestId') || undefined,
    tenantId: formData.get('tenantId') || undefined,
    directBill: formData.get('directBill') || undefined,
    unitId: formData.get('unitId'),
    tenantName: formData.get('tenantName'),
    nepaliMonth: formData.get('nepaliMonth'),
    nepaliYear: formData.get('nepaliYear'),
    invoiceDate: formData.get('invoiceDate'),
    dueDate: formData.get('dueDate') || undefined,
    rentCost: formData.get('rentCost'),
    serviceCharge: formData.get('serviceCharge'),
  })
  if (!invoiceInput.success) {
    throw new Error(invoiceInput.error.issues[0]?.message ?? 'Invoice details are invalid.')
  }
  const fields = invoiceInput.data
  const notes = (formData.get('notes') as string) || null
  const electricityRate = landlord.electricityRate

  const meterRows = parseJsonRows<MeterRow[]>(formData.get('meters'), [])
  const costRows = parseJsonRows<CostRow[]>(formData.get('costs'), [])
  assertValidMeters(meterRows)

  let activeTenancy = null
  if (fields.tenancyId) {
    activeTenancy = await db.tenancy.findFirst({
      where: { id: fields.tenancyId, status: 'ACTIVE' },
      include: { unit: { include: { building: true } }, tenant: { include: { user: true } } },
    })
    if (!activeTenancy || activeTenancy.unit.building.landlordId !== landlord.id) {
      throw new Error('Active tenancy not found')
    }
    if (activeTenancy.unitId !== fields.unitId) {
      throw new Error('Selected unit does not match this tenancy')
    }
  }

  // Compute totals
  const { details: meterDetails, totalElec } = computeMeters(meterRows, electricityRate)
  const additionalCosts = filterCosts(costRows)
  const extraTotal = additionalCosts.reduce((s, c) => s + c.amount, 0)
  const grandTotal = fields.rentCost + totalElec + fields.serviceCharge + extraTotal

  let tenancyForInvoice: NonNullable<typeof activeTenancy>
  if (fields.tenancyId) {
    tenancyForInvoice = activeTenancy!
  } else if (fields.joinRequestId) {
    const request = await db.joinRequest.findFirst({
      where: { id: fields.joinRequestId, status: 'PENDING' },
      include: {
        building: true,
        tenant: { include: { user: true } },
        unit: true,
      },
    })

    if (!request || request.building.landlordId !== landlord.id) {
      throw new Error('Pending tenant request not found')
    }
    if (request.unitId && request.unitId !== fields.unitId) {
      throw new Error('Selected unit does not match this tenant request')
    }

    const selectedUnit = await db.unit.findFirst({
      where: { id: fields.unitId, buildingId: request.buildingId },
      include: { tenancies: { where: { status: 'ACTIVE' } } },
    })
    if (!selectedUnit) {
      throw new Error('Selected unit was not found for this tenant request')
    }
    const occupiedByAnotherTenant = selectedUnit.tenancies.some((t) => t.tenantId !== request.tenantId)
    if (occupiedByAnotherTenant) {
      throw new Error('Selected unit already has an active tenant')
    }

    tenancyForInvoice = await db.$transaction(async (tx) => {
      const existingTenancy = await tx.tenancy.findFirst({
        where: { tenantId: request.tenantId, unitId: fields.unitId, status: 'ACTIVE' },
        include: { unit: { include: { building: true } }, tenant: { include: { user: true } } },
      })

      await tx.joinRequest.update({
        where: { id: request.id },
        data: { status: 'APPROVED', unitId: fields.unitId },
      })

      return existingTenancy ?? tx.tenancy.create({
        data: {
          tenantId: request.tenantId,
          unitId: fields.unitId,
          status: 'ACTIVE',
        },
        include: { unit: { include: { building: true } }, tenant: { include: { user: true } } },
      })
    })
  } else if (fields.tenantId) {
    const [tenant, selectedUnit] = await Promise.all([
      db.tenant.findUnique({
        where: { id: fields.tenantId },
        include: { user: true },
      }),
      db.unit.findFirst({
        where: { id: fields.unitId, building: { landlordId: landlord.id } },
        include: {
          building: true,
          tenancies: { where: { status: 'ACTIVE' } },
        },
      }),
    ])

    if (!tenant) {
      throw new Error('Tenant not found')
    }
    if (!selectedUnit) {
      throw new Error('Selected unit was not found')
    }
    const occupiedByAnotherTenant = selectedUnit.tenancies.some((t) => t.tenantId !== tenant.id)
    if (occupiedByAnotherTenant) {
      throw new Error('Selected unit already has an active tenant')
    }

    tenancyForInvoice = await db.tenancy.findFirst({
      where: { tenantId: tenant.id, unitId: fields.unitId, status: 'ACTIVE' },
      include: { unit: { include: { building: true } }, tenant: { include: { user: true } } },
    }) ?? await db.tenancy.create({
      data: {
        tenantId: tenant.id,
        unitId: fields.unitId,
        status: 'ACTIVE',
      },
      include: { unit: { include: { building: true } }, tenant: { include: { user: true } } },
    })
  } else if (fields.directBill) {
    const selectedUnit = await db.unit.findFirst({
      where: { id: fields.unitId, building: { landlordId: landlord.id } },
      include: {
        building: true,
        tenancies: { where: { status: 'ACTIVE' } },
      },
    })
    if (!selectedUnit) {
      throw new Error('Selected unit was not found')
    }
    if (selectedUnit.tenancies.length > 0) {
      throw new Error('Selected unit already has an active tenant')
    }

    const manualEmail = `manual-${crypto.randomUUID()}@gharkhata.local`

    const manualTenant = await db.tenant.create({
      data: {
        displayName: fields.tenantName,
        user: {
          create: {
            name: fields.tenantName,
            email: manualEmail,
            emailVerified: new Date(),
            role: Role.TENANT,
          },
        },
      },
    })

    tenancyForInvoice = await db.tenancy.create({
      data: {
        tenantId: manualTenant.id,
        unitId: fields.unitId,
        status: 'ACTIVE',
      },
      include: { unit: { include: { building: true } }, tenant: { include: { user: true } } },
    })
  } else {
    throw new Error('Select a tenant.')
  }

  let sortOrder = 0
  const invoice = await createInvoiceWithNumber({
    tenancy: { connect: { id: tenancyForInvoice.id } },
    unit: { connect: { id: fields.unitId } },
    tenantName: fields.tenantName,
    nepaliMonth: fields.nepaliMonth,
    nepaliYear: fields.nepaliYear,
    invoiceDate: fields.invoiceDate,
    dueDate: fields.dueDate || null,
    rentCost: fields.rentCost,
    serviceCharge: fields.serviceCharge,
    totalElec,
    grandTotal,
    notes,
    lineItems: {
      create: [
        { description: 'House Rent', amount: fields.rentCost, sortOrder: sortOrder++ },
        ...(fields.serviceCharge > 0
          ? [{ description: 'Service / Minimum Charge', amount: fields.serviceCharge, sortOrder: sortOrder++ }]
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
  })

  const tenantEmail = tenancyForInvoice.tenant.user.email
  const tenantUserId = tenancyForInvoice.tenant.user.id
  const invoiceNumber = invoice.invoiceNumber

  after(async () => {
    await createNotification(
      tenantUserId,
      'NEW_INVOICE',
      `Invoice ${invoiceNumber} for ${fields.nepaliMonth} ${fields.nepaliYear} has been issued.`,
      `/tenant/invoices/${invoice.id}`
    )
    if (!tenantEmail.endsWith('@gharkhata.local')) {
      await sendInvoiceNotification(tenantEmail, invoiceNumber, invoice.id)
    }
  })

  revalidatePath('/landlord/invoices')
  revalidatePath('/landlord/join-requests')
  revalidatePath('/landlord/tenants')
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

export async function deleteInvoiceAction(invoiceId: string): Promise<void> {
  const session = await requireRole('LANDLORD')
  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
  if (!landlord) throw new Error('Landlord not found')

  const invoice = await db.invoice.findFirst({
    where: { id: invoiceId },
    include: {
      tenancy: {
        include: {
          unit: { include: { building: true } },
          tenant: { include: { user: true } },
          _count: { select: { invoices: true } },
        },
      },
    },
  })
  if (!invoice || invoice.tenancy.unit.building.landlordId !== landlord.id) {
    throw new Error('Invoice not found')
  }

  const manualUserId = invoice.tenancy.tenant.user.email.endsWith('@gharkhata.local')
    ? invoice.tenancy.tenant.userId
    : null
  const shouldDeleteManualTenant = manualUserId && invoice.tenancy._count.invoices === 1

  await db.$transaction(async (tx) => {
    await tx.invoice.delete({ where: { id: invoiceId } })

    if (shouldDeleteManualTenant) {
      await tx.user.delete({ where: { id: manualUserId } })
    }
  })

  revalidatePath('/landlord/invoices')
  revalidatePath('/landlord/tenants')
  redirect('/landlord/invoices')
}
