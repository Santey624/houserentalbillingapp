import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatRs } from '@/lib/utils'
import PaymentProofForm from '@/components/tenant/PaymentProofForm'
import BillCard from '@/components/tenant/BillCard'
import type { InvoiceData } from '@/lib/invoiceTypes'

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
  const canSubmitPayment =
    invoice.status === 'UNPAID' || invoice.status === 'OVERDUE'

  // Build InvoiceData for PDF
  const invoiceData: InvoiceData = {
    landlord: {
      name: landlord.displayName,
      address: invoice.tenancy.unit.building.address,
      contact: landlord.contact,
      electricityRate: landlord.electricityRate,
      paymentDueDay: landlord.paymentDueDay,
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
    // Convert optional string notes (from DB) into string[] for InvoiceData
    notes: invoice.notes ? invoice.notes.split('\n').map((n: string) => n.trim()).filter((n: string) => n.length > 0) : [],
    grandTotal: invoice.grandTotal,
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/tenant/invoices" className="text-gray-400 hover:text-gray-600 text-sm">← Invoices</Link>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
          <p className="text-gray-500 text-sm">{invoice.nepaliMonth} {invoice.nepaliYear}</p>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${
          invoice.status === 'PAID' ? 'bg-green-100 text-green-700'
          : invoice.status === 'PAYMENT_SUBMITTED' ? 'bg-blue-100 text-blue-700'
          : invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-700'
          : 'bg-orange-100 text-orange-700'
        }`}>
          {invoice.status.replace('_', ' ')}
        </span>
      </div>

      {/* Invoice lines */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 text-gray-500 font-medium">Description</th>
              <th className="text-right py-2 text-gray-500 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((li: (typeof invoice.lineItems)[number]) => (
              <tr key={li.id} className="border-b border-gray-50">
                <td className="py-2 text-gray-700">
                  {li.description}
                  {li.meterReading && (
                    <span className="text-gray-400 text-xs ml-2">
                      ({li.meterReading.prevReading} → {li.meterReading.currReading}, {li.meterReading.consumed} units)
                    </span>
                  )}
                </td>
                <td className="py-2 text-right">{formatRs(li.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-4 font-bold text-gray-900">Grand Total</td>
              <td className="pt-4 text-right font-bold text-gray-900 text-lg">{formatRs(invoice.grandTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Bank / QR info */}
      {(landlord.bankDetails || landlord.qrImageUrl) && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Payment Information</h3>
          {landlord.bankDetails && (
            <p className="text-sm text-gray-600 whitespace-pre-wrap mb-3">{landlord.bankDetails}</p>
          )}
          {landlord.qrImageUrl && (
            <img src={landlord.qrImageUrl} alt="Payment QR" className="w-40 h-40 object-contain rounded-lg border" />
          )}
        </div>
      )}

      {/* PDF Download */}
      <div className="mb-4">
        <BillCard data={invoiceData} filename={invoice.invoiceNumber} />
      </div>

      {/* Payment submission */}
      {canSubmitPayment && (
        <PaymentProofForm invoiceId={invoice.id} grandTotal={invoice.grandTotal} />
      )}

      {invoice.status === 'PAYMENT_SUBMITTED' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
          Payment proof submitted. Waiting for landlord verification.
        </div>
      )}

      {/* Payment history */}
      {invoice.payments.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Payment History</h3>
          {invoice.payments.map((p: (typeof invoice.payments)[number]) => (
            <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
              <span className="text-gray-600">{p.method.replace('_', ' ')} · {new Date(p.createdAt).toLocaleDateString()}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                p.status === 'VERIFIED' ? 'bg-green-100 text-green-700'
                : p.status === 'REJECTED' ? 'bg-red-100 text-red-600'
                : 'bg-yellow-100 text-yellow-700'
              }`}>
                {p.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
