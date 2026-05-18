'use client'

import { useActionState } from 'react'
import { updateLandlordSettingsAction } from '@/app/actions/settings'
import { CheckCircle2 } from 'lucide-react'
import type { Landlord } from '@prisma/client'

export default function SettingsForm({ landlord }: { landlord: Landlord }) {
  const [state, action, pending] = useActionState(updateLandlordSettingsAction, null)

  return (
    <form action={action} className="space-y-6">
      {state?.message && (
        <div className="alert-success mb-6">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          {state.message}
        </div>
      )}

      <div className="card-modern p-6">
        <h3 className="font-semibold text-foreground mb-5">Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="field-label">Display Name</label>
            <input 
              name="displayName" 
              type="text" 
              required 
              defaultValue={landlord.displayName}
              className="input-modern" 
            />
            {state?.errors?.displayName && (
              <p className="field-error">{state.errors.displayName[0]}</p>
            )}
          </div>
          <div>
            <label className="field-label">Address</label>
            <input 
              name="address" 
              type="text" 
              required 
              defaultValue={landlord.address}
              className="input-modern" 
            />
            {state?.errors?.address && (
              <p className="field-error">{state.errors.address[0]}</p>
            )}
          </div>
          <div>
            <label className="field-label">Contact</label>
            <input 
              name="contact" 
              type="text" 
              required 
              defaultValue={landlord.contact}
              className="input-modern" 
            />
            {state?.errors?.contact && (
              <p className="field-error">{state.errors.contact[0]}</p>
            )}
          </div>
        </div>
      </div>

      <div className="card-modern p-6">
        <h3 className="font-semibold text-foreground mb-5">Invoice Defaults</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Electricity Rate (Rs./unit)</label>
              <input 
                name="electricityRate" 
                type="number" 
                step="0.01" 
                required 
                defaultValue={landlord.electricityRate}
                className="input-modern" 
              />
              {state?.errors?.electricityRate && (
                <p className="field-error">{state.errors.electricityRate[0]}</p>
              )}
            </div>
            <div>
              <label className="field-label">Payment Due Day</label>
              <input 
                name="paymentDueDay" 
                type="number" 
                min="1" 
                max="31" 
                required 
                defaultValue={landlord.paymentDueDay}
                className="input-modern" 
              />
              {state?.errors?.paymentDueDay && (
                <p className="field-error">{state.errors.paymentDueDay[0]}</p>
              )}
            </div>
          </div>
          <div>
            <label className="field-label">Bank Details</label>
            <textarea
              name="bankDetails"
              rows={3}
              placeholder="Bank name, account number, branch..."
              defaultValue={landlord.bankDetails || ''}
              className="textarea-modern"
            />
            {state?.errors?.bankDetails && (
              <p className="field-error">{state.errors.bankDetails[0]}</p>
            )}
          </div>
          <div>
            <label className="field-label">QR Code Image</label>
            {landlord.qrImageUrl && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">Current QR Code:</p>
                <img src={landlord.qrImageUrl} alt="QR Code" className="w-24 h-24 object-contain border border-border rounded p-1" />
              </div>
            )}
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
  )
}
