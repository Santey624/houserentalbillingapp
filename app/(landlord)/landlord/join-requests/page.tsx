import { db } from '@/lib/db'
import { getLandlord } from '@/lib/session'
import { approveJoinRequestAction, rejectJoinRequestAction } from '@/app/actions/join-requests'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Mail } from 'lucide-react'
import Link from 'next/link'

export default async function JoinRequestsPage(props: {
  searchParams: Promise<{ error?: string; approved?: string }>
}) {
  const { error, approved } = await props.searchParams
  const { landlord } = await getLandlord()

  const requests = await db.joinRequest.findMany({
    where: { building: { landlordId: landlord.id } },
    include: {
      tenant: { include: { user: true } },
      building: true,
      unit: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const pending = requests.filter((r: (typeof requests)[number]) => r.status === 'PENDING')
  const resolved = requests.filter((r: (typeof requests)[number]) => r.status !== 'PENDING')

  const pendingBuildingIds = [...new Set(pending.map((r) => r.buildingId))]
  const vacantUnits =
    pendingBuildingIds.length === 0
      ? []
      : await db.unit.findMany({
          where: {
            buildingId: { in: pendingBuildingIds },
            tenancies: { none: { status: 'ACTIVE' } },
          },
          select: { id: true, unitNumber: true, buildingId: true },
          orderBy: { unitNumber: 'asc' },
        })

  const vacantUnitsByBuilding = vacantUnits.reduce<
    Record<string, { id: string; unitNumber: string }[]>
  >((acc, unit) => {
    ;(acc[unit.buildingId] ??= []).push({ id: unit.id, unitNumber: unit.unitNumber })
    return acc
  }, {})

  return (
    <div className="p-5 sm:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-4xl text-foreground mb-1">Join Requests</h1>
        <p className="text-sm text-muted-foreground">{pending.length} pending</p>
      </div>

      {approved && (
        <div className="alert-success mb-6">Join request approved.</div>
      )}
      {error && <div className="alert-error mb-6">{error}</div>}

      {requests.length === 0 && (
        <div className="card-modern flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Mail size={24} className="text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">No join requests yet</p>
          <p className="text-sm text-muted-foreground mt-1">Requests from tenants will appear here</p>
        </div>
      )}

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Pending <span className="text-sm font-normal text-muted-foreground ml-1">({pending.length})</span>
          </h2>
          <div className="space-y-4">
            {pending.map((req: (typeof pending)[number]) => {
              const buildingVacantUnits = vacantUnitsByBuilding[req.buildingId] ?? []
              return (
                <div key={req.id} className="card-modern p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-muted-foreground">
                          {req.tenant.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{req.tenant.displayName}</p>
                        <p className="text-xs text-muted-foreground">{req.tenant.user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-1">
                    Building: <span className="font-medium text-foreground">{req.building.name}</span>
                    {req.unit && (
                      <>
                        {' '}
                        &middot; Unit:{' '}
                        <span className="font-medium text-foreground">{req.unit.unitNumber}</span>
                      </>
                    )}
                    {!req.unit && (
                      <>
                        {' '}
                        &middot; <span className="font-medium text-amber-700">No unit selected</span>
                      </>
                    )}
                  </p>
                  {req.note && (
                    <p className="text-sm text-muted-foreground italic mb-4 mt-2 p-3 bg-muted rounded-lg">
                      &ldquo;{req.note}&rdquo;
                    </p>
                  )}

                  <form action={approveJoinRequestAction} className="pt-4 border-t border-border space-y-3">
                    <input type="hidden" name="requestId" value={req.id} />
                    {!req.unitId && (
                      <div className="space-y-3 rounded-xl bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">
                          This tenant did not pick a unit. Assign an existing vacant unit or create a new one.
                        </p>
                        {buildingVacantUnits.length > 0 && (
                          <div>
                            <label className="field-label" htmlFor={`unit-${req.id}`}>
                              Assign vacant unit
                            </label>
                            <select
                              id={`unit-${req.id}`}
                              name="unitId"
                              className="select-modern"
                              defaultValue=""
                            >
                              <option value="">Select a vacant unit</option>
                              {buildingVacantUnits.map((unit) => (
                                <option key={unit.id} value={unit.id}>
                                  Unit {unit.unitNumber}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div>
                          <label className="field-label" htmlFor={`new-unit-${req.id}`}>
                            {buildingVacantUnits.length > 0 ? 'Or create new unit' : 'Create new unit'}
                          </label>
                          <input
                            id={`new-unit-${req.id}`}
                            name="newUnitNumber"
                            type="text"
                            placeholder="e.g. 102"
                            className="input-modern"
                            maxLength={40}
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Need more units later?{' '}
                          <Link
                            href={`/landlord/buildings/${req.buildingId}/units/new`}
                            className="text-accent hover:underline underline-offset-2"
                          >
                            Add unit on building page
                          </Link>
                        </p>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button type="submit" className="btn-primary py-2 px-4 text-xs">
                        Approve
                      </button>
                    </div>
                  </form>
                  <form action={rejectJoinRequestAction.bind(null, req.id)} className="mt-2">
                    <button type="submit" className="btn-danger py-2 px-4 text-xs">
                      Reject
                    </button>
                  </form>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Past Requests</h2>
          <div className="card-modern overflow-hidden">
            <div className="divide-y divide-border">
              {resolved.map((req: (typeof resolved)[number]) => (
                <div key={req.id} className="list-row">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground">{req.tenant.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {req.building.name}
                      {req.unit ? ` · Unit ${req.unit.unitNumber}` : ''}
                    </p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
