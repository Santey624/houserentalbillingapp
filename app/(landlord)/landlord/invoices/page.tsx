import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatRs } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { FileText, Plus } from 'lucide-react'

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

  const filters = ['', 'UNPAID', 'PAYMENT_SUBMITTED', 'PAID', 'OVERDUE']
  const filterLabels: Record<string, string> = {
    '': 'All', UNPAID: 'Unpaid', PAYMENT_SUBMITTED: 'Submitted', PAID: 'Paid', OVERDUE: 'Overdue',
  }

  return (
    <div className="p-5 sm:p-8 max-w-4xl">
      <div className="flex flex-col gap-3 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl text-foreground mb-1">Invoices</h1>
          <p className="text-sm text-muted-foreground">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/landlord/invoices/new" className="btn-primary self-start">
          <Plus size={14} />
          New Invoice
        </Link>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((s) => {
          const isActive = (status === s) || (!status && s === '')
          return (
            <Link
              key={s}
              href={s ? `/landlord/invoices?status=${s}` : '/landlord/invoices'}
              className={`px-4 py-1.5 text-xs font-medium rounded-full border transition-all duration-150 ${
                isActive
                  ? 'gradient-bg text-white border-transparent shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:border-accent/40 hover:text-foreground'
              }`}
            >
              {filterLabels[s]}
            </Link>
          )
        })}
      </div>

      {invoices.length === 0 ? (
        <div className="card-modern flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <FileText size={24} className="text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">No invoices found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {status ? 'Try a different filter' : 'Create your first invoice'}
          </p>
        </div>
      ) : (
        <div className="card-modern overflow-hidden">
          <div className="divide-y divide-border">
            {invoices.map((inv: any) => (
              <Link
                key={inv.id}
                href={`/landlord/invoices/${inv.id}`}
                className="list-row"
              >
                <div className="min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">{inv.invoiceNumber}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">
                    {inv.tenantName} &middot; {inv.nepaliMonth} {inv.nepaliYear}
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
