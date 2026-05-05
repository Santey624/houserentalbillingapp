import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import InvoiceForm from '@/components/landlord/InvoiceForm'

export default async function NewInvoicePage(props: {
  searchParams: Promise<{ tenancyId?: string; unitId?: string }>
}) {
  const { tenancyId, unitId } = await props.searchParams
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')

  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
  if (!landlord) redirect('/auth/signin')

  // If tenancyId/unitId provided, pre-fill from them
  let tenantName = ''
  let resolvedTenancyId = tenancyId || ''
  let resolvedUnitId = unitId || ''

  if (tenancyId) {
    const tenancy = await db.tenancy.findFirst({
      where: { id: tenancyId, unit: { building: { landlordId: landlord.id } } },
      include: { tenant: true, unit: true },
    })
    if (tenancy) {
      tenantName = tenancy.tenant.displayName
      resolvedUnitId = tenancy.unitId
    }
  }

  // Load active tenancies for selection if not pre-filled
  const tenancies = await db.tenancy.findMany({
    where: { status: 'ACTIVE', unit: { building: { landlordId: landlord.id } } },
    include: { tenant: true, unit: { include: { building: true } } },
  })

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/landlord/invoices" className="text-gray-400 hover:text-gray-600 text-sm">← Invoices</Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Generate Invoice</h1>

      {!resolvedTenancyId ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Select Tenant</h3>
          {tenancies.length === 0 ? (
            <p className="text-gray-400 text-sm">No active tenants. Approve a join request first.</p>
          ) : (
            <div className="space-y-2">
              {tenancies.map((t) => (
                <Link
                  key={t.id}
                  href={`/landlord/invoices/new?tenancyId=${t.id}&unitId=${t.unitId}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="font-medium text-sm">{t.tenant.displayName}</p>
                    <p className="text-xs text-gray-400">{t.unit.building.name} · Unit {t.unit.unitNumber}</p>
                  </div>
                  <span className="text-[#0f3460] text-sm">Select →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <InvoiceForm
          tenancyId={resolvedTenancyId}
          unitId={resolvedUnitId}
          tenantName={tenantName}
          defaultRate={landlord.electricityRate}
        />
      )}
    </div>
  )
}
