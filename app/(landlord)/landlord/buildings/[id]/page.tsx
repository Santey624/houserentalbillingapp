import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Mail, Plus, Home, Receipt } from 'lucide-react'

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
    <div className="p-5 sm:p-8 max-w-5xl">
      <Link href="/landlord/buildings" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ChevronLeft size={14} />
        Buildings
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-4xl text-foreground mb-1">{building.name}</h1>
          <p className="text-muted-foreground text-sm">{building.address}</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium border ${
          building.isOpen
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-slate-100 text-slate-500 border-slate-200'
        }`}>
          {building.isOpen ? 'Open' : 'Closed'}
        </span>
      </div>

      {building._count.joinRequests > 0 && (
        <Link href="/landlord/join-requests" className="alert-info mb-6 block">
          <Mail size={16} className="text-accent flex-shrink-0" />
          {building._count.joinRequests} pending join request{building._count.joinRequests > 1 ? 's' : ''}
        </Link>
      )}

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-foreground">
          Units <span className="text-sm font-normal text-muted-foreground ml-1">({building.units.length})</span>
        </h2>
        <Link href={`/landlord/buildings/${id}/units/new`} className="btn-secondary py-1.5 px-3 text-xs">
          <Plus size={12} />
          Add Unit
        </Link>
      </div>

      {building.units.length === 0 ? (
        <div className="card-modern flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
            <Home size={20} className="text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No units yet. Add your first unit.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {building.units.map((unit: any) => {
            const activeTenancy = unit.tenancies[0]
            return (
              <div key={unit.id} className="card-modern p-5 flex flex-col">
                <Link
                  href={`/landlord/units/${unit.id}`}
                  className="block group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-foreground group-hover:text-accent transition-colors">Unit {unit.unitNumber}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${
                      activeTenancy
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {activeTenancy ? 'Occupied' : 'Vacant'}
                    </span>
                  </div>
                  {unit.floor && <p className="text-xs text-muted-foreground mb-2">Floor: {unit.floor}</p>}
                  {activeTenancy && (
                    <p className="text-sm text-foreground mb-2">{activeTenancy.tenant.displayName}</p>
                  )}
                  <p className="text-xs text-muted-foreground mb-4">
                    {unit._count.invoices} invoice{unit._count.invoices !== 1 ? 's' : ''}
                  </p>
                </Link>
                
                <div className="mt-auto pt-4 border-t border-border flex gap-2">
                  {activeTenancy ? (
                    <Link
                      href={`/landlord/invoices/new?tenancyId=${activeTenancy.id}&unitId=${unit.id}`}
                      className="btn-primary w-full py-1.5 text-xs h-8"
                    >
                      <Receipt size={12} />
                      Generate Bill
                    </Link>
                  ) : (
                    <Link
                      href={`/landlord/invoices/new?mode=direct&unitId=${unit.id}`}
                      className="btn-secondary w-full py-1.5 text-xs h-8"
                    >
                      <Receipt size={12} />
                      Bill Directly
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
