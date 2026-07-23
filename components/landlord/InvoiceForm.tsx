'use client'

import { useState, useTransition, useEffect } from 'react'
import { createInvoiceAction, updateInvoiceAction } from '@/app/actions/invoices'
import NepaliMonthPicker from '@/components/ui/NepaliMonthPicker'
import {
  countBillingMonths,
  formatNepaliMonths,
  parseNepaliMonths,
} from '@/lib/nepaliMonths'
import type { MeterRow, CostRow } from '@/lib/invoiceTypes'
import { Plus, Trash2, Zap, FileText, User, Home } from 'lucide-react'

interface TenantOption {
  id: string
  displayName: string
  tenancyId?: string
  joinRequestId?: string
  unitId: string | null
  unitInfo: string
  type: 'ACTIVE_TENANT' | 'PENDING_REQUEST' | 'OTHER_TENANT'
}

interface UnitOption {
  id: string
  unitNumber: string
  building: { name: string }
  tenancies: { id: string, tenant: { displayName: string } }[]
}

interface Props {
  initialData?: {
    id: string
    nepaliMonth: string
    nepaliYear: string
    invoiceDate: string
    dueDate?: string | null
    rentCost: number
    serviceCharge: number
    notes?: string | null
    meters: MeterRow[]
    costs: CostRow[]
  }
  tenancyId?: string
  joinRequestId?: string
  tenantId?: string
  directBill?: boolean
  unitId: string
  tenantName: string
  defaultRate: number
}

const inputCls = 'input-modern'
const labelCls = 'field-label'

export default function InvoiceForm({
  initialData,
  tenancyId: initialTenancyId,
  joinRequestId: initialJoinRequestId,
  tenantId: initialTenantId,
  directBill: initialDirectBill,
  unitId: initialUnitId,
  tenantName: initialTenantName,
  defaultRate,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [tenants, setTenants] = useState<TenantOption[]>([])
  const [allUnits, setAllUnits] = useState<UnitOption[]>([])
  
  const [isManualEntry, setIsManualEntry] = useState<boolean>(initialDirectBill || false)
  const [selectedTenantId, setSelectedTenantId] = useState<string>(initialTenantId || '')
  const [selectedTenancyId, setSelectedTenancyId] = useState<string>(initialTenancyId || '')
  const [selectedJoinRequestId, setSelectedJoinRequestId] = useState<string>(initialJoinRequestId || '')
  const [selectedUnitId, setSelectedUnitId] = useState<string>(initialUnitId || '')
  const [selectedTenantName, setSelectedTenantName] = useState<string>(initialTenantName || '')

  const [meters, setMeters] = useState<MeterRow[]>(
    initialData?.meters ?? [{ id: 'm1', name: 'Meter 1', prev: '', curr: '' }]
  )
  const [costs, setCosts] = useState<CostRow[]>(
    initialData?.costs ?? [{ id: 'c1', description: 'Water', amount: '0' }]
  )
  const [error, setError] = useState<string | null>(null)

  const initialMonths = (() => {
    if (!initialData?.nepaliMonth) return [9]
    const parsed = parseNepaliMonths(initialData.nepaliMonth)
    return parsed.length > 0 ? parsed : [9]
  })()
  const [selectedMonths, setSelectedMonths] = useState<number[]>(initialMonths)
  const [monthError, setMonthError] = useState<string | undefined>()

  const initialMonthCount = countBillingMonths(
    initialData?.nepaliMonth ? formatNepaliMonths(initialMonths) : formatNepaliMonths([9])
  )
  const [monthlyRent, setMonthlyRent] = useState<string>(() => {
    if (initialData?.rentCost == null) return '0'
    const monthly = initialData.rentCost / Math.max(1, initialMonthCount)
    return Number.isInteger(monthly) ? String(monthly) : monthly.toFixed(2)
  })

  const monthCount = Math.max(1, selectedMonths.length)
  const monthlyRentValue = parseFloat(monthlyRent) || 0
  const totalRent = monthlyRentValue * monthCount

  const today = new Date().toISOString().split('T')[0]
  const hasPresetSelection = Boolean(
    initialTenancyId || initialJoinRequestId || initialTenantId || initialDirectBill
  )

  useEffect(() => {
    async function fetchData() {
      try {
        const [tenantsRes, unitsRes] = await Promise.all([
          fetch('/api/tenants'),
          fetch('/api/units')
        ])
        if (tenantsRes.ok) {
          const data = await tenantsRes.json()
          setTenants(data)
        }
        if (unitsRes.ok) {
          const data = await unitsRes.json()
          setAllUnits(data)
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
      }
    }
    if (!initialData && !hasPresetSelection) {
      fetchData()
    }
  }, [hasPresetSelection, initialData])

  function handleTenantChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const tId = e.target.value
    
    if (tId === 'MANUAL') {
      setIsManualEntry(true)
      setSelectedTenantId('')
      setSelectedTenancyId('')
      setSelectedJoinRequestId('')
      setSelectedUnitId('')
      setSelectedTenantName('')
      return
    }

    setIsManualEntry(false)
    const tenant = tenants.find(t => t.id === tId)
    if (tenant) {
      setSelectedTenantId(tenant.id)
      setSelectedTenancyId(tenant.tenancyId || '')
      setSelectedJoinRequestId(tenant.joinRequestId || '')
      setSelectedUnitId(tenant.unitId || '')
      setSelectedTenantName(tenant.displayName)
    }
  }

  function handleUnitChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedUnitId(e.target.value)
  }

  function addMeter() {
    setMeters((prev) => [...prev, { id: `m${Date.now()}`, name: '', prev: '', curr: '' }])
  }
  function removeMeter(id: string) {
    setMeters((prev) => prev.filter((m) => m.id !== id))
  }
  function updateMeter(id: string, key: keyof Omit<MeterRow, 'id'>, value: string) {
    setMeters((prev) => prev.map((m) => (m.id === id ? { ...m, [key]: value } : m)))
  }

  function addCost() {
    setCosts((prev) => [...prev, { id: `c${Date.now()}`, description: '', amount: '0' }])
  }
  function removeCost(id: string) {
    setCosts((prev) => prev.filter((c) => c.id !== id))
  }
  function updateCost(id: string, key: keyof Omit<CostRow, 'id'>, value: string) {
    setCosts((prev) => prev.map((c) => (c.id === id ? { ...c, [key]: value } : c)))
  }

  function toggleMonth(index: number) {
    setSelectedMonths((prev) => {
      const next = prev.includes(index)
        ? prev.filter((m) => m !== index)
        : [...prev, index]
      return next
    })
    setMonthError(undefined)
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (selectedMonths.length === 0) {
      setMonthError('Select at least one month')
      return
    }

    const form = e.currentTarget
    const fd = new FormData(form)

    if (initialData) {
      fd.set('id', initialData.id)
    }

    if (isManualEntry) {
      fd.set('directBill', 'true')
    } else {
      if (selectedTenancyId) fd.set('tenancyId', selectedTenancyId)
      if (selectedJoinRequestId) fd.set('joinRequestId', selectedJoinRequestId)
      if (selectedTenantId) fd.set('tenantId', selectedTenantId)
    }
    
    fd.set('unitId', selectedUnitId)
    fd.set('tenantName', selectedTenantName)
    fd.set('nepaliMonth', formatNepaliMonths(selectedMonths))
    fd.set('rentCost', String(monthlyRentValue))
    fd.set('meters', JSON.stringify(meters))
    fd.set('costs', JSON.stringify(costs))

    if (!selectedUnitId) {
      setError('Please select a unit.')
      return
    }

    if (!selectedTenantName.trim()) {
      setError('Please provide a tenant name.')
      return
    }

    startTransition(async () => {
      try {
        if (initialData) {
          await updateInvoiceAction(fd)
        } else {
          await createInvoiceAction(fd)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="alert-error">{error}</div>
      )}

      {/* Tenant & Unit Selection */}
      {!initialData && !hasPresetSelection && (
        <div className="card-modern p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <User size={16} className="text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Tenant & Unit Selection</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Select Tenant</label>
              <select 
                value={isManualEntry ? 'MANUAL' : selectedTenantId} 
                onChange={handleTenantChange}
                required
                className="select-modern"
              >
                <option value="" disabled>Choose a tenant...</option>
                <optgroup label="Registered / Connected">
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.displayName} ({t.unitInfo})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Direct Billing">
                  <option value="MANUAL">Other / New Tenant (No Connection)</option>
                </optgroup>
              </select>
            </div>

            {isManualEntry && (
              <div>
                <label className={labelCls}>Select Unit</label>
                <select 
                  value={selectedUnitId} 
                  onChange={handleUnitChange}
                  required
                  className="select-modern"
                >
                  <option value="" disabled>Choose a unit...</option>
                  {allUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.building.name} - Unit {u.unitNumber} {u.tenancies.length > 0 ? `(Occupied by ${u.tenancies[0].tenant.displayName})` : '(Vacant)'}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {isManualEntry && (
            <div>
              <label className={labelCls}>New Tenant Name</label>
              <input
                type="text"
                value={selectedTenantName}
                onChange={(e) => setSelectedTenantName(e.target.value)}
                placeholder="Who are you billing?"
                required
                className={inputCls}
              />
            </div>
          )}

          {!isManualEntry && selectedTenantId && !selectedUnitId && (
            <p className="text-xs text-red-500 mt-1">This tenant does not have a unit assigned yet.</p>
          )}
        </div>
      )}

      {!initialData && hasPresetSelection && (
        <div className="card-modern flex items-center gap-3 p-5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <User size={17} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{selectedTenantName}</p>
            <p className="text-xs text-muted-foreground">
              {initialDirectBill ? 'New tenant · Direct billing' : 'Tenant and unit selected'}
            </p>
          </div>
        </div>
      )}

      {/* Basic Details */}
      <div className="card-modern p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <FileText size={16} className="text-muted-foreground" />
          <h3 className="font-semibold text-foreground">
            {initialData ? 'Edit Invoice' : 'Invoice Details'}
          </h3>
        </div>
        
        {/* If editing, show the name as static */}
        {initialData && (
          <div>
            <label className={labelCls}>Tenant Name</label>
            <p className="text-sm font-medium">{selectedTenantName}</p>
          </div>
        )}

        <div>
          <label className={labelCls}>Billing Month(s)</label>
          <NepaliMonthPicker
            selected={selectedMonths}
            onToggle={toggleMonth}
            error={monthError}
          />
          {selectedMonths.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Period: {formatNepaliMonths(selectedMonths)}
              {monthCount > 1 ? ` · ${monthCount} months` : ''}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nepali Year</label>
            <input
              name="nepaliYear"
              type="text"
              defaultValue={initialData?.nepaliYear ?? '2082'}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Invoice Date</label>
            <input
              name="invoiceDate"
              type="date"
              defaultValue={initialData?.invoiceDate ?? today}
              required
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Due Date (optional)</label>
          <input
            name="dueDate"
            type="date"
            defaultValue={initialData?.dueDate ?? ''}
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Monthly Rent (Rs.)</label>
            <input
              name="rentCost"
              type="number"
              step="0.01"
              min="0"
              required
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value)}
              className={inputCls}
            />
            {monthCount > 1 && monthlyRentValue > 0 && (
              <p className="text-xs text-muted-foreground mt-1.5">
                Total rent: Rs. {totalRent.toLocaleString('en-NP', { maximumFractionDigits: 2 })}{' '}
                ({monthCount} × Rs. {monthlyRentValue.toLocaleString('en-NP', { maximumFractionDigits: 2 })})
              </p>
            )}
          </div>
          <div>
            <label className={labelCls}>Service Charge (Rs.)</label>
            <input
              name="serviceCharge"
              type="number"
              step="0.01"
              min="0"
              defaultValue={initialData?.serviceCharge ?? '0'}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Electricity Meters */}
      <div className="card-modern p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Electricity Meters</h3>
          </div>
          <span className="font-mono text-xs text-muted-foreground">Rs.{defaultRate}/unit</span>
        </div>
        {meters.map((m) => (
          <div key={m.id} className="grid grid-cols-2 gap-3 items-end sm:grid-cols-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Meter Name</label>
              <input
                value={m.name}
                onChange={(e) => updateMeter(m.id, 'name', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Previous</label>
              <input
                type="number"
                value={m.prev}
                onChange={(e) => updateMeter(m.id, 'prev', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Current</label>
              <input
                type="number"
                value={m.curr}
                onChange={(e) => updateMeter(m.id, 'curr', e.target.value)}
                className={inputCls}
              />
            </div>
            <button
              type="button"
              onClick={() => removeMeter(m.id)}
              className="flex items-center justify-center h-11 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors border border-border"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addMeter}
          className="inline-flex items-center gap-1.5 text-accent text-sm hover:underline underline-offset-2"
        >
          <Plus size={13} />
          Add meter
        </button>
      </div>

      {/* Additional Costs */}
      <div className="card-modern p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Additional Costs</h3>
        {costs.map((c) => (
          <div key={c.id} className="grid grid-cols-2 gap-3 items-end sm:grid-cols-4">
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Description</label>
              <input
                value={c.description}
                onChange={(e) => updateCost(c.id, 'description', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Amount (Rs.)</label>
              <input
                type="number"
                step="0.01"
                value={c.amount}
                onChange={(e) => updateCost(c.id, 'amount', e.target.value)}
                className={inputCls}
              />
            </div>
            <button
              type="button"
              onClick={() => removeCost(c.id)}
              className="flex items-center justify-center h-11 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors border border-border"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addCost}
          className="inline-flex items-center gap-1.5 text-accent text-sm hover:underline underline-offset-2"
        >
          <Plus size={13} />
          Add line item
        </button>
      </div>

      <div>
        <label className={labelCls}>Notes (optional)</label>
        <textarea
          name="notes"
          rows={2}
          defaultValue={initialData?.notes ?? ''}
          className="textarea-modern"
          placeholder="Any additional notes..."
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary w-full h-12 text-base"
      >
        {isPending
          ? (initialData ? 'Updating Invoice...' : 'Generating Invoice...')
          : (initialData ? 'Update Invoice' : 'Generate Invoice')}
      </button>
    </form>
  )
}
