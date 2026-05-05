import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatRs } from '@/lib/utils'

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
      where: {
        building: { landlordId: landlord.id },
        status: 'PENDING',
      },
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

  const totalUnits = landlord.buildings.reduce((s, b) => s + b.units.length, 0)
  const occupiedUnits = landlord.buildings.reduce(
    (s, b) => s + b.units.filter((u) => u.tenancies.length > 0).length,
    0
  )

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Welcome, {landlord.displayName}
      </h1>
      <p className="text-gray-500 text-sm mb-8">Here&apos;s your rental overview.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Buildings', value: landlord.buildings.length, href: '/landlord/buildings' },
          { label: 'Units', value: `${occupiedUnits}/${totalUnits}`, href: '/landlord/buildings' },
          { label: 'Pending Payments', value: pendingPayments, href: '/landlord/invoices', highlight: pendingPayments > 0 },
          { label: 'Join Requests', value: pendingJoinRequests, href: '/landlord/join-requests', highlight: pendingJoinRequests > 0 },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className={`text-3xl font-bold mb-1 ${stat.highlight ? 'text-orange-500' : 'text-[#0f3460]'}`}>
              {stat.value}
            </div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Alerts */}
      {(pendingJoinRequests > 0 || pendingPayments > 0 || openMaintenance > 0) && (
        <div className="space-y-3 mb-8">
          {pendingJoinRequests > 0 && (
            <Link href="/landlord/join-requests" className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 text-sm text-blue-800 hover:bg-blue-100 transition">
              <span>📬</span>
              <strong>{pendingJoinRequests}</strong> pending join request{pendingJoinRequests > 1 ? 's' : ''}
            </Link>
          )}
          {pendingPayments > 0 && (
            <Link href="/landlord/invoices" className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-5 py-3 text-sm text-orange-800 hover:bg-orange-100 transition">
              <span>💰</span>
              <strong>{pendingPayments}</strong> payment{pendingPayments > 1 ? 's' : ''} waiting verification
            </Link>
          )}
          {openMaintenance > 0 && (
            <Link href="/landlord/maintenance" className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3 text-sm text-yellow-800 hover:bg-yellow-100 transition">
              <span>🔧</span>
              <strong>{openMaintenance}</strong> open maintenance request{openMaintenance > 1 ? 's' : ''}
            </Link>
          )}
        </div>
      )}

      {/* Recent Invoices */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Invoices</h2>
          <Link href="/landlord/invoices/new" className="text-sm bg-[#0f3460] text-white px-4 py-1.5 rounded-lg hover:bg-[#0f3460]/90 transition">
            + New Invoice
          </Link>
        </div>
        {recentInvoices.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">No invoices yet.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentInvoices.map((inv) => (
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
    </div>
  )
}
