import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatRs } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Search, MapPin, Mail } from 'lucide-react'

export default async function TenantDashboard() {
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')

  const tenant = await db.tenant.findUnique({
    where: { userId: session.user.id },
    include: {
      tenancies: {
        where: { status: 'ACTIVE' },
        include: {
          unit: { include: { building: { include: { landlord: true } } } },
          invoices: { orderBy: { createdAt: 'desc' }, take: 5 },
        },
      },
      joinRequests: {
        where: { status: 'PENDING' },
        include: { building: true },
      },
    },
  })
  if (!tenant) redirect('/auth/signin')

  const activeTenancy = tenant.tenancies[0]
  const latestInvoice = activeTenancy?.invoices[0]

  return (
    <div className="p-5 sm:p-8 max-w-4xl">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-4xl text-foreground mb-1">
          Hi, {tenant.displayName}
        </h1>
        <p className="text-muted-foreground text-sm">Your rental dashboard</p>
      </div>

      {/* Pending join requests */}
      {tenant.joinRequests.length > 0 && (
        <div className="alert-warning mb-6">
          <Mail size={16} className="flex-shrink-0" />
          <div>
            <p className="font-medium text-sm">Pending Join Request</p>
            {tenant.joinRequests.map((jr: (typeof tenant.joinRequests)[number]) => (
              <p key={jr.id} className="text-sm opacity-80">
                Waiting for approval from <strong>{jr.building.name}</strong>
              </p>
            ))}
          </div>
        </div>
      )}

      {!activeTenancy ? (
        <div className="card-modern p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
            <MapPin size={28} className="text-muted-foreground" />
          </div>
          <h2 className="text-2xl text-foreground mb-2">No active tenancy</h2>
          <p className="text-muted-foreground text-sm mb-8">Find a building and request to join</p>
          <Link href="/tenant/buildings" className="btn-primary inline-flex">
            <Search size={14} />
            Find a Building
          </Link>
        </div>
      ) : (
        <>
          {/* Info cards */}
          <div className="grid grid-cols-1 gap-5 mb-6 lg:grid-cols-2">
            <div className="card-modern p-6">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Current Address</p>
              <p className="font-semibold text-lg text-foreground">
                {activeTenancy.unit.building.name}
              </p>
              <p className="text-muted-foreground text-sm">Unit {activeTenancy.unit.unitNumber}</p>
              <p className="text-muted-foreground text-xs mt-1">{activeTenancy.unit.building.address}</p>
            </div>

            {latestInvoice && (
              <Link
                href={`/tenant/invoices/${latestInvoice.id}`}
                className="card-modern card-modern-hover p-6 block"
              >
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Latest Invoice</p>
                <p className="font-semibold text-lg text-foreground">{latestInvoice.invoiceNumber}</p>
                <p className="text-muted-foreground text-sm">{latestInvoice.nepaliMonth} {latestInvoice.nepaliYear}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-2xl font-semibold text-foreground">
                    {formatRs(latestInvoice.grandTotal)}
                  </span>
                  <StatusBadge status={latestInvoice.status} />
                </div>
              </Link>
            )}
          </div>

          {/* Recent invoices */}
          <div className="card-modern overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Invoices</h2>
              <Link href="/tenant/invoices" className="text-sm text-accent hover:underline underline-offset-2">
                View all
              </Link>
            </div>

            {activeTenancy.invoices.length === 0 ? (
              <div className="px-6 py-14 text-center text-muted-foreground text-sm">
                No invoices yet.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {activeTenancy.invoices.map((inv: (typeof activeTenancy.invoices)[number]) => (
                  <Link
                    key={inv.id}
                    href={`/tenant/invoices/${inv.id}`}
                    className="list-row"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-foreground">{inv.invoiceNumber}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{inv.nepaliMonth} {inv.nepaliYear}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-semibold text-foreground">{formatRs(inv.grandTotal)}</div>
                      <StatusBadge status={inv.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
