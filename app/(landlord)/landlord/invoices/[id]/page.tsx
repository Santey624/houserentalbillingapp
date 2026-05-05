import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatRs } from '@/lib/utils'
import { verifyPaymentAction } from '@/app/actions/payments'
import { updateInvoiceStatusAction } from '@/app/actions/invoices'

export default async function LandlordInvoiceDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')

  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
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
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/landlord/invoices" className="text-gray-400 hover:text-gray-600 text-sm">← Invoices</Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
          <p className="text-gray-500 text-sm">
            {invoice.tenantName} · {invoice.tenancy.unit.building.name} Unit {invoice.tenancy.unit.unitNumber}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${
            invoice.status === 'PAID' ? 'bg-green-100 text-green-700'
            : invoice.status === 'PAYMENT_SUBMITTED' ? 'bg-blue-100 text-blue-700'
            : invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-700'
            : 'bg-gray-100 text-gray-600'
          }`}>
            {invoice.status.replace('_', ' ')}
          </span>
          {invoice.status !== 'PAID' && (
            <form action={updateInvoiceStatusAction.bind(null, id, 'OVERDUE')}>
              <button type="submit" className="text-xs text-gray-400 hover:text-red-500">Mark overdue</button>
            </form>
          )}
        </div>
      </div>

      {/* Invoice summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-4">
          <span>Billing Period: <strong>{invoice.nepaliMonth} {invoice.nepaliYear}</strong></span>
          <span>Date: {invoice.invoiceDate}</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 text-gray-500 font-medium">Description</th>
              <th className="text-right py-2 text-gray-500 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((li) => (
              <tr key={li.id} className="border-b border-gray-50">
                <td className="py-2 text-gray-700">
                  {li.description}
                  {li.meterReading && (
                    <span className="text-gray-400 text-xs ml-2">
                      ({li.meterReading.prevReading} → {li.meterReading.currReading}, {li.meterReading.consumed} units)
                    </span>
                  )}
                </td>
                <td className="py-2 text-right text-gray-900">{formatRs(li.amount)}</td>
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
        {invoice.notes && <p className="text-gray-400 text-xs mt-4">Notes: {invoice.notes}</p>}
      </div>

      {/* Payment verification */}
      {pendingPayment && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">Payment Proof Submitted</h3>
          <div className="text-sm text-blue-800 space-y-1 mb-4">
            <p>Method: <strong>{pendingPayment.method.replace('_', ' ')}</strong></p>
            <p>Amount: <strong>{formatRs(pendingPayment.amount)}</strong></p>
            {pendingPayment.referenceNum && <p>Reference: <strong>{pendingPayment.referenceNum}</strong></p>}
            {pendingPayment.proofImageUrl && (
              <a href={pendingPayment.proofImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                View proof image →
              </a>
            )}
          </div>
          <div className="flex gap-3">
            <form action={verifyPaymentAction.bind(null, pendingPayment.id, true, undefined)}>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition">
                ✓ Verify Payment
              </button>
            </form>
            <form action={verifyPaymentAction.bind(null, pendingPayment.id, false, 'Payment could not be verified')}>
              <button type="submit" className="border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-50 transition">
                ✗ Reject
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payment history */}
      {invoice.payments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Payment History</h3>
          <div className="space-y-3">
            {invoice.payments.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-700">{p.method.replace('_', ' ')}</span>
                  {p.referenceNum && <span className="text-gray-400 ml-2">#{p.referenceNum}</span>}
                  <span className="text-gray-400 ml-2">· {new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900">{formatRs(p.amount)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    p.status === 'VERIFIED' ? 'bg-green-100 text-green-700'
                    : p.status === 'REJECTED' ? 'bg-red-100 text-red-600'
                    : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {p.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
