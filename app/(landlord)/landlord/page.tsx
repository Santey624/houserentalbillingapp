import { db } from '@/lib/db'
import { getLandlord } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatRs } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Building2, Mail, CreditCard, Wrench, Plus } from 'lucide-react'

export default async function LandlordDashboard() {
  const { landlord } = await getLandlord()
  if (!landlord.onboardingDone) redirect('/landlord/onboarding')

  const [buildingCount, totalUnits, occupiedUnits, pendingJoinRequests, pendingPayments, openMaintenance, recentInvoices] = await Promise.all([
    db.building.count({ where: { landlordId: landlord.id } }),
    db.unit.count({ where: { building: { landlordId: landlord.id } } }),
    db.tenancy.count({ where: { status: 'ACTIVE', unit: { building: { landlordId: landlord.id } } } }),
    db.joinRequest.count({ where: { building: { landlordId: landlord.id }, status: 'PENDING' } }),
    db.invoice.count({
      where: { tenancy: { unit: { building: { landlordId: landlord.id } } }, status: 'PAYMENT_SUBMITTED' },
    }),
    db.maintenanceRequest.count({
      where: {
        tenant: { tenancies: { some: { unit: { building: { landlordId: landlord.id } }, status: 'ACTIVE' } } },
        status: { in: ['OPEN', 'IN_PROGRESS'] },
      },
    }),
    db.invoice.findMany({
      where: { tenancy: { unit: { building: { landlordId: landlord.id } } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, invoiceNumber: true, tenantName: true, nepaliMonth: true, nepaliYear: true, grandTotal: true, status: true },
    }),
  ])

  const stats = [
    {
      label: 'Buildings',
      value: buildingCount,
      href: '/landlord/buildings',
      icon: Building2,
      accent: false,
    },
    {
      label: 'Units occupied',
      value: `${occupiedUnits} / ${totalUnits}`,
      href: '/landlord/buildings',
      icon: Building2,
      accent: false,
    },
    {
      label: 'Pending payments',
      value: pendingPayments,
      href: '/landlord/invoices',
      icon: CreditCard,
      accent: pendingPayments > 0,
    },
    {
      label: 'Join requests',
      value: pendingJoinRequests,
      href: '/landlord/join-requests',
      icon: Mail,
      accent: pendingJoinRequests > 0,
    },
  ]

  return (
    <div className="p-5 sm:p-8 max-w-5xl">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-4xl text-foreground mb-1">
          Hey, {landlord.displayName}
        </h1>
        <p className="text-muted-foreground text-sm">Here is your rental overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 mb-6 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="card-modern card-modern-hover p-5 block group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.accent ? 'gradient-bg' : 'bg-muted'}`}>
                  <Icon size={16} className={stat.accent ? 'text-white' : 'text-muted-foreground'} />
                </div>
              </div>
              <div className={`text-3xl font-semibold mb-1 ${stat.accent ? 'gradient-text' : 'text-foreground'}`}>
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </Link>
          )
        })}
      </div>

      {/* Alert banners */}
      {(pendingJoinRequests > 0 || pendingPayments > 0 || openMaintenance > 0) && (
        <div className="space-y-3 mb-6">
          {pendingJoinRequests > 0 && (
            <Link href="/landlord/join-requests" className="alert-info block">
              <Mail size={16} className="text-accent flex-shrink-0" />
              <span>
                <strong>{pendingJoinRequests}</strong> pending join request{pendingJoinRequests > 1 ? 's' : ''} waiting for your review
              </span>
            </Link>
          )}
          {pendingPayments > 0 && (
            <Link href="/landlord/invoices" className="alert-info block">
              <CreditCard size={16} className="text-accent flex-shrink-0" />
              <span>
                <strong>{pendingPayments}</strong> payment{pendingPayments > 1 ? 's' : ''} submitted and waiting verification
              </span>
            </Link>
          )}
          {openMaintenance > 0 && (
            <Link href="/landlord/maintenance" className="alert-warning block">
              <Wrench size={16} className="flex-shrink-0" />
              <span>
                <strong>{openMaintenance}</strong> open maintenance request{openMaintenance > 1 ? 's' : ''}
              </span>
            </Link>
          )}
        </div>
      )}

      {/* Recent invoices */}
      <div className="card-modern overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent Invoices</h2>
          <Link href="/landlord/invoices/new" className="btn-primary self-start">
            <Plus size={14} />
            New Invoice
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-muted-foreground text-sm">No invoices yet. Create your first one!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentInvoices.map((inv: (typeof recentInvoices)[number]) => (
              <Link
                key={inv.id}
                href={`/landlord/invoices/${inv.id}`}
                className="list-row"
              >
                <div className="min-w-0">
                  <div className="font-medium text-sm text-foreground">{inv.invoiceNumber}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{inv.tenantName} &middot; {inv.nepaliMonth} {inv.nepaliYear}</div>
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
