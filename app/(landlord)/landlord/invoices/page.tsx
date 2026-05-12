import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatRs } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/StatusBadge'

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-3xl font-bold text-[#2d2d2d]">Invoices 🧾</h1>
        <Link
          href="/landlord/invoices/new"
          className="btn-sketch inline-block bg-[#2d2d2d] text-white text-sm px-4 py-2.5 border-[3px] border-[#2d2d2d] hover:bg-[#ff4d4d] hover:border-[#ff4d4d] self-start"
        >
          + New Invoice
        </Link>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((s) => (
          <Link
            key={s}
            href={s ? `/landlord/invoices?status=${s}` : '/landlord/invoices'}
            className={`px-3 py-1.5 text-xs font-medium border-[2px] transition-all duration-100 wobbly-sm ${
              (status === s) || (!status && s === '')
                ? 'bg-[#2d2d2d] text-white border-[#2d2d2d] shadow-hard-sm'
                : 'bg-white text-[#2d2d2d] border-[#2d2d2d]/40 hover:border-[#2d2d2d] hover:bg-[#e5e0d8]'
            }`}
          >
            {filterLabels[s]}
          </Link>
        ))}
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-16 text-[#2d2d2d]/40">
          <div className="text-5xl mb-3 animate-bounce-gentle inline-block">🧾</div>
          <p className="italic">No invoices found.</p>
        </div>
      ) : (
        <div className="card-sketch overflow-hidden">
          <div className="divide-y-[2px] divide-dashed divide-[#2d2d2d]/15">
            {invoices.map((inv: any) => (
              <Link
                key={inv.id}
                href={`/landlord/invoices/${inv.id}`}
                className="flex items-start justify-between gap-4 px-4 sm:px-6 py-4 hover:bg-[#e5e0d8]/40 transition-colors sm:items-center"
              >
                <div className="min-w-0">
                  <div className="font-medium text-sm text-[#2d2d2d] truncate">{inv.invoiceNumber}</div>
                  <div className="text-xs text-[#2d2d2d]/50 truncate">
                    {inv.tenantName} · {inv.nepaliMonth} {inv.nepaliYear}
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
