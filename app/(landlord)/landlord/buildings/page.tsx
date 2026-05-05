import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function BuildingsPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')

  const landlord = await db.landlord.findUnique({
    where: { userId: session.user.id },
    include: {
      buildings: {
        include: { _count: { select: { units: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!landlord) redirect('/auth/signin')

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Buildings</h1>
        <Link
          href="/landlord/buildings/new"
          className="bg-[#0f3460] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0f3460]/90 transition"
        >
          + New Building
        </Link>
      </div>

      {landlord.buildings.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🏢</div>
          <p>No buildings yet. Create your first building.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {landlord.buildings.map((b) => (
            <Link
              key={b.id}
              href={`/landlord/buildings/${b.id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-2xl">🏢</div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${b.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {b.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{b.name}</h3>
              <p className="text-gray-500 text-xs mb-3">{b.address}</p>
              <div className="text-sm text-gray-400">{b._count.units} unit{b._count.units !== 1 ? 's' : ''}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
