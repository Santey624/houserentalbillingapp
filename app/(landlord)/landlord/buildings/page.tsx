import { db } from '@/lib/db'
import { getLandlord } from '@/lib/session'
import Link from 'next/link'
import { Building2, Plus } from 'lucide-react'

export default async function BuildingsPage() {
  const { landlord } = await getLandlord()

  const buildings = await db.building.findMany({
    where: { landlordId: landlord.id },
    include: { _count: { select: { units: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-5 sm:p-8 max-w-5xl">
      <div className="flex flex-col gap-3 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl text-foreground mb-1">Buildings</h1>
          <p className="text-sm text-muted-foreground">{buildings.length} building{buildings.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/landlord/buildings/new" className="btn-primary self-start">
          <Plus size={14} />
          New Building
        </Link>
      </div>

      {buildings.length === 0 ? (
        <div className="card-modern flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Building2 size={24} className="text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">No buildings yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">Create your first building to get started</p>
          <Link href="/landlord/buildings/new" className="btn-primary">
            <Plus size={14} />
            New Building
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {buildings.map((b: any) => (
            <Link
              key={b.id}
              href={`/landlord/buildings/${b.id}`}
              className="card-modern card-modern-hover p-6 block group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                  <Building2 size={18} className="text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  b.isOpen
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {b.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              <h3 className="font-semibold text-foreground mb-1">{b.name}</h3>
              <p className="text-muted-foreground text-sm mb-3 truncate">{b.address}</p>
              <p className="text-xs text-muted-foreground">
                {b._count.units} unit{b._count.units !== 1 ? 's' : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
