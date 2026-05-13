import { db } from '@/lib/db'
import { getLandlord } from '@/lib/session'
import Link from 'next/link'
import { Users, FileText } from 'lucide-react'

export default async function TenantsPage() {
  const { landlord } = await getLandlord()

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
    <div className="p-5 sm:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-4xl text-foreground mb-1">Tenants</h1>
        <p className="text-sm text-muted-foreground">{tenancies.length} active tenant{tenancies.length !== 1 ? 's' : ''}</p>
      </div>

      {tenancies.length === 0 ? (
        <div className="card-modern flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Users size={24} className="text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">No active tenants yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-5">Approve join requests to add tenants</p>
          <Link href="/landlord/join-requests" className="text-accent text-sm hover:underline underline-offset-2">
            Review join requests
          </Link>
        </div>
      ) : (
        <div className="card-modern overflow-hidden">
          <div className="divide-y divide-border">
            {tenancies.map((t: (typeof tenancies)[number]) => (
              <div key={t.id} className="list-row">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-muted-foreground">
                      {t.tenant.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">{t.tenant.displayName}</div>
                    <div className="text-xs text-muted-foreground truncate">{t.tenant.user.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.unit.building.name}, Unit {t.unit.unitNumber} &middot; since {new Date(t.startDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {t._count.invoices} invoice{t._count.invoices !== 1 ? 's' : ''}
                  </span>
                  <Link
                    href={`/landlord/invoices/new?tenancyId=${t.id}&unitId=${t.unitId}`}
                    className="btn-secondary py-1.5 px-3 text-xs"
                  >
                    <FileText size={12} />
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
