import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatRs } from '@/lib/utils'

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

  const activeTenancy = unit.tenancies.find((t) => t.status === 'ACTIVE')

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-2">
        <Link href={`/landlord/buildings/${unit.buildingId}`} className="text-gray-400 hover:text-gray-600 text-sm">
          ← {unit.building.name}
        </Link>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Unit {unit.unitNumber}</h1>
          {unit.floor && <p className="text-gray-500 text-sm">Floor: {unit.floor}</p>}
        </div>
        <Link
          href={`/landlord/invoices/new?unitId=${unit.id}&tenancyId=${activeTenancy?.id ?? ''}`}
          className={`bg-[#0f3460] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0f3460]/90 transition ${!activeTenancy ? 'opacity-50 pointer-events-none' : ''}`}
        >
          Generate Invoice
        </Link>
      </div>

      {/* Current Tenant */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Current Tenant</h2>
        {activeTenancy ? (
          <div>
            <p className="text-gray-900 font-medium">{activeTenancy.tenant.displayName}</p>
            <p className="text-gray-400 text-sm">Since {new Date(activeTenancy.startDate).toLocaleDateString()}</p>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No active tenant.</p>
        )}
      </div>

      {/* Invoices */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Invoices</h2>
        </div>
        {unit.invoices.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">No invoices for this unit.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {unit.invoices.map((inv) => (
              <Link
                key={inv.id}
                href={`/landlord/invoices/${inv.id}`}
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
    </div>
  )
}
