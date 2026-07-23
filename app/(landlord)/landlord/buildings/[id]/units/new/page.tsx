'use client'

import { useActionState } from 'react'
import { createUnitAction } from '@/app/actions/units'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { use } from 'react'

export default function NewUnitPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id: buildingId } = use(props.params)
  const [state, action, pending] = useActionState(createUnitAction, null)

  return (
    <div className="p-5 sm:p-8 max-w-xl">
      <Link
        href={`/landlord/buildings/${buildingId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft size={14} />
        Back to building
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl text-foreground mb-1">Add Unit</h1>
        <p className="text-sm text-muted-foreground">Create a vacant unit in this building</p>
      </div>

      <form action={action} className="card-modern p-6 space-y-4">
        <input type="hidden" name="buildingId" value={buildingId} />
        <div>
          <label className="field-label">Unit Number / Name</label>
          <input
            name="unitNumber"
            type="text"
            required
            placeholder="e.g. 102 or Flat 2B"
            className="input-modern"
          />
          {state?.errors?.unitNumber && (
            <p className="field-error">{state.errors.unitNumber[0]}</p>
          )}
        </div>
        <div>
          <label className="field-label">Floor (optional)</label>
          <input name="floor" type="text" className="input-modern" />
        </div>
        <div>
          <label className="field-label">Notes (optional)</label>
          <textarea name="notes" rows={2} className="textarea-modern" />
        </div>
        {state?.errors?._ && <p className="field-error">{state.errors._[0]}</p>}
        <button type="submit" disabled={pending} className="btn-primary w-full h-11 mt-2">
          {pending ? 'Creating...' : 'Create Unit'}
        </button>
      </form>
    </div>
  )
}
