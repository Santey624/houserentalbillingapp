import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatRs } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/StatusBadge'
import PaymentProofForm from '@/components/tenant/PaymentProofForm'
import BillCard from '@/components/tenant/BillCard'
import type { InvoiceData } from '@/lib/invoiceTypes'
import { ChevronLeft, Clock } from 'lucide-react'

export default async function TenantInvoiceDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')

  const tenant = await db.tenant.findUnique({ where: { userId: session.user.id } })
  if (!tenant) redirect('/auth/signin')

  const invoice = await db.invoice.findFirst({
    where: { id, tenancy: { tenantId: tenant.id } },
    include: {
      lineItems: { include: { meterReading: true }, orderBy: { sortOrder: 'asc' } },
      payments: { orderBy: { createdAt: 'desc' } },
      tenancy: {
        include: {
          unit: {
            include: {
              building: {
                include: { landlord: true },
              },
            },
          },
        },
      },
    },
  })
  if (!invoice) notFound()

  const landlord = invoice.tenancy.unit.building.landlord
  const canSubmitPayment = invoice.status === 'UNPAID' || invoice.status === 'OVERDUE'

  const invoiceData: InvoiceData = {
    landlord: {
      name: landlord.displayName,
      address: invoice.tenancy.unit.building.address,
      contact: landlord.contact,
      electricityRate: landlord.electricityRate,
      paymentDueDay: landlord.paymentDueDay,
      bankDetails: landlord.bankDetails,
      qrImageUrl: landlord.qrImageUrl,
    },
    invoice: {
      tenantName: invoice.tenantName,
      selectedMonths: [],
      nepaliYear: invoice.nepaliYear,
      invoiceDate: invoice.invoiceDate,
      rentCost: invoice.rentCost,
      serviceCharge: invoice.serviceCharge,
    },
    invoiceNum: invoice.invoiceNumber,
    nepaliMonth: invoice.nepaliMonth,
    meta: {
      buildingName: invoice.tenancy.unit.building.name,
      buildingAddress: invoice.tenancy.unit.building.address,
      buildingContact: invoice.tenancy.unit.building.contact,
      unitNumber: invoice.tenancy.unit.unitNumber,
      floor: invoice.tenancy.unit.floor,
      dueDate: invoice.dueDate,
      status: invoice.status,
    },
    meters: invoice.lineItems
      .filter((li: (typeof invoice.lineItems)[number]) => li.meterReading)
      .map((li: (typeof invoice.lineItems)[number]) => ({
        name: li.meterReading!.meterName,
        prev: li.meterReading!.prevReading,
        curr: li.meterReading!.currReading,
        consumed: li.meterReading!.consumed,
        cost: li.amount,
      })),
    totalUnits: invoice.lineItems
      .filter((li: (typeof invoice.lineItems)[number]) => li.meterReading)
      .reduce((s: number, li: (typeof invoice.lineItems)[number]) => s + (li.meterReading?.consumed ?? 0), 0),
    totalElec: invoice.totalElec,
    additionalCosts: invoice.lineItems
      .filter((li: (typeof invoice.lineItems)[number]) => !li.meterReading && li.description !== 'House Rent' && li.description !== 'Service / Minimum Charge')
      .map((li: (typeof invoice.lineItems)[number]) => ({ desc: li.description, amount: li.amount })),
    notes: invoice.notes ? invoice.notes.split('\n').map((n: string) => n.trim()).filter((n: string) => n.length > 0) : [],
    grandTotal: invoice.grandTotal,
  }

  return (
    <div className="p-5 sm:p-8 max-w-2xl">
      <Link href="/tenant/invoices" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ChevronLeft size={14} />
        Invoices
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl text-foreground mb-1">{invoice.invoiceNumber}</h1>
          <p className="text-muted-foreground text-sm">{invoice.nepaliMonth} {invoice.nepaliYear}</p>
        </div>
        <StatusBadge status={invoice.status} size="base" />
      </div>

      {/* Invoice lines */}
      <div className="card-modern p-6 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
              <th className="text-right pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((li: (typeof invoice.lineItems)[number]) => (
              <tr key={li.id} className="border-b border-border/50">
                <td className="py-3 text-foreground">
                  {li.description}
                  {li.meterReading && (
                    <span className="text-muted-foreground text-xs ml-2">
                      ({li.meterReading.prevReading} &rarr; {li.meterReading.currReading}, {li.meterReading.consumed} units)
                    </span>
                  )}
                </td>
                <td className="py-3 text-right font-medium text-foreground">{formatRs(li.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-4 font-semibold text-foreground">Grand Total</td>
              <td className="pt-4 text-right font-bold text-foreground text-xl">{formatRs(invoice.grandTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Bank / QR info */}
      {(landlord.bankDetails || landlord.qrImageUrl) && (
        <div className="card-modern p-6 mb-6">
          <h3 className="font-semibold text-foreground mb-4">Payment Information</h3>
          {landlord.bankDetails && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-4 leading-relaxed">{landlord.bankDetails}</p>
          )}
          {landlord.qrImageUrl && (
            <img
              src={landlord.qrImageUrl}
              alt="Payment QR"
              className="w-36 h-36 object-contain rounded-xl border border-border"
            />
          )}
        </div>
      )}

      {/* PDF Download */}
      <div className="mb-5">
        <BillCard data={invoiceData} filename={invoice.invoiceNumber} />
      </div>

      {/* Payment submission */}
      {canSubmitPayment && (
        <PaymentProofForm invoiceId={invoice.id} grandTotal={invoice.grandTotal} />
      )}

      {invoice.status === 'PAYMENT_SUBMITTED' && (
        <div className="alert-info mt-4">
          <Clock size={16} className="text-accent flex-shrink-0" />
          Payment proof submitted. Waiting for landlord verification.
        </div>
      )}

      {/* Payment history */}
      {invoice.payments.length > 0 && (
        <div className="card-modern p-6 mt-6">
          <h3 className="font-semibold text-foreground mb-4">Payment History</h3>
          <div className="space-y-2">
            {invoice.payments.map((p: (typeof invoice.payments)[number]) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-sm py-2.5 border-b border-border last:border-0"
              >
                <span className="text-muted-foreground">
                  {p.method.replace('_', ' ')} &middot; {new Date(p.createdAt).toLocaleDateString()}
                </span>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
