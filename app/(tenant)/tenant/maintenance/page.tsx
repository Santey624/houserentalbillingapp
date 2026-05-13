'use client'

import { useActionState } from 'react'
import { submitMaintenanceRequestAction } from '@/app/actions/maintenance'
import { CheckCircle2, Wrench } from 'lucide-react'

export default function TenantMaintenancePage() {
  const [state, action, pending] = useActionState(submitMaintenanceRequestAction, null)

  return (
    <div className="p-5 sm:p-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-4xl text-foreground mb-1">Maintenance</h1>
        <p className="text-sm text-muted-foreground">Submit a maintenance request</p>
      </div>

      {state?.message && (
        <div className="alert-success mb-6">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          {state.message}
        </div>
      )}

      <div className="card-modern p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <Wrench size={18} className="text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">New Request</h3>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label className="field-label">Title</label>
            <input
              name="title"
              type="text"
              required
              minLength={3}
              placeholder="e.g., Leaking pipe in bathroom"
              className="input-modern"
            />
            {state?.errors?.title && (
              <p className="field-error">{state.errors.title[0]}</p>
            )}
          </div>

          <div>
            <label className="field-label">Description</label>
            <textarea
              name="description"
              required
              minLength={10}
              rows={4}
              placeholder="Describe the issue in detail..."
              className="textarea-modern"
            />
            {state?.errors?.description && (
              <p className="field-error">{state.errors.description[0]}</p>
            )}
          </div>

          <div>
            <label className="field-label">Photo (optional)</label>
            <input
              name="photo"
              type="file"
              accept="image/*"
              className="block w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border file:border-border file:bg-muted file:text-foreground file:text-xs file:cursor-pointer hover:file:bg-muted/80 transition-colors"
            />
          </div>

          <button type="submit" disabled={pending} className="btn-primary w-full h-11 mt-2">
            {pending ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  )
}
