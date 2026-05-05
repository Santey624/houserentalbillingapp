import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatRs } from '@/lib/utils'

export default async function InvoicesPage(props: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await props.searchParams
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')

  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
  if (!landlord) redirect('/auth/signin')

  const invoices = await db.invoice.findMany({
    where: {
      tenancy: { unit: { building: { landlordId: landlord.id } } },
      ...(status ? { status: status as never } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <Link
          href="/landlord/invoices/new"
          className="bg-[#0f3460] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0f3460]/90 transition"
        >
          + New Invoice
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6">
        {['', 'UNPAID', 'PAYMENT_SUBMITTED', 'PAID', 'OVERDUE'].map((s) => (
          <Link
            key={s}
            href={s ? `/landlord/invoices?status=${s}` : '/landlord/invoices'}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              status === s || (!status && s === '')
                ? 'bg-[#0f3460] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s || 'All'}
          </Link>
        ))}
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🧾</div>
          <p>No invoices yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {invoices.map((inv) => (
            <Link
              key={inv.id}
              href={`/landlord/invoices/${inv.id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
            >
              <div>
                <div className="font-medium text-sm text-gray-900">{inv.invoiceNumber}</div>
                <div className="text-xs text-gray-400">{inv.tenantName} · {inv.nepaliMonth} {inv.nepaliYear}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">{formatRs(inv.grandTotal)}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  inv.status === 'PAID' ? 'bg-green-100 text-green-700'
                  : inv.status === 'PAYMENT_SUBMITTED' ? 'bg-blue-100 text-blue-700'
                  : inv.status === 'OVERDUE' ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600'
                }`}>
                  {inv.status.replace('_', ' ')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
