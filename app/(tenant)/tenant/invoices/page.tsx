import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatRs } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { FileText } from 'lucide-react'

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
    <div className="p-5 sm:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-4xl text-foreground mb-1">My Invoices</h1>
        <p className="text-sm text-muted-foreground">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</p>
      </div>

      {invoices.length === 0 ? (
        <div className="card-modern flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <FileText size={24} className="text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">No invoices yet</p>
          <p className="text-sm text-muted-foreground mt-1">Your invoices will appear here</p>
        </div>
      ) : (
        <div className="card-modern overflow-hidden">
          <div className="divide-y divide-border">
            {invoices.map((inv: (typeof invoices)[number]) => (
              <Link
                key={inv.id}
                href={`/tenant/invoices/${inv.id}`}
                className="list-row"
              >
                <div className="min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">{inv.invoiceNumber}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {inv.nepaliMonth} {inv.nepaliYear} &middot; {inv.invoiceDate}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-semibold text-foreground">{formatRs(inv.grandTotal)}</div>
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
