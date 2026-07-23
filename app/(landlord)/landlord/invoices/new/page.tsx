import { db } from '@/lib/db'
import { getLandlord } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import InvoiceForm from '@/components/landlord/InvoiceForm'
import { ArrowRight, ChevronLeft, UserPlus, Users } from 'lucide-react'

type VacantUnit = {
  id: string
  unitNumber: string
  buildingId: string
}

export default async function NewInvoicePage(props: {
  searchParams: Promise<{
    mode?: string
    tenancyId?: string
    unitId?: string
    joinRequestId?: string
    tenantId?: string
    manualTenantName?: string
  }>
}) {
  const { mode, tenancyId, unitId, joinRequestId, tenantId, manualTenantName } = await props.searchParams
  const { landlord } = await getLandlord()

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

  // Handle case where only unitId is provided (vacant unit)
  if (unitId && !manualTenantName && !tenancyId && !joinRequestId && !tenantId) {
    const unit = await db.unit.findFirst({
      where: {
        id: unitId,
        building: { landlordId: landlord.id },
        tenancies: { none: { status: 'ACTIVE' } },
      },
      include: { building: true },
    })
    if (unit) {
      return (
        <InvoicePageShell>
          <div className="card-modern p-6">
            <h3 className="font-semibold text-foreground mb-4">Direct Billing: {unit.building.name} · Unit {unit.unitNumber}</h3>
            <form action="/landlord/invoices/new" className="space-y-4">
              <input type="hidden" name="unitId" value={unitId} />
              <div>
                <label className="field-label">Tenant Name</label>
                <input
                  name="manualTenantName"
                  type="text"
                  required
                  minLength={2}
                  autoFocus
                  placeholder="Enter tenant name for this bill"
                  className="input-modern"
                />
                <p className="text-[10px] text-muted-foreground mt-1.5">A temporary tenant account will be created automatically.</p>
              </div>
              <button type="submit" className="btn-primary w-full h-11">
                Continue to Bill
              </button>
            </form>
          </div>
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

  if (mode !== 'direct' && mode !== 'existing') {
    return (
      <InvoicePageShell>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/landlord/invoices/new?mode=existing"
            className="card-modern card-modern-hover group flex min-h-48 flex-col p-6"
          >
            <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Users size={20} />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Bill Existing Tenant</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Create an invoice for an active tenancy, join request, or registered tenant.
            </p>
            <span className="mt-auto flex items-center gap-1.5 pt-5 text-sm font-medium text-accent">
              Select tenant
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href="/landlord/invoices/new?mode=direct"
            className="card-modern card-modern-hover group flex min-h-48 flex-col border-accent/25 bg-accent/[0.02] p-6"
          >
            <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <UserPlus size={20} />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Bill New Tenant</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Bill someone immediately without requiring them to create an account.
            </p>
            <span className="mt-auto flex items-center gap-1.5 pt-5 text-sm font-medium text-accent">
              Start direct billing
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </InvoicePageShell>
    )
  }

  const [tenancies, pendingRequests, registeredTenants, allVacantUnits] = await Promise.all([
    mode === 'existing' ? db.tenancy.findMany({
      where: { status: 'ACTIVE', unit: { building: { landlordId: landlord.id } } },
      select: {
        id: true,
        unitId: true,
        tenant: { select: { displayName: true } },
        unit: { select: { unitNumber: true, building: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }) : Promise.resolve([]),
    mode === 'existing' ? db.joinRequest.findMany({
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
    }) : Promise.resolve([]),
    Promise.resolve([] as Array<{
      id: string
      displayName: string
      user: { email: string }
    }>),
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
      <Link
        href="/landlord/invoices/new"
        className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
      >
        Change billing type
      </Link>
      <div className="grid grid-cols-1 gap-6">
        {/* Direct bill */}
        {mode === 'direct' && (
          <div className="route-transition card-modern p-6 border-accent/20 bg-accent/[0.02]">
          <div className="flex items-center gap-2 mb-4 text-accent">
            <UserPlus size={18} />
            <h3 className="font-bold text-foreground">Bill New Tenant</h3>
          </div>
          {allVacantUnits.length === 0 ? (
            <p className="text-sm text-muted-foreground">Create a building and vacant unit first to use direct billing.</p>
          ) : (
            <form action="/landlord/invoices/new" className="space-y-4">
              <div>
                <label className="field-label">Tenant Name</label>
                <input
                  name="manualTenantName"
                  type="text"
                  required
                  minLength={2}
                  placeholder="Who are you billing?"
                  className="input-modern bg-card"
                />
              </div>
              <div>
                <label className="field-label">Select Unit</label>
                <select name="unitId" required className="select-modern bg-card">
                  {allVacantUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.building.name} · Unit {unit.unitNumber}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary w-full h-11">
                Start Generating Bill
              </button>
            </form>
          )}
          </div>
        )}

        {/* Existing tenants */}
        {mode === 'existing' && (
          <div className="route-transition card-modern p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users size={18} className="text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Bill Registered Tenant</h3>
          </div>
          {tenancies.length === 0 && pendingRequests.length === 0 && registeredTenants.length === 0 ? (
            <p className="text-muted-foreground text-sm">No registered tenants found.</p>
          ) : (
            <div className="space-y-8">
              {tenancies.length > 0 && (
                <div className="space-y-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Active Tenancies</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {tenancies.map((t) => (
                      <Link
                        key={t.id}
                        href={`/landlord/invoices/new?tenancyId=${t.id}&unitId=${t.unitId}`}
                        className="flex flex-col p-3 rounded-xl border border-border hover:border-accent/40 hover:bg-muted/50 transition-all group"
                      >
                        <p className="font-semibold text-sm text-foreground">{t.tenant.displayName}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{t.unit.building.name} · Unit {t.unit.unitNumber}</p>
                        <span className="text-[10px] text-accent font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Select &rarr;</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {pendingRequests.length > 0 && (
                <div className="space-y-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Pending Join Requests</p>
                  <div className="space-y-2">
                    {pendingRequests.map((req) => {
                      const requestVacantUnits = vacantUnitsByBuilding[req.building.id] ?? []
                      return (
                        <div key={req.id} className="p-4 rounded-xl border border-accent/20 bg-accent/10">
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <div>
                              <p className="font-semibold text-sm text-foreground">{req.tenant.displayName}</p>
                              <p className="text-[10px] text-muted-foreground">
                                Request for: {req.building.name}
                              </p>
                            </div>
                            {req.unitId && (
                              <Link
                                href={`/landlord/invoices/new?joinRequestId=${req.id}&unitId=${req.unitId}`}
                                className="btn-primary py-1 px-3 text-[10px] h-7"
                              >
                                Select Unit {req.unit?.unitNumber}
                              </Link>
                            )}
                          </div>
                          {!req.unitId && (
                            <div className="flex flex-wrap gap-1.5">
                              {requestVacantUnits.length === 0 ? (
                                <p className="text-[10px] text-muted-foreground italic">No vacant units available.</p>
                              ) : (
                                requestVacantUnits.map((u) => (
                                  <Link
                                    key={u.id}
                                    href={`/landlord/invoices/new?joinRequestId=${req.id}&unitId=${u.id}`}
                                    className="rounded-lg border border-border bg-card px-2.5 py-1 text-[10px] font-medium text-foreground hover:border-accent/40 transition-colors"
                                  >
                                    Assign Unit {u.unitNumber}
                                  </Link>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {registeredTenants.length > 0 && (
                <div className="space-y-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Other Registered Tenants</p>
                  <div className="space-y-3">
                    {registeredTenants.map((tenant) => (
                      <div key={tenant.id} className="p-3.5 rounded-xl border border-border bg-muted/20">
                        <div className="mb-2">
                          <p className="font-semibold text-sm text-foreground">{tenant.displayName}</p>
                          <p className="text-[10px] text-muted-foreground">{tenant.user.email}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {allVacantUnits.length === 0 ? (
                            <p className="text-[10px] text-muted-foreground italic">No units available.</p>
                          ) : (
                            allVacantUnits.map((unit) => (
                              <Link
                                key={unit.id}
                                href={`/landlord/invoices/new?tenantId=${tenant.id}&unitId=${unit.id}`}
                                className="rounded-lg border border-border bg-card px-2.5 py-1 text-[10px] font-medium text-foreground hover:border-accent/40 transition-colors"
                              >
                                {unit.building.name} · Unit {unit.unitNumber}
                              </Link>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
