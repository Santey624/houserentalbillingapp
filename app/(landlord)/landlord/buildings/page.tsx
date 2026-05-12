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
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-3xl font-bold text-[#2d2d2d]">Buildings 🏢</h1>
        <Link
          href="/landlord/buildings/new"
          className="btn-sketch inline-block bg-[#2d2d2d] text-white text-sm px-4 py-2.5 border-[3px] border-[#2d2d2d] hover:bg-[#ff4d4d] hover:border-[#ff4d4d] self-start"
        >
          + New Building
        </Link>
      </div>

      {landlord.buildings.length === 0 ? (
        <div className="text-center py-16 text-[#2d2d2d]/40">
          <div className="text-5xl mb-3 animate-bounce-gentle inline-block">🏢</div>
          <p className="italic">No buildings yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {landlord.buildings.map((b: any, i: number) => {
            const rotations = ['-0.5deg', '0.4deg', '-0.3deg', '0.6deg']
            return (
              <Link
                key={b.id}
                href={`/landlord/buildings/${b.id}`}
                className="card-sketch block p-5 hover:-translate-y-0.5"
                style={{ transform: `rotate(${rotations[i % rotations.length]})` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">🏢</span>
                  <span className={`text-xs px-2 py-0.5 border-[2px] font-medium wobbly-pill ${
                    b.isOpen
                      ? 'bg-[#d4f5d4] text-[#1a5c1a] border-[#1a5c1a]'
                      : 'bg-[#e5e0d8] text-[#2d2d2d] border-[#2d2d2d]'
                  }`}>
                    {b.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-bold text-[#2d2d2d] mb-1">{b.name}</h3>
                <p className="text-[#2d2d2d]/50 text-xs mb-3">{b.address}</p>
                <p className="text-sm text-[#2d2d2d]/60">
                  {b._count.units} unit{b._count.units !== 1 ? 's' : ''}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
