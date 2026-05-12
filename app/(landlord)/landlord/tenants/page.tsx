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
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-[#2d2d2d] mb-6">
        Tenants 👥 ({tenancies.length})
      </h1>

      {tenancies.length === 0 ? (
        <div className="text-center py-16 text-[#2d2d2d]/40">
          <div className="text-5xl mb-3 animate-bounce-gentle inline-block">👥</div>
          <p className="italic mb-2">No active tenants yet.</p>
          <Link href="/landlord/join-requests" className="text-[#2d5da1] text-sm hover:underline underline-offset-2">
            Review join requests →
          </Link>
        </div>
      ) : (
        <div className="card-sketch overflow-hidden">
          <div className="divide-y-[2px] divide-dashed divide-[#2d2d2d]/15">
            {tenancies.map((t: (typeof tenancies)[number]) => (
              <div key={t.id} className="flex items-start justify-between gap-4 px-5 py-4 sm:items-center">
                <div className="min-w-0">
                  <div className="font-medium text-[#2d2d2d] text-sm truncate">{t.tenant.displayName}</div>
                  <div className="text-xs text-[#2d2d2d]/50 truncate">
                    {t.tenant.user.email}
                  </div>
                  <div className="text-xs text-[#2d2d2d]/50">
                    {t.unit.building.name}, Unit {t.unit.unitNumber} · since {new Date(t.startDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-[#2d2d2d]/50 hidden sm:block">
                    {t._count.invoices} invoices
                  </span>
                  <Link
                    href={`/landlord/invoices/new?tenancyId=${t.id}&unitId=${t.unitId}`}
                    className="btn-sketch inline-block text-xs bg-[#2d2d2d] text-white px-3 py-1.5 border-[2px] border-[#2d2d2d] hover:bg-[#ff4d4d] hover:border-[#ff4d4d]"
                  >
                    Invoice
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
