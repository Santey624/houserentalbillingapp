import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export default async function BuildingDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')

  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
  if (!landlord) redirect('/auth/signin')

  const building = await db.building.findFirst({
    where: { id, landlordId: landlord.id },
    include: {
      units: {
        include: {
          tenancies: {
            where: { status: 'ACTIVE' },
            include: { tenant: true },
          },
          _count: { select: { invoices: true } },
        },
        orderBy: { unitNumber: 'asc' },
      },
      _count: { select: { joinRequests: { where: { status: 'PENDING' } } } },
    },
  })
  if (!building) notFound()

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/landlord/buildings" className="text-gray-400 hover:text-gray-600 text-sm">← Buildings</Link>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{building.name}</h1>
          <p className="text-gray-500 text-sm">{building.address}</p>
        </div>
        <div className="flex gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${building.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {building.isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>

      {building._count.joinRequests > 0 && (
        <Link href="/landlord/join-requests" className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 text-sm text-blue-800 hover:bg-blue-100 transition mb-6">
          📬 {building._count.joinRequests} pending join request{building._count.joinRequests > 1 ? 's' : ''}
        </Link>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Units ({building.units.length})</h2>
        <Link
          href={`/landlord/buildings/new?buildingId=${id}`}
          className="text-sm bg-[#0f3460] text-white px-4 py-1.5 rounded-lg hover:bg-[#0f3460]/90 transition"
        >
          + Add Unit
        </Link>
      </div>

      {building.units.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
          <div className="text-4xl mb-2">🏠</div>
          <p>No units yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {building.units.map((unit: any) => {
            const activeTenancy = unit.tenancies[0]
            return (
              <Link
                key={unit.id}
                href={`/landlord/units/${unit.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">Unit {unit.unitNumber}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${activeTenancy ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    {activeTenancy ? 'Occupied' : 'Vacant'}
                  </span>
                </div>
                {unit.floor && <p className="text-xs text-gray-400 mb-2">Floor: {unit.floor}</p>}
                {activeTenancy && (
                  <p className="text-sm text-gray-600">{activeTenancy.tenant.displayName}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">{unit._count.invoices} invoice{unit._count.invoices !== 1 ? 's' : ''}</p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
