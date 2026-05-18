import { db } from '@/lib/db'
import { getLandlord } from '@/lib/session'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import InvoiceForm from '@/components/landlord/InvoiceForm'
import { ChevronLeft } from 'lucide-react'
import type { MeterRow, CostRow } from '@/lib/invoiceTypes'

export default async function EditInvoicePage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const { landlord } = await getLandlord()

  const invoice = await db.invoice.findFirst({
    where: { id, tenancy: { unit: { building: { landlordId: landlord.id } } } },
    include: {
      lineItems: { include: { meterReading: true }, orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!invoice) notFound()

  // Convert line items back to form rows
  const meters: MeterRow[] = invoice.lineItems
    .filter((li) => li.meterReading)
    .map((li) => ({
      id: li.id,
      name: li.meterReading!.meterName,
      prev: li.meterReading!.prevReading.toString(),
      curr: li.meterReading!.currReading.toString(),
    }))

  const skipDescriptions = ['House Rent', 'Service / Minimum Charge', 'Service Charge']
  const costs: CostRow[] = invoice.lineItems
    .filter((li) => !li.meterReading && !skipDescriptions.some(d => li.description.includes(d)))
    .map((li) => ({
      id: li.id,
      description: li.description,
      amount: li.amount.toString(),
    }))

  const initialData = {
    id: invoice.id,
    nepaliMonth: invoice.nepaliMonth,
    nepaliYear: invoice.nepaliYear,
    invoiceDate: invoice.invoiceDate,
    dueDate: invoice.dueDate,
    rentCost: invoice.rentCost,
    serviceCharge: invoice.serviceCharge,
    notes: invoice.notes,
    meters: meters.length > 0 ? meters : [{ id: 'm1', name: 'Meter 1', prev: '', curr: '' }],
    costs: costs.length > 0 ? costs : [{ id: 'c1', description: 'Water', amount: '0' }],
  }

  return (
    <div className="p-5 sm:p-8 max-w-2xl">
      <Link
        href={`/landlord/invoices/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft size={14} />
        Back to Invoice
      </Link>
      <div className="mb-8">
        <h1 className="text-4xl text-foreground mb-1">Edit Invoice</h1>
        <p className="text-sm text-muted-foreground">Modify invoice details for {invoice.tenantName}</p>
      </div>

      <InvoiceForm
        initialData={initialData}
        unitId={invoice.unitId}
        tenantName={invoice.tenantName}
        defaultRate={landlord.electricityRate}
      />
    </div>
  )
}
