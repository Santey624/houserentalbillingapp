'use client'

import { useState, useTransition } from 'react'
import { createInvoiceAction } from '@/app/actions/invoices'
import { NEPALI_MONTHS } from '@/lib/constants'
import type { MeterRow, CostRow } from '@/lib/invoiceTypes'

interface Props {
  tenancyId: string
  unitId: string
  tenantName: string
  defaultRate: number
}

export default function InvoiceForm({ tenancyId, unitId, tenantName, defaultRate }: Props) {
  const [isPending, startTransition] = useTransition()
  const [meters, setMeters] = useState<MeterRow[]>([
    { id: 'm1', name: 'Meter 1', prev: '', curr: '' },
  ])
  const [costs, setCosts] = useState<CostRow[]>([
    { id: 'c1', description: 'Water', amount: '0' },
  ])
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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const fd = new FormData(form)
    fd.set('tenancyId', tenancyId)
    fd.set('unitId', unitId)
    fd.set('meters', JSON.stringify(meters))
    fd.set('costs', JSON.stringify(costs))

    startTransition(async () => {
      try {
        await createInvoiceAction(fd)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>}

      {/* Basic Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Invoice Details</h3>
        <input type="hidden" name="tenantName" value={tenantName} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Billing Month</label>
            <select name="nepaliMonth" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]">
              {NEPALI_MONTHS.map((m, i) => (
                <option key={i} value={m.split(' (')[0]}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nepali Year</label>
            <input name="nepaliYear" type="text" defaultValue="2082" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
            <input name="invoiceDate" type="date" defaultValue={today} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (optional)</label>
            <input name="dueDate" type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rent (Rs.)</label>
            <input name="rentCost" type="number" step="0.01" min="0" required defaultValue="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Charge (Rs.)</label>
            <input name="serviceCharge" type="number" step="0.01" min="0" defaultValue="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]" />
          </div>
        </div>
      </div>

      {/* Electricity Meters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Electricity Meters</h3>
          <span className="text-xs text-gray-400">Rate: Rs.{defaultRate}/unit</span>
        </div>
        {meters.map((m) => (
          <div key={m.id} className="grid grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Meter Name</label>
              <input
                value={m.name}
                onChange={(e) => updateMeter(m.id, 'name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Previous</label>
              <input
                type="number"
                value={m.prev}
                onChange={(e) => updateMeter(m.id, 'prev', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Current</label>
              <input
                type="number"
                value={m.curr}
                onChange={(e) => updateMeter(m.id, 'curr', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
              />
            </div>
            <button
              type="button"
              onClick={() => removeMeter(m.id)}
              className="text-red-400 hover:text-red-600 text-sm pb-2"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addMeter}
          className="text-[#0f3460] text-sm hover:underline"
        >
          + Add meter
        </button>
      </div>

      {/* Additional Costs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Additional Costs</h3>
        {costs.map((c) => (
          <div key={c.id} className="grid grid-cols-3 gap-3 items-end">
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <input
                value={c.description}
                onChange={(e) => updateCost(c.id, 'description', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Amount (Rs.)</label>
              <input
                type="number"
                step="0.01"
                value={c.amount}
                onChange={(e) => updateCost(c.id, 'amount', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addCost}
          className="text-[#0f3460] text-sm hover:underline"
        >
          + Add line item
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
        <textarea name="notes" rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]" />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#0f3460] text-white py-3 rounded-xl font-semibold hover:bg-[#0f3460]/90 transition disabled:opacity-60"
      >
        {isPending ? 'Generating Invoice...' : 'Generate Invoice'}
      </button>
    </form>
  )
}
