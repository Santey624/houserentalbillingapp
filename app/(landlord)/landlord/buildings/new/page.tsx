'use client'

import { useActionState } from 'react'
import { createBuildingAction } from '@/app/actions/buildings'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function NewBuildingPage() {
  const [state, action, pending] = useActionState(createBuildingAction, null)

  return (
    <div className="p-5 sm:p-8 max-w-xl">
      <Link href="/landlord/buildings" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ChevronLeft size={14} />
        Buildings
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl text-foreground mb-1">New Building</h1>
        <p className="text-sm text-muted-foreground">Add a new property to your portfolio</p>
      </div>

      <form action={action} className="card-modern p-6 space-y-4">
        <div>
          <label className="field-label">Building Name</label>
          <input name="name" type="text" required className="input-modern" />
          {state?.errors?.name && <p className="field-error">{state.errors.name[0]}</p>}
        </div>
        <div>
          <label className="field-label">Address</label>
          <input name="address" type="text" required className="input-modern" />
          {state?.errors?.address && <p className="field-error">{state.errors.address[0]}</p>}
        </div>
        <div>
          <label className="field-label">Contact (optional)</label>
          <input name="contact" type="text" className="input-modern" />
        </div>
        <div className="flex items-center gap-3 py-1">
          <input
            name="isOpen"
            type="checkbox"
            defaultChecked
            id="isOpen"
            className="w-4 h-4 rounded border-border accent-accent cursor-pointer"
          />
          <label htmlFor="isOpen" className="text-sm text-foreground cursor-pointer select-none">
            Open to new tenants
          </label>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="btn-primary w-full h-11 mt-2"
        >
          {pending ? 'Creating...' : 'Create Building'}
        </button>
      </form>
    </div>
  )
}
