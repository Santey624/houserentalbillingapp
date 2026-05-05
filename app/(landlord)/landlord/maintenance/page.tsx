import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { updateMaintenanceStatusAction } from '@/app/actions/maintenance'

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const

export default async function LandlordMaintenancePage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')

  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
  if (!landlord) redirect('/auth/signin')

  const requests = await db.maintenanceRequest.findMany({
    where: {
      tenant: {
        tenancies: {
          some: {
            unit: { building: { landlordId: landlord.id } },
            status: 'ACTIVE',
          },
        },
      },
    },
    include: { tenant: true },
    orderBy: { createdAt: 'desc' },
  })

  const open = requests.filter((r) => r.status === 'OPEN' || r.status === 'IN_PROGRESS')
  const resolved = requests.filter((r) => r.status === 'RESOLVED' || r.status === 'CLOSED')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Maintenance Requests</h1>

      {open.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-gray-700 mb-4">Active ({open.length})</h2>
          <div className="space-y-4">
            {open.map((req) => (
              <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{req.title}</h3>
                    <p className="text-xs text-gray-400">{req.tenant.displayName} · {new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    req.status === 'OPEN' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {req.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{req.description}</p>
                {req.photoUrl && (
                  <a href={req.photoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline block mb-4">
                    View photo →
                  </a>
                )}
                <div className="flex gap-2 flex-wrap">
                  {STATUS_OPTIONS.map((s) => (
                    s !== req.status && (
                      <form key={s} action={updateMaintenanceStatusAction.bind(null, req.id, s, undefined)}>
                        <button type="submit" className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                          Mark {s.replace('_', ' ')}
                        </button>
                      </form>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-700 mb-4">Resolved</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {resolved.map((req) => (
              <div key={req.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-sm text-gray-900">{req.title}</p>
                  <p className="text-xs text-gray-400">{req.tenant.displayName} · {new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{req.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🔧</div>
          <p>No maintenance requests.</p>
        </div>
      )}
    </div>
  )
}
