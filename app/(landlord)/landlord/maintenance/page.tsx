import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { updateMaintenanceStatusAction } from '@/app/actions/maintenance'
import { StatusBadge } from '@/components/shared/StatusBadge'

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const

export default async function LandlordMaintenancePage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')

  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
  if (!landlord) redirect('/auth/signin')

  const requests = await db.maintenanceRequest.findMany({
    where: {
      tenant: {
        tenancies: { some: { unit: { building: { landlordId: landlord.id } }, status: 'ACTIVE' } },
      },
    },
    include: { tenant: true },
    orderBy: { createdAt: 'desc' },
  })

  const open = requests.filter((r: (typeof requests)[number]) => r.status === 'OPEN' || r.status === 'IN_PROGRESS')
  const resolved = requests.filter((r: (typeof requests)[number]) => r.status === 'RESOLVED' || r.status === 'CLOSED')

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-[#2d2d2d] mb-6">Maintenance 🔧</h1>

      {requests.length === 0 && (
        <div className="text-center py-16 text-[#2d2d2d]/40">
          <div className="text-5xl mb-3 animate-bounce-gentle inline-block">🔧</div>
          <p className="italic">No maintenance requests.</p>
        </div>
      )}

      {open.length > 0 && (
        <div className="mb-8">
          <h2 className="font-heading text-xl font-bold text-[#2d2d2d] mb-4">Active ({open.length})</h2>
          <div className="space-y-4">
            {open.map((req: (typeof open)[number]) => (
              <div key={req.id} className="card-sketch p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-heading text-lg font-bold text-[#2d2d2d] truncate">{req.title}</h3>
                    <p className="text-xs text-[#2d2d2d]/50">
                      {req.tenant.displayName} · {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
                <p className="text-sm text-[#2d2d2d]/70 mb-4">{req.description}</p>
                {req.photoUrl && (
                  <a href={req.photoUrl} target="_blank" rel="noopener noreferrer"
                    className="text-[#2d5da1] text-sm hover:underline underline-offset-2 block mb-4">
                    View photo →
                  </a>
                )}
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((s) =>
                    s !== req.status && (
                      <form key={s} action={updateMaintenanceStatusAction.bind(null, req.id, s, undefined)}>
                        <button
                          type="submit"
                          className="text-xs border-[2px] border-[#2d2d2d] text-[#2d2d2d] px-3 py-1.5 hover:bg-[#e5e0d8] transition-colors wobbly-sm"
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
          <h2 className="font-heading text-xl font-bold text-[#2d2d2d] mb-4">Resolved</h2>
          <div className="card-sketch overflow-hidden">
            <div className="divide-y-[2px] divide-dashed divide-[#2d2d2d]/15">
              {resolved.map((req: (typeof resolved)[number]) => (
                <div key={req.id} className="flex items-center justify-between gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-[#2d2d2d] truncate">{req.title}</p>
                    <p className="text-xs text-[#2d2d2d]/50">
                      {req.tenant.displayName} · {new Date(req.createdAt).toLocaleDateString()}
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
