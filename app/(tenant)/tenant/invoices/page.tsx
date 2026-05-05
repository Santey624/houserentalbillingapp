import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatRs } from '@/lib/utils'

export default async function TenantInvoicesPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')

  const tenant = await db.tenant.findUnique({ where: { userId: session.user.id } })
  if (!tenant) redirect('/auth/signin')

  const invoices = await db.invoice.findMany({
    where: { tenancy: { tenantId: tenant.id } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Invoices</h1>

      {invoices.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🧾</div>
          <p>No invoices yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {invoices.map((inv: (typeof invoices)[number]) => (
            <Link
              key={inv.id}
              href={`/tenant/invoices/${inv.id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
            >
              <div>
                <div className="font-medium text-sm text-gray-900">{inv.invoiceNumber}</div>
                <div className="text-xs text-gray-400">{inv.nepaliMonth} {inv.nepaliYear} · {inv.invoiceDate}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{formatRs(inv.grandTotal)}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  inv.status === 'PAID' ? 'bg-green-100 text-green-700'
                  : inv.status === 'PAYMENT_SUBMITTED' ? 'bg-blue-100 text-blue-700'
                  : inv.status === 'OVERDUE' ? 'bg-red-100 text-red-700'
                  : 'bg-orange-100 text-orange-700'
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
