import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatRs } from '@/lib/utils'

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
          invoices: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
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
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Welcome, {tenant.displayName}
      </h1>
      <p className="text-gray-500 text-sm mb-8">Your rental dashboard.</p>

      {/* Pending join requests */}
      {tenant.joinRequests.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <p className="text-blue-800 text-sm font-medium mb-1">
            Pending Join Request
          </p>
          {tenant.joinRequests.map((jr: (typeof tenant.joinRequests)[number]) => (
            <p key={jr.id} className="text-blue-600 text-sm">
              Waiting for approval from <strong>{jr.building.name}</strong>
            </p>
          ))}
        </div>
      )}

      {!activeTenancy ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          <div className="text-5xl mb-3">🏠</div>
          <h2 className="font-semibold text-gray-900 mb-2">No active tenancy</h2>
          <p className="text-gray-400 text-sm mb-4">Find a building and request to join.</p>
          <Link
            href="/tenant/buildings"
            className="inline-block bg-[#0f3460] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0f3460]/90 transition"
          >
            Find a Building
          </Link>
        </div>
      ) : (
        <>
          {/* Current tenancy info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-xs text-gray-400 mb-1">Current Address</p>
              <p className="font-semibold text-gray-900">{activeTenancy.unit.building.name}</p>
              <p className="text-gray-600 text-sm">Unit {activeTenancy.unit.unitNumber}</p>
              <p className="text-gray-400 text-xs mt-1">{activeTenancy.unit.building.address}</p>
            </div>
            {latestInvoice && (
              <Link href={`/tenant/invoices/${latestInvoice.id}`} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                <p className="text-xs text-gray-400 mb-1">Latest Invoice</p>
                <p className="font-semibold text-gray-900">{latestInvoice.invoiceNumber}</p>
                <p className="text-gray-600 text-sm">{latestInvoice.nepaliMonth} {latestInvoice.nepaliYear}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-900 font-bold">{formatRs(latestInvoice.grandTotal)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    latestInvoice.status === 'PAID' ? 'bg-green-100 text-green-700'
                    : latestInvoice.status === 'PAYMENT_SUBMITTED' ? 'bg-blue-100 text-blue-700'
                    : latestInvoice.status === 'OVERDUE' ? 'bg-red-100 text-red-700'
                    : 'bg-orange-100 text-orange-700'
                  }`}>
                    {latestInvoice.status.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            )}
          </div>

          {/* Recent invoices */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Recent Invoices</h2>
              <Link href="/tenant/invoices" className="text-sm text-[#0f3460] hover:underline">View all</Link>
            </div>
            {activeTenancy.invoices.length === 0 ? (
              <div className="px-6 py-10 text-center text-gray-400 text-sm">No invoices yet.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {activeTenancy.invoices.map((inv: (typeof activeTenancy.invoices)[number]) => (
                  <Link
                    key={inv.id}
                    href={`/tenant/invoices/${inv.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
                  >
                    <div>
                      <div className="font-medium text-sm text-gray-900">{inv.invoiceNumber}</div>
                      <div className="text-xs text-gray-400">{inv.nepaliMonth} {inv.nepaliYear}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{formatRs(inv.grandTotal)}</div>
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
        </>
      )}
    </div>
  )
}
