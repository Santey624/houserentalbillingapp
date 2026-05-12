import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatRs } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/StatusBadge'

export default async function LandlordDashboard() {
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')

  const landlord = await db.landlord.findUnique({
    where: { userId: session.user.id },
    include: {
      buildings: {
        include: { units: { include: { tenancies: { where: { status: 'ACTIVE' } } } } },
      },
    },
  })

  if (!landlord) redirect('/auth/signin')
  if (!landlord.onboardingDone) redirect('/landlord/onboarding')

  const [pendingJoinRequests, pendingPayments, openMaintenance, recentInvoices] = await Promise.all([
    db.joinRequest.count({
      where: { building: { landlordId: landlord.id }, status: 'PENDING' },
    }),
    db.invoice.count({
      where: {
        tenancy: { unit: { building: { landlordId: landlord.id } } },
        status: 'PAYMENT_SUBMITTED',
      },
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
    }),
  ])

  const totalUnits = landlord.buildings.reduce(
    (s: number, b: (typeof landlord.buildings)[number]) => s + b.units.length, 0,
  )
  const occupiedUnits = landlord.buildings.reduce(
    (s: number, b: (typeof landlord.buildings)[number]) =>
      s + b.units.filter((u: (typeof b.units)[number]) => u.tenancies.length > 0).length, 0,
  )

  const stats = [
    { label: 'Buildings', value: landlord.buildings.length, href: '/landlord/buildings', rotate: '-0.8deg' },
    { label: 'Units occupied', value: `${occupiedUnits}/${totalUnits}`, href: '/landlord/buildings', rotate: '0.6deg' },
    { label: 'Pending payments', value: pendingPayments, href: '/landlord/invoices', highlight: pendingPayments > 0, rotate: '-0.5deg' },
    { label: 'Join requests', value: pendingJoinRequests, href: '/landlord/join-requests', highlight: pendingJoinRequests > 0, rotate: '0.9deg' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">

      {/* Heading */}
      <div className="mb-8">
        <h1
          className="font-heading text-4xl font-bold text-[#2d2d2d] inline-block"
          style={{ transform: 'rotate(-0.8deg)' }}
        >
          Hey, {landlord.displayName}! 👋
        </h1>
        <p className="text-[#2d2d2d]/50 text-sm mt-1">here&apos;s your rental overview ↓</p>
      </div>

      {/* Stat cards — each slightly rotated */}
      <div className="grid grid-cols-2 gap-4 mb-8 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="card-sketch bg-white border-[3px] border-[#2d2d2d] p-5 block transition-all duration-100 hover:-translate-y-0.5"
            style={{ transform: `rotate(${stat.rotate})`, willChange: 'transform' }}
          >
            <div
              className={`font-heading text-4xl font-bold mb-1 ${stat.highlight ? 'text-[#ff4d4d]' : 'text-[#2d2d2d]'}`}
            >
              {stat.value}
            </div>
            <div className="text-xs text-[#2d2d2d]/60">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Alert banners */}
      {(pendingJoinRequests > 0 || pendingPayments > 0 || openMaintenance > 0) && (
        <div className="space-y-3 mb-8">
          {pendingJoinRequests > 0 && (
            <Link
              href="/landlord/join-requests"
              className="flex items-center gap-3 bg-[#fff9c4] border-[2px] border-[#2d2d2d] px-5 py-3 text-sm text-[#2d2d2d] hover:shadow-hard-sm transition-all duration-100"
              style={{ borderRadius: '95px 8px 85px 8px / 8px 85px 8px 95px' }}
            >
              <span>📬</span>
              <span><strong>{pendingJoinRequests}</strong> pending join request{pendingJoinRequests > 1 ? 's' : ''}</span>
            </Link>
          )}
          {pendingPayments > 0 && (
            <Link
              href="/landlord/invoices"
              className="flex items-center gap-3 bg-[#ff4d4d]/10 border-[2px] border-[#ff4d4d] px-5 py-3 text-sm text-[#2d2d2d] hover:shadow-hard-accent transition-all duration-100"
              style={{ borderRadius: '95px 8px 85px 8px / 8px 85px 8px 95px' }}
            >
              <span>💰</span>
              <span><strong>{pendingPayments}</strong> payment{pendingPayments > 1 ? 's' : ''} waiting verification</span>
            </Link>
          )}
          {openMaintenance > 0 && (
            <Link
              href="/landlord/maintenance"
              className="flex items-center gap-3 bg-[#e5e0d8] border-[2px] border-[#2d2d2d] px-5 py-3 text-sm text-[#2d2d2d] hover:shadow-hard-sm transition-all duration-100"
              style={{ borderRadius: '95px 8px 85px 8px / 8px 85px 8px 95px' }}
            >
              <span>🔧</span>
              <span><strong>{openMaintenance}</strong> open maintenance request{openMaintenance > 1 ? 's' : ''}</span>
            </Link>
          )}
        </div>
      )}

      {/* Recent invoices */}
      <div className="bg-white border-[3px] border-[#2d2d2d] overflow-hidden shadow-hard wobbly-md">
        <div className="flex flex-col gap-3 border-b-[2px] border-dashed border-[#2d2d2d]/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-heading text-xl font-bold text-[#2d2d2d]">Recent Invoices</h2>
          <Link
            href="/landlord/invoices/new"
            className="btn-sketch inline-block bg-[#2d2d2d] text-white text-sm px-4 py-2 border-[3px] border-[#2d2d2d] hover:bg-[#ff4d4d] hover:border-[#ff4d4d]"
          >
            + New Invoice
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="px-6 py-12 text-center text-[#2d2d2d]/40 text-sm italic">
            No invoices yet. Create your first one! ✏️
          </div>
        ) : (
          <div className="divide-y-[2px] divide-dashed divide-[#2d2d2d]/15">
            {recentInvoices.map((inv: (typeof recentInvoices)[number]) => (
              <Link
                key={inv.id}
                href={`/landlord/invoices/${inv.id}`}
                className="flex items-start justify-between gap-4 px-6 py-4 hover:bg-[#e5e0d8]/40 transition-colors sm:items-center"
              >
                <div>
                  <div className="font-medium text-sm text-[#2d2d2d]">{inv.invoiceNumber}</div>
                  <div className="text-xs text-[#2d2d2d]/50">{inv.tenantName} · {inv.nepaliMonth} {inv.nepaliYear}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-semibold text-[#2d2d2d]">{formatRs(inv.grandTotal)}</div>
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
