import { db } from '@/lib/db'
import { getLandlord } from '@/lib/session'
import { updateMaintenanceStatusAction } from '@/app/actions/maintenance'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Wrench, ExternalLink } from 'lucide-react'

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const

export default async function LandlordMaintenancePage() {
  const { landlord } = await getLandlord()

  const requests = await db.maintenanceRequest.findMany({
    where: {
      OR: [
        { tenancy: { unit: { building: { landlordId: landlord.id } } } },
        {
          tenancyId: null,
          tenant: {
            tenancies: {
              some: { unit: { building: { landlordId: landlord.id } }, status: 'ACTIVE' },
            },
          },
        },
      ],
    },
    include: { tenant: true },
    orderBy: { createdAt: 'desc' },
  })

  const open = requests.filter((r: (typeof requests)[number]) => r.status === 'OPEN' || r.status === 'IN_PROGRESS')
  const resolved = requests.filter((r: (typeof requests)[number]) => r.status === 'RESOLVED' || r.status === 'CLOSED')

  return (
    <div className="p-5 sm:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-4xl text-foreground mb-1">Maintenance</h1>
        <p className="text-sm text-muted-foreground">{requests.length} total request{requests.length !== 1 ? 's' : ''}</p>
      </div>

      {requests.length === 0 && (
        <div className="card-modern flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Wrench size={24} className="text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">No maintenance requests</p>
          <p className="text-sm text-muted-foreground mt-1">All clear!</p>
        </div>
      )}

      {open.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Active <span className="text-sm font-normal text-muted-foreground ml-1">({open.length})</span>
          </h2>
          <div className="space-y-4">
            {open.map((req: (typeof open)[number]) => (
              <div key={req.id} className="card-modern p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{req.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {req.tenant.displayName} &middot; {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{req.description}</p>
                {req.photoUrl && (
                  <a
                    href={`/api/uploads/maintenance/${req.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-accent text-sm hover:underline underline-offset-2 mb-4"
                  >
                    View photo <ExternalLink size={12} />
                  </a>
                )}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  {STATUS_OPTIONS.map((s) =>
                    s !== req.status && (
                      <form key={s} action={updateMaintenanceStatusAction.bind(null, req.id, s, undefined)}>
                        <button
                          type="submit"
                          className="btn-secondary py-1.5 px-3 text-xs"
                        >
                          Mark {s.replace('_', ' ')}
                        </button>
                      </form>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Resolved</h2>
          <div className="card-modern overflow-hidden">
            <div className="divide-y divide-border">
              {resolved.map((req: (typeof resolved)[number]) => (
                <div key={req.id} className="list-row">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{req.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {req.tenant.displayName} &middot; {new Date(req.createdAt).toLocaleDateString()}
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
