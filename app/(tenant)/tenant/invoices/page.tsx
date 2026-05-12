import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatRs } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/StatusBadge'

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-[#2d2d2d] mb-6">My Invoices 🧾</h1>

      {invoices.length === 0 ? (
        <div className="text-center py-16 text-[#2d2d2d]/40">
          <div className="text-5xl mb-3 animate-bounce-gentle inline-block">🧾</div>
          <p className="italic">No invoices yet.</p>
        </div>
      ) : (
        <div className="card-sketch overflow-hidden">
          <div className="divide-y-[2px] divide-dashed divide-[#2d2d2d]/15">
            {invoices.map((inv: (typeof invoices)[number]) => (
              <Link
                key={inv.id}
                href={`/tenant/invoices/${inv.id}`}
                className="flex items-start justify-between gap-4 px-4 sm:px-6 py-4 hover:bg-[#e5e0d8]/40 transition-colors sm:items-center"
              >
                <div className="min-w-0">
                  <div className="font-medium text-sm text-[#2d2d2d] truncate">{inv.invoiceNumber}</div>
                  <div className="text-xs text-[#2d2d2d]/50">
                    {inv.nepaliMonth} {inv.nepaliYear} · {inv.invoiceDate}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-semibold text-[#2d2d2d]">{formatRs(inv.grandTotal)}</div>
                  <StatusBadge status={inv.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
