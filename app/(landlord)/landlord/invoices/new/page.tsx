import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import InvoiceForm from '@/components/landlord/InvoiceForm'
import { ChevronLeft } from 'lucide-react'

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
      where: { status: 'PENDING', building: { landlordId: landlord.id } },
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
          none: { status: 'ACTIVE', unit: { building: { landlordId: landlord.id } } },
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
      {/* Direct bill */}
      <div className="card-modern p-6 mb-5">
        <h3 className="font-semibold text-foreground mb-4">Create Bill Directly</h3>
        {allVacantUnits.length === 0 ? (
          <p className="text-sm text-muted-foreground">Create a building and vacant unit first.</p>
        ) : (
          <form action="/landlord/invoices/new" className="space-y-4">
            <div>
              <label className="field-label">Tenant Name</label>
              <input
                name="manualTenantName"
                type="text"
                required
                minLength={2}
                placeholder="Enter tenant name"
                className="input-modern"
              />
            </div>
            <div>
              <label className="field-label">Unit</label>
              <select name="unitId" required className="select-modern">
                {allVacantUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.building.name} · Unit {unit.unitNumber}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary w-full h-11">
              Continue to Bill
            </button>
          </form>
        )}
      </div>

      {/* Existing tenants */}
      <div className="card-modern p-6 mb-5">
        <h3 className="font-semibold text-foreground mb-4">Use Existing Tenant</h3>
        {tenancies.length === 0 && pendingRequests.length === 0 && registeredTenants.length === 0 ? (
          <p className="text-muted-foreground text-sm">No tenant accounts found. Ask the tenant to sign up first.</p>
        ) : (
          <div className="space-y-6">
            {tenancies.length > 0 && (
              <div className="space-y-2">
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">Active tenants</p>
                {tenancies.map((t) => (
                  <Link
                    key={t.id}
                    href={`/landlord/invoices/new?tenancyId=${t.id}&unitId=${t.unitId}`}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border hover:border-accent/40 hover:bg-muted/50 transition-all group"
                  >
                    <div>
                      <p className="font-medium text-sm text-foreground">{t.tenant.displayName}</p>
                      <p className="text-xs text-muted-foreground">{t.unit.building.name} · Unit {t.unit.unitNumber}</p>
                    </div>
                    <span className="text-xs text-accent group-hover:underline underline-offset-2">Select</span>
                  </Link>
                ))}
              </div>
            )}

            {pendingRequests.length > 0 && (
              <div className="space-y-2">
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">Pending requests</p>
                {pendingRequests.map((req) => {
                  const requestVacantUnits = vacantUnitsByBuilding[req.building.id] ?? []
                  return (
                    <div key={req.id} className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-sm text-foreground">{req.tenant.displayName}</p>
                          <p className="text-xs text-muted-foreground">
                            {req.building.name}{req.unit ? ` · Unit ${req.unit.unitNumber}` : ' · No unit selected'}
                          </p>
                        </div>
                        {req.unitId && (
                          <Link
                            href={`/landlord/invoices/new?joinRequestId=${req.id}&unitId=${req.unitId}`}
                            className="text-xs text-accent hover:underline underline-offset-2"
                          >
                            Select
                          </Link>
                        )}
                      </div>
                      {!req.unitId && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {requestVacantUnits.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No vacant units in this building.</p>
                          ) : (
                            requestVacantUnits.map((u) => (
                              <Link
                                key={u.id}
                                href={`/landlord/invoices/new?joinRequestId=${req.id}&unitId=${u.id}`}
                                className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-accent/40 transition-colors"
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
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">Registered tenants</p>
                {allVacantUnits.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No vacant units available for a new bill.</p>
                ) : (
                  registeredTenants.map((tenant) => (
                    <div key={tenant.id} className="p-3.5 rounded-xl border border-border bg-muted/30">
                      <div>
                        <p className="font-medium text-sm text-foreground">{tenant.displayName}</p>
                        <p className="text-xs text-muted-foreground">{tenant.user.email}</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {allVacantUnits.map((unit) => (
                          <Link
                            key={unit.id}
                            href={`/landlord/invoices/new?tenantId=${tenant.id}&unitId=${unit.id}`}
                            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-accent/40 transition-colors"
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
    <div className="p-5 sm:p-8 max-w-2xl">
      <Link href="/landlord/invoices" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ChevronLeft size={14} />
        Invoices
      </Link>
      <div className="mb-8">
        <h1 className="text-4xl text-foreground mb-1">Generate Invoice</h1>
        <p className="text-sm text-muted-foreground">Create a new invoice for a tenant</p>
      </div>
      {children}
    </div>
  )
}
