'use client'

import { useState, useTransition } from 'react'
import { createInvoiceAction, updateInvoiceAction } from '@/app/actions/invoices'
import { NEPALI_MONTHS } from '@/lib/constants'
import type { MeterRow, CostRow } from '@/lib/invoiceTypes'
import { Plus, Trash2, Zap, FileText } from 'lucide-react'

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
  tenancyId,
  joinRequestId,
  tenantId,
  directBill,
  unitId,
  tenantName,
  defaultRate,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [meters, setMeters] = useState<MeterRow[]>(
    initialData?.meters ?? [{ id: 'm1', name: 'Meter 1', prev: '', curr: '' }]
  )
  const [costs, setCosts] = useState<CostRow[]>(
    initialData?.costs ?? [{ id: 'c1', description: 'Water', amount: '0' }]
  )
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

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

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const fd = new FormData(form)

    if (initialData) {
      fd.set('id', initialData.id)
    }

    if (tenancyId) fd.set('tenancyId', tenancyId)
    if (joinRequestId) fd.set('joinRequestId', joinRequestId)
    if (tenantId) fd.set('tenantId', tenantId)
    if (directBill) fd.set('directBill', 'true')
    fd.set('unitId', unitId)
    fd.set('meters', JSON.stringify(meters))
    fd.set('costs', JSON.stringify(costs))

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

      {/* Basic Details */}
      <div className="card-modern p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <FileText size={16} className="text-muted-foreground" />
          <h3 className="font-semibold text-foreground">
            {initialData ? 'Edit Invoice' : 'Invoice Details'}
          </h3>
        </div>
        <input type="hidden" name="tenantName" value={tenantName} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Billing Month</label>
            <select name="nepaliMonth" required defaultValue={initialData?.nepaliMonth} className="select-modern">
              {NEPALI_MONTHS.map((m, i) => (
                <option key={i} value={m.split(' (')[0]}>{m}</option>
              ))}
            </select>
          </div>
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
        </div>

        <div className="grid grid-cols-2 gap-4">
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
          <div>
            <label className={labelCls}>Due Date (optional)</label>
            <input
              name="dueDate"
              type="date"
              defaultValue={initialData?.dueDate ?? ''}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Rent (Rs.)</label>
            <input
              name="rentCost"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={initialData?.rentCost ?? '0'}
              className={inputCls}
            />
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
              className="flex items-center justify-center h-11 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors border border-border"
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
              className="flex items-center justify-center h-11 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors border border-border"
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
