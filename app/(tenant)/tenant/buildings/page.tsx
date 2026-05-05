'use client'

import { useActionState, useState } from 'react'
import { submitJoinRequestAction } from '@/app/actions/join-requests'

interface Building {
  id: string
  name: string
  address: string
  contact: string
  landlord: { displayName: string }
  units: { id: string; unitNumber: string; tenancies: unknown[] }[]
}

function JoinForm({ building, onClose }: { building: Building; onClose: () => void }) {
  const [state, action, pending] = useActionState(submitJoinRequestAction, null)

  if (state?.message) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
        {state.message}
        <button onClick={onClose} className="block mt-2 text-green-600 hover:underline text-xs">Close</button>
      </div>
    )
  }

  const vacantUnits = building.units.filter((u) => u.tenancies.length === 0)

  return (
    <form action={action} className="p-4 border border-blue-200 bg-blue-50 rounded-xl space-y-3">
      <input type="hidden" name="buildingId" value={building.id} />
      {vacantUnits.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Preferred Unit (optional)</label>
          <select name="unitId" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">No preference</option>
            {vacantUnits.map((u) => (
              <option key={u.id} value={u.id}>Unit {u.unitNumber}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Note (optional)</label>
        <textarea name="note" rows={2} maxLength={500} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Your name, move-in date, etc." />
      </div>
      {state?.errors && (
        <p className="text-red-600 text-xs">{Object.values(state.errors).flat()[0]}</p>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="bg-[#0f3460] text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60">
          {pending ? 'Submitting...' : 'Submit Request'}
        </button>
        <button type="button" onClick={onClose} className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm">Cancel</button>
      </div>
    </form>
  )
}

export default function TenantBuildingsPage() {
  const [search, setSearch] = useState('')
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(false)
  const [joinBuilding, setJoinBuilding] = useState<Building | null>(null)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/buildings/search?q=${encodeURIComponent(search)}`)
      const data = await res.json()
      setBuildings(data.buildings || [])
    } catch {
      setBuildings([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Find a Building</h1>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by building name or landlord..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#0f3460] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0f3460]/90 transition disabled:opacity-60"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {searched && buildings.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">🔍</div>
          <p>No buildings found. Try a different search.</p>
        </div>
      )}

      <div className="space-y-4">
        {buildings.map((b) => (
          <div key={b.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{b.name}</h3>
                <p className="text-gray-500 text-sm">{b.address}</p>
                <p className="text-gray-400 text-xs mt-1">Landlord: {b.landlord.displayName}</p>
              </div>
              {joinBuilding?.id !== b.id && (
                <button
                  onClick={() => setJoinBuilding(b)}
                  className="bg-[#0f3460] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0f3460]/90 transition"
                >
                  Request to Join
                </button>
              )}
            </div>
            {b.units.length > 0 && (
              <p className="text-xs text-gray-400 mb-3">
                {b.units.filter((u) => u.tenancies.length === 0).length} vacant unit{b.units.filter((u) => u.tenancies.length === 0).length !== 1 ? 's' : ''} of {b.units.length}
              </p>
            )}
            {joinBuilding?.id === b.id && (
              <JoinForm building={b} onClose={() => setJoinBuilding(null)} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
