'use client'

import { useActionState } from 'react'
import { updateTenantSettingsAction } from '@/app/actions/settings'
import { CheckCircle2 } from 'lucide-react'

export default function TenantSettingsPage() {
  const [state, action, pending] = useActionState(updateTenantSettingsAction, null)

  return (
    <div className="p-5 sm:p-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-4xl text-foreground mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile information</p>
      </div>

      {state?.message && (
        <div className="alert-success mb-6">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          {state.message}
        </div>
      )}

      <form action={action} className="card-modern p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Profile</h3>

        <div>
          <label className="field-label">Display Name</label>
          <input name="displayName" type="text" required className="input-modern" />
          {state?.errors?.displayName && (
            <p className="field-error">{state.errors.displayName[0]}</p>
          )}
        </div>

        <div>
          <label className="field-label">Contact Number</label>
          <input name="contact" type="text" className="input-modern" />
        </div>

        <button type="submit" disabled={pending} className="btn-primary w-full h-11 mt-2">
          {pending ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
