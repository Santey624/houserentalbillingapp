import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatRs } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/StatusBadge'

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">

      {/* Heading */}
      <div className="mb-8">
        <h1
          className="font-heading text-4xl font-bold text-[#2d2d2d] inline-block"
          style={{ transform: 'rotate(0.6deg)' }}
        >
          Hi, {tenant.displayName}! 🏠
        </h1>
        <p className="text-[#2d2d2d]/50 text-sm mt-1">your rental dashboard</p>
      </div>

      {/* Pending join requests */}
      {tenant.joinRequests.length > 0 && (
        <div
          className="bg-[#fff9c4] border-[2px] border-[#2d2d2d] p-5 mb-6 shadow-hard-sm"
          style={{ borderRadius: '95px 8px 85px 8px / 8px 85px 8px 95px' }}
        >
          <p className="text-[#2d2d2d] text-sm font-medium mb-1">📬 Pending Join Request</p>
          {tenant.joinRequests.map((jr: (typeof tenant.joinRequests)[number]) => (
            <p key={jr.id} className="text-[#2d2d2d]/70 text-sm">
              Waiting for approval from <strong>{jr.building.name}</strong>
            </p>
          ))}
        </div>
      )}

      {!activeTenancy ? (
        <div
          className="bg-white border-[3px] border-[#2d2d2d] p-12 text-center shadow-hard"
          style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
        >
          <div className="text-5xl mb-4 animate-bounce-gentle inline-block">🏠</div>
          <h2 className="font-heading text-2xl font-bold text-[#2d2d2d] mb-2">No active tenancy</h2>
          <p className="text-[#2d2d2d]/50 text-sm mb-6">find a building and request to join</p>
          <Link
            href="/tenant/buildings"
            className="btn-sketch inline-block bg-[#2d2d2d] text-white px-6 py-3 border-[3px] border-[#2d2d2d] text-sm font-medium hover:bg-[#ff4d4d] hover:border-[#ff4d4d]"
          >
            Find a Building →
          </Link>
        </div>
      ) : (
        <>
          {/* Info cards */}
          <div className="grid grid-cols-1 gap-5 mb-8 lg:grid-cols-2">
            <div
              className="bg-white border-[3px] border-[#2d2d2d] p-5 shadow-hard"
              style={{ borderRadius: '185px 15px 155px 15px / 15px 155px 15px 185px', transform: 'rotate(-0.4deg)' }}
            >
              <p className="text-xs text-[#2d2d2d]/50 mb-1">Current Address</p>
              <p className="font-heading text-lg font-bold text-[#2d2d2d]">
                {activeTenancy.unit.building.name}
              </p>
              <p className="text-[#2d2d2d]/70 text-sm">Unit {activeTenancy.unit.unitNumber}</p>
              <p className="text-[#2d2d2d]/40 text-xs mt-1">{activeTenancy.unit.building.address}</p>
            </div>

            {latestInvoice && (
              <Link
                href={`/tenant/invoices/${latestInvoice.id}`}
                className="bg-white border-[3px] border-[#2d2d2d] p-5 block transition-all duration-100"
                style={{
                  borderRadius: '185px 15px 155px 15px / 15px 155px 15px 185px',
                  transform: 'rotate(0.5deg)',
                  boxShadow: '4px 4px 0px 0px #2d2d2d',
                }}
              >
                <p className="text-xs text-[#2d2d2d]/50 mb-1">Latest Invoice</p>
                <p className="font-heading text-lg font-bold text-[#2d2d2d]">
                  {latestInvoice.invoiceNumber}
                </p>
                <p className="text-[#2d2d2d]/70 text-sm">
                  {latestInvoice.nepaliMonth} {latestInvoice.nepaliYear}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-heading text-xl font-bold text-[#2d2d2d]">
                    {formatRs(latestInvoice.grandTotal)}
                  </span>
                  <StatusBadge status={latestInvoice.status} />
                </div>
              </Link>
            )}
          </div>

          {/* Recent invoices */}
          <div
            className="bg-white border-[3px] border-[#2d2d2d] overflow-hidden shadow-hard"
            style={{ borderRadius: '185px 15px 155px 15px / 15px 155px 15px 185px' }}
          >
            <div className="flex items-center justify-between border-b-[2px] border-dashed border-[#2d2d2d]/30 px-6 py-4">
              <h2 className="font-heading text-xl font-bold text-[#2d2d2d]">Recent Invoices</h2>
              <Link
                href="/tenant/invoices"
                className="text-sm text-[#2d5da1] hover:underline underline-offset-2"
              >
                View all →
              </Link>
            </div>

            {activeTenancy.invoices.length === 0 ? (
              <div className="px-6 py-12 text-center text-[#2d2d2d]/40 text-sm italic">
                No invoices yet ✏️
              </div>
            ) : (
              <div className="divide-y-[2px] divide-dashed divide-[#2d2d2d]/15">
                {activeTenancy.invoices.map((inv: (typeof activeTenancy.invoices)[number]) => (
                  <Link
                    key={inv.id}
                    href={`/tenant/invoices/${inv.id}`}
                    className="flex items-start justify-between gap-4 px-6 py-4 hover:bg-[#e5e0d8]/40 transition-colors sm:items-center"
                  >
                    <div>
                      <div className="font-medium text-sm text-[#2d2d2d]">{inv.invoiceNumber}</div>
                      <div className="text-xs text-[#2d2d2d]/50">{inv.nepaliMonth} {inv.nepaliYear}</div>
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
        </>
      )}
    </div>
  )
}
