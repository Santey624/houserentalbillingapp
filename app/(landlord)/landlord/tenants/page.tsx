import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function TenantsPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')

  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
  if (!landlord) redirect('/auth/signin')

  const tenancies = await db.tenancy.findMany({
    where: {
      status: 'ACTIVE',
      unit: { building: { landlordId: landlord.id } },
    },
    include: {
      tenant: { include: { user: true } },
      unit: { include: { building: true } },
      _count: { select: { invoices: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Tenants ({tenancies.length})</h1>

      {tenancies.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">👥</div>
          <p>No active tenants yet.</p>
          <Link href="/landlord/join-requests" className="text-[#0f3460] text-sm hover:underline mt-2 block">
            Review join requests
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {tenancies.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="font-medium text-gray-900">{t.tenant.displayName}</div>
                <div className="text-xs text-gray-400">{t.tenant.user.email} · {t.unit.building.name}, Unit {t.unit.unitNumber}</div>
                <div className="text-xs text-gray-400 mt-0.5">Since {new Date(t.startDate).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{t._count.invoices} invoices</span>
                <Link
                  href={`/landlord/invoices/new?tenancyId=${t.id}&unitId=${t.unitId}`}
                  className="text-xs bg-[#0f3460] text-white px-3 py-1.5 rounded-lg hover:bg-[#0f3460]/90 transition"
                >
                  Invoice
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
