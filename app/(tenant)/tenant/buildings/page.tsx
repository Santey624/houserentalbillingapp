'use client'

import { useActionState, useState } from 'react'
import { submitJoinRequestAction } from '@/app/actions/join-requests'
import { Search, Building2, X } from 'lucide-react'

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
      <div className="alert-success mt-4">
        {state.message}
        <button onClick={onClose} className="ml-auto text-xs underline underline-offset-2">Close</button>
      </div>
    )
  }

  const vacantUnits = building.units.filter((u) => u.tenancies.length === 0)

  return (
    <form action={action} className="mt-4 p-4 bg-muted/50 rounded-xl space-y-3 border border-border">
      <input type="hidden" name="buildingId" value={building.id} />
      {vacantUnits.length > 0 && (
        <div>
          <label className="field-label">Preferred Unit (optional)</label>
          <select name="unitId" className="select-modern">
            <option value="">No preference</option>
            {vacantUnits.map((u) => (
              <option key={u.id} value={u.id}>Unit {u.unitNumber}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="field-label">Note (optional)</label>
        <textarea
          name="note"
          rows={2}
          maxLength={500}
          className="textarea-modern"
          placeholder="Your name, move-in date, etc."
        />
      </div>
      {state?.errors && (
        <p className="field-error">{Object.values(state.errors).flat()[0]}</p>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-primary py-2 px-4 text-xs">
          {pending ? 'Submitting...' : 'Submit Request'}
        </button>
        <button type="button" onClick={onClose} className="btn-ghost py-2 px-4 text-xs">Cancel</button>
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
    <div className="p-5 sm:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-4xl text-foreground mb-1">Find a Building</h1>
        <p className="text-sm text-muted-foreground">Search for buildings and request to join</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by building name or landlord..."
            className="input-modern !pl-11"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary px-5">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {searched && buildings.length === 0 && !loading && (
        <div className="card-modern flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
            <Search size={20} className="text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground text-sm">No buildings found</p>
          <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
        </div>
      )}

      <div className="space-y-4">
        {buildings.map((b) => (
          <div key={b.id} className="card-modern p-6">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Building2 size={18} className="text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground">{b.name}</h3>
                  <p className="text-muted-foreground text-sm">{b.address}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">Landlord: {b.landlord.displayName}</p>
                </div>
              </div>
              {joinBuilding?.id !== b.id && (
                <button
                  onClick={() => setJoinBuilding(b)}
                  className="btn-primary py-1.5 px-3 text-xs flex-shrink-0"
                >
                  Request to Join
                </button>
              )}
              {joinBuilding?.id === b.id && (
                <button
                  onClick={() => setJoinBuilding(null)}
                  className="btn-ghost py-1.5 px-2 flex-shrink-0"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {b.units.length > 0 && (
              <p className="text-xs text-muted-foreground ml-13 mt-2">
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
