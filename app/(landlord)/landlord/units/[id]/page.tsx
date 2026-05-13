import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatRs } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ChevronLeft, FileText, User } from 'lucide-react'

export default async function UnitDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')

  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
  if (!landlord) redirect('/auth/signin')

  const unit = await db.unit.findFirst({
    where: { id, building: { landlordId: landlord.id } },
    include: {
      building: true,
      tenancies: {
        include: { tenant: true },
        orderBy: { createdAt: 'desc' },
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })
  if (!unit) notFound()

  const activeTenancy = unit.tenancies.find((t: (typeof unit.tenancies)[number]) => t.status === 'ACTIVE')

  return (
    <div className="p-5 sm:p-8 max-w-3xl">
      <Link
        href={`/landlord/buildings/${unit.buildingId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft size={14} />
        {unit.building.name}
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl text-foreground mb-1">Unit {unit.unitNumber}</h1>
          {unit.floor && <p className="text-muted-foreground text-sm">Floor: {unit.floor}</p>}
        </div>
        <Link
          href={`/landlord/invoices/new?unitId=${unit.id}&tenancyId=${activeTenancy?.id ?? ''}`}
          className={`btn-primary ${!activeTenancy ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <FileText size={14} />
          Generate Invoice
        </Link>
      </div>

      {/* Current Tenant */}
      <div className="card-modern p-6 mb-6">
        <h2 className="font-semibold text-foreground mb-4">Current Tenant</h2>
        {activeTenancy ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <span className="font-semibold text-muted-foreground">
                {activeTenancy.tenant.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-foreground">{activeTenancy.tenant.displayName}</p>
              <p className="text-muted-foreground text-xs">Since {new Date(activeTenancy.startDate).toLocaleDateString()}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-muted-foreground">
            <User size={16} />
            <p className="text-sm">No active tenant.</p>
          </div>
        )}
      </div>

      {/* Invoices */}
      <div className="card-modern overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Invoices</h2>
        </div>
        {unit.invoices.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground text-sm">
            No invoices for this unit.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {unit.invoices.map((inv: (typeof unit.invoices)[number]) => (
              <Link
                key={inv.id}
                href={`/landlord/invoices/${inv.id}`}
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
    </div>
  )
}
