import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import InvoiceForm from '@/components/landlord/InvoiceForm'

type VacantUnit = {
  id: string
  unitNumber: string
  buildingId: string
}

export default async function NewInvoicePage(props: {
  searchParams: Promise<{ tenancyId?: string; unitId?: string; joinRequestId?: string; tenantId?: string; manualTenantName?: string }>
}) {
  const { tenancyId, unitId, joinRequestId, tenantId, manualTenantName } = await props.searchParams
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')

  const landlord = await db.landlord.findUnique({
    where: { userId: session.user.id },
    select: { id: true, electricityRate: true },
  })
  if (!landlord) redirect('/auth/signin')

  if (tenancyId) {
    const tenancy = await db.tenancy.findFirst({
      where: { id: tenancyId, unit: { building: { landlordId: landlord.id } } },
      select: { id: true, unitId: true, tenant: { select: { displayName: true } } },
    })
    if (tenancy) {
      return (
        <InvoicePageShell>
          <InvoiceForm
            tenancyId={tenancy.id}
            unitId={tenancy.unitId}
            tenantName={tenancy.tenant.displayName}
            defaultRate={landlord.electricityRate}
          />
        </InvoicePageShell>
      )
    }
  }

  if (joinRequestId && unitId) {
    const request = await db.joinRequest.findFirst({
      where: { id: joinRequestId, status: 'PENDING', building: { landlordId: landlord.id } },
      select: { id: true, tenant: { select: { displayName: true } } },
    })
    if (request) {
      return (
        <InvoicePageShell>
          <InvoiceForm
            joinRequestId={request.id}
            unitId={unitId}
            tenantName={request.tenant.displayName}
            defaultRate={landlord.electricityRate}
          />
        </InvoicePageShell>
      )
    }
  }

  if (tenantId && unitId) {
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, displayName: true },
    })
    const unit = await db.unit.findFirst({
      where: { id: unitId, building: { landlordId: landlord.id } },
      select: { id: true },
    })
    if (tenant && unit) {
      return (
        <InvoicePageShell>
          <InvoiceForm
            tenantId={tenant.id}
            unitId={unit.id}
            tenantName={tenant.displayName}
            defaultRate={landlord.electricityRate}
          />
        </InvoicePageShell>
      )
    }
  }

  if (manualTenantName && unitId) {
    const unit = await db.unit.findFirst({
      where: {
        id: unitId,
        building: { landlordId: landlord.id },
        tenancies: { none: { status: 'ACTIVE' } },
      },
      select: { id: true },
    })
    if (unit) {
      return (
        <InvoicePageShell>
          <InvoiceForm
            directBill
            unitId={unit.id}
            tenantName={manualTenantName}
            defaultRate={landlord.electricityRate}
          />
        </InvoicePageShell>
      )
    }
  }

  const [tenancies, pendingRequests, registeredTenants, allVacantUnits] = await Promise.all([
    db.tenancy.findMany({
      where: { status: 'ACTIVE', unit: { building: { landlordId: landlord.id } } },
      select: {
        id: true,
        unitId: true,
        tenant: { select: { displayName: true } },
        unit: { select: { unitNumber: true, building: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    db.joinRequest.findMany({
      where: {
        status: 'PENDING',
        building: { landlordId: landlord.id },
      },
      select: {
        id: true,
        unitId: true,
        tenant: { select: { displayName: true } },
        building: { select: { id: true, name: true } },
        unit: { select: { unitNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    db.tenant.findMany({
      where: {
        tenancies: {
          none: {
            status: 'ACTIVE',
            unit: { building: { landlordId: landlord.id } },
          },
        },
      },
      select: { id: true, displayName: true, user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    db.unit.findMany({
      where: {
        building: { landlordId: landlord.id },
        tenancies: { none: { status: 'ACTIVE' } },
      },
      select: { id: true, unitNumber: true, buildingId: true, building: { select: { name: true } } },
      orderBy: [{ building: { name: 'asc' } }, { unitNumber: 'asc' }],
      take: 100,
    }),
  ])

  const pendingBuildingIds = [...new Set(
    pendingRequests
      .filter((request) => !request.unitId)
      .map((request) => request.building.id)
  )]

  const vacantUnits = pendingBuildingIds.length > 0
    ? await db.unit.findMany({
        where: {
          buildingId: { in: pendingBuildingIds },
          tenancies: { none: { status: 'ACTIVE' } },
        },
        select: { id: true, unitNumber: true, buildingId: true },
        orderBy: { unitNumber: 'asc' },
      })
    : []

  const vacantUnitsByBuilding = vacantUnits.reduce<Record<string, VacantUnit[]>>((acc, unit) => {
    acc[unit.buildingId] ??= []
    acc[unit.buildingId].push(unit)
    return acc
  }, {})

  return (
    <InvoicePageShell>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Create Bill Directly</h3>
        {allVacantUnits.length === 0 ? (
          <p className="text-sm text-gray-400">Create a building and vacant unit first.</p>
        ) : (
          <form action="/landlord/invoices/new" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tenant Name</label>
              <input
                name="manualTenantName"
                type="text"
                required
                minLength={2}
                placeholder="Enter tenant name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                name="unitId"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
              >
                {allVacantUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.building.name} · Unit {unit.unitNumber}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-[#0f3460] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0f3460]/90 transition"
            >
              Continue to Bill
            </button>
          </form>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Use Existing Tenant</h3>
        {tenancies.length === 0 && pendingRequests.length === 0 && registeredTenants.length === 0 ? (
          <p className="text-gray-400 text-sm">No tenant accounts found. Ask the tenant to sign up first.</p>
        ) : (
          <div className="space-y-6">
            {tenancies.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Active tenants</p>
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

            {pendingRequests.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Pending requests</p>
                {pendingRequests.map((req) => {
                  const requestVacantUnits = vacantUnitsByBuilding[req.building.id] ?? []

                  return (
                    <div key={req.id} className="p-3 rounded-lg border border-blue-100 bg-blue-50">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-sm">{req.tenant.displayName}</p>
                          <p className="text-xs text-blue-700/70">
                            {req.building.name}{req.unit ? ` · Unit ${req.unit.unitNumber}` : ' · No unit selected'}
                          </p>
                        </div>
                        {req.unitId && (
                          <Link
                            href={`/landlord/invoices/new?joinRequestId=${req.id}&unitId=${req.unitId}`}
                            className="text-[#0f3460] text-sm"
                          >
                            Select →
                          </Link>
                        )}
                      </div>
                      {!req.unitId && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {requestVacantUnits.length === 0 ? (
                            <p className="text-xs text-blue-700/70">No vacant units in this building.</p>
                          ) : (
                            requestVacantUnits.map((u) => (
                              <Link
                                key={u.id}
                                href={`/landlord/invoices/new?joinRequestId=${req.id}&unitId=${u.id}`}
                                className="rounded-md border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-[#0f3460] hover:bg-blue-100"
                              >
                                Unit {u.unitNumber}
                              </Link>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {registeredTenants.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Registered tenants</p>
                {allVacantUnits.length === 0 ? (
                  <p className="text-sm text-gray-400">No vacant units available for a new bill.</p>
                ) : (
                  registeredTenants.map((tenant) => (
                    <div key={tenant.id} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                      <div>
                        <p className="font-medium text-sm">{tenant.displayName}</p>
                        <p className="text-xs text-gray-400">{tenant.user.email}</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {allVacantUnits.map((unit) => (
                          <Link
                            key={unit.id}
                            href={`/landlord/invoices/new?tenantId=${tenant.id}&unitId=${unit.id}`}
                            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-[#0f3460] hover:bg-gray-100"
                          >
                            {unit.building.name} · Unit {unit.unitNumber}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </InvoicePageShell>
  )
}

function InvoicePageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/landlord/invoices" className="text-gray-400 hover:text-gray-600 text-sm">← Invoices</Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Generate Invoice</h1>
      {children}
    </div>
  )
}
