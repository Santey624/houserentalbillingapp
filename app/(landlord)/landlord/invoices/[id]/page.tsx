import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatRs, formatStatus } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { verifyPaymentAction } from '@/app/actions/payments'
import { deleteInvoiceAction, updateInvoiceStatusAction } from '@/app/actions/invoices'
import DownloadInvoiceButton from '@/components/landlord/DownloadInvoiceButton'
import { ChevronLeft, CheckCircle2, XCircle, ExternalLink } from 'lucide-react'

export default async function LandlordInvoiceDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')

  const landlord = await db.landlord.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      displayName: true,
      address: true,
      contact: true,
      electricityRate: true,
      paymentDueDay: true,
      bankDetails: true,
      qrImageUrl: true,
    },
  })
  if (!landlord) redirect('/auth/signin')

  const invoice = await db.invoice.findFirst({
    where: { id, tenancy: { unit: { building: { landlordId: landlord.id } } } },
    include: {
      lineItems: { include: { meterReading: true }, orderBy: { sortOrder: 'asc' } },
      payments: { orderBy: { createdAt: 'desc' } },
      tenancy: { include: { unit: { include: { building: true } } } },
    },
  })
  if (!invoice) notFound()

  const pendingPayment = invoice.payments.find((p: any) => p.status === 'PENDING_VERIFICATION')

  return (
    <div className="p-5 sm:p-8 max-w-3xl">
      <Link href="/landlord/invoices" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ChevronLeft size={14} />
        Invoices
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl text-foreground mb-1">{invoice.invoiceNumber}</h1>
          <p className="text-muted-foreground text-sm">
            {invoice.tenantName} &middot; {invoice.tenancy.unit.building.name} Unit {invoice.tenancy.unit.unitNumber}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={invoice.status} size="base" />
          <DownloadInvoiceButton
            invoice={{
              invoiceNumber: invoice.invoiceNumber,
              tenantName: invoice.tenantName,
              nepaliMonth: invoice.nepaliMonth,
              nepaliYear: invoice.nepaliYear,
              invoiceDate: invoice.invoiceDate,
              rentCost: invoice.rentCost,
              serviceCharge: invoice.serviceCharge,
              totalElec: invoice.totalElec,
              grandTotal: invoice.grandTotal,
              dueDate: invoice.dueDate,
              status: invoice.status,
              notes: invoice.notes,
              lineItems: invoice.lineItems.map((li) => ({
                description: li.description,
                amount: li.amount,
                meterReading: li.meterReading
                  ? { prevReading: li.meterReading.prevReading, currReading: li.meterReading.currReading, consumed: li.meterReading.consumed }
                  : null,
              })),
              building: {
                name: invoice.tenancy.unit.building.name,
                address: invoice.tenancy.unit.building.address,
                contact: invoice.tenancy.unit.building.contact,
              },
              unit: {
                unitNumber: invoice.tenancy.unit.unitNumber,
                floor: invoice.tenancy.unit.floor,
              },
            }}
            landlord={{
              displayName: landlord.displayName,
              address: landlord.address,
              contact: landlord.contact,
              electricityRate: landlord.electricityRate,
              paymentDueDay: landlord.paymentDueDay,
              bankDetails: landlord.bankDetails,
              qrImageUrl: landlord.qrImageUrl,
            }}
          />
          {invoice.status !== 'PAID' && (
            <form action={updateInvoiceStatusAction.bind(null, id, 'OVERDUE')}>
              <button type="submit" className="text-xs text-muted-foreground hover:text-red-500 transition-colors px-2 py-1">
                Mark overdue
              </button>
            </form>
          )}
          <form action={deleteInvoiceAction.bind(null, id)}>
            <button type="submit" className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors px-2 py-1">
              Delete
            </button>
          </form>
        </div>
      </div>

      {/* Invoice summary */}
      <div className="card-modern p-6 mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-5">
          <span>Billing Period: <span className="font-medium text-foreground">{invoice.nepaliMonth} {invoice.nepaliYear}</span></span>
          <span>Date: <span className="font-medium text-foreground">{invoice.invoiceDate}</span></span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
              <th className="text-right pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((li) => (
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
        {invoice.notes && (
          <p className="text-muted-foreground text-xs mt-4 pt-4 border-t border-border">
            Notes: {invoice.notes}
          </p>
        )}
      </div>

      {/* Payment verification */}
      {pendingPayment && (
        <div className="card-modern p-6 mb-6 border-accent/30" style={{ background: 'rgba(0,82,255,0.02)' }}>
          <h3 className="font-semibold text-foreground mb-4">Payment Proof Submitted</h3>
          <div className="text-sm text-muted-foreground space-y-1.5 mb-5">
            <p>Method: <span className="font-medium text-foreground">{pendingPayment.method.replace('_', ' ')}</span></p>
            <p>Amount: <span className="font-medium text-foreground">{formatRs(pendingPayment.amount)}</span></p>
            {pendingPayment.referenceNum && (
              <p>Reference: <span className="font-medium text-foreground">{pendingPayment.referenceNum}</span></p>
            )}
            {pendingPayment.proofImageUrl && (
              <a
                href={pendingPayment.proofImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-accent hover:underline underline-offset-2"
              >
                View proof image <ExternalLink size={12} />
              </a>
            )}
          </div>
          <div className="flex gap-3">
            <form action={verifyPaymentAction.bind(null, pendingPayment.id, true, undefined)}>
              <button type="submit" className="btn-primary py-2 px-4 text-xs">
                <CheckCircle2 size={14} />
                Verify Payment
              </button>
            </form>
            <form action={verifyPaymentAction.bind(null, pendingPayment.id, false, 'Payment could not be verified')}>
              <button type="submit" className="btn-danger py-2 px-4 text-xs">
                <XCircle size={14} />
                Reject
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payment history */}
      {invoice.payments.length > 0 && (
        <div className="card-modern p-6">
          <h3 className="font-semibold text-foreground mb-4">Payment History</h3>
          <div className="space-y-3">
            {invoice.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                <div>
                  <span className="text-foreground font-medium">{formatStatus(p.method)}</span>
                  {p.referenceNum && <span className="text-muted-foreground ml-2">#{p.referenceNum}</span>}
                  <span className="text-muted-foreground ml-2">&middot; {new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-foreground">{formatRs(p.amount)}</span>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
