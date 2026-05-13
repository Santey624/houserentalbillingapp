'use client'

import { useActionState } from 'react'
import { updateLandlordSettingsAction } from '@/app/actions/settings'
import { CheckCircle2 } from 'lucide-react'

export default function LandlordSettingsPage() {
  const [state, action, pending] = useActionState(updateLandlordSettingsAction, null)

  return (
    <div className="p-5 sm:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-4xl text-foreground mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and invoice defaults</p>
      </div>

      {state?.message && (
        <div className="alert-success mb-6">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          {state.message}
        </div>
      )}

      <form action={action} className="space-y-6">
        {/* Profile section */}
        <div className="card-modern p-6">
          <h3 className="font-semibold text-foreground mb-5">Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="field-label">Display Name</label>
              <input name="displayName" type="text" required className="input-modern" />
              {state?.errors?.displayName && (
                <p className="field-error">{state.errors.displayName[0]}</p>
              )}
            </div>
            <div>
              <label className="field-label">Address</label>
              <input name="address" type="text" required className="input-modern" />
            </div>
            <div>
              <label className="field-label">Contact</label>
              <input name="contact" type="text" required className="input-modern" />
            </div>
          </div>
        </div>

        {/* Invoice defaults section */}
        <div className="card-modern p-6">
          <h3 className="font-semibold text-foreground mb-5">Invoice Defaults</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label">Electricity Rate (Rs./unit)</label>
                <input name="electricityRate" type="number" step="0.01" required className="input-modern" />
              </div>
              <div>
                <label className="field-label">Payment Due Day</label>
                <input name="paymentDueDay" type="number" min="1" max="31" required className="input-modern" />
              </div>
            </div>
            <div>
              <label className="field-label">Bank Details</label>
              <textarea
                name="bankDetails"
                rows={3}
                placeholder="Bank name, account number, branch..."
                className="textarea-modern"
              />
            </div>
            <div>
              <label className="field-label">QR Code Image</label>
              <input
                name="qrImage"
                type="file"
                accept="image/*"
                className="block w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border file:border-border file:bg-muted file:text-foreground file:text-xs file:cursor-pointer hover:file:bg-muted/80 transition-colors"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="btn-primary w-full h-11"
        >
          {pending ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
