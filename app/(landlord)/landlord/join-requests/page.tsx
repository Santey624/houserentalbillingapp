import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { approveJoinRequestAction, rejectJoinRequestAction } from '@/app/actions/join-requests'

export default async function JoinRequestsPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')

  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
  if (!landlord) redirect('/auth/signin')

  const requests = await db.joinRequest.findMany({
    where: { building: { landlordId: landlord.id } },
    include: {
      tenant: { include: { user: true } },
      building: true,
      unit: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const pending = requests.filter((r) => r.status === 'PENDING')
  const resolved = requests.filter((r) => r.status !== 'PENDING')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Join Requests</h1>

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-gray-700 mb-4">Pending ({pending.length})</h2>
          <div className="space-y-4">
            {pending.map((req) => (
              <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{req.tenant.displayName}</p>
                    <p className="text-xs text-gray-400">{req.tenant.user.email}</p>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  Building: <strong>{req.building.name}</strong>
                  {req.unit && <> · Unit: <strong>{req.unit.unitNumber}</strong></>}
                </p>
                {req.note && <p className="text-sm text-gray-500 italic mb-4">&quot;{req.note}&quot;</p>}
                <div className="flex gap-3">
                  <form action={approveJoinRequestAction.bind(null, req.id)}>
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={rejectJoinRequestAction.bind(null, req.id)}>
                    <button
                      type="submit"
                      className="border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-50 transition"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-700 mb-4">Past Requests</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {resolved.map((req) => (
              <div key={req.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{req.tenant.displayName}</p>
                  <p className="text-xs text-gray-400">{req.building.name}{req.unit ? ` · Unit ${req.unit.unitNumber}` : ''}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  req.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">📬</div>
          <p>No join requests yet.</p>
        </div>
      )}
    </div>
  )
}
