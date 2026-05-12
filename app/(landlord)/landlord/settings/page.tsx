'use client'

import { useActionState } from 'react'
import { updateLandlordSettingsAction } from '@/app/actions/settings'

export default function LandlordSettingsPage() {
  const [state, action, pending] = useActionState(updateLandlordSettingsAction, null)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-xl">
      <h1 className="font-heading text-3xl font-bold text-[#2d2d2d] mb-6">Settings ⚙️</h1>

      {state?.message && (
        <div className="mb-5 px-4 py-3 bg-[#d4f5d4] border-[2px] border-[#1a5c1a] text-[#1a5c1a] text-sm wobbly-sm">
          ✓ {state.message}
        </div>
      )}

      <form action={action} className="card-sketch p-5 sm:p-6 space-y-5">
        <h3 className="font-heading text-xl font-bold text-[#2d2d2d]">Profile</h3>

        <div>
          <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5">Display Name</label>
          <input name="displayName" type="text" required className="input-sketch w-full px-4 py-2.5 text-sm" />
          {state?.errors?.displayName && (
            <p className="text-[#ff4d4d] text-xs mt-1.5">{state.errors.displayName[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5">Address</label>
          <input name="address" type="text" required className="input-sketch w-full px-4 py-2.5 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5">Contact</label>
          <input name="contact" type="text" required className="input-sketch w-full px-4 py-2.5 text-sm" />
        </div>

        <hr className="border-dashed border-[#2d2d2d]/25" />
        <h3 className="font-heading text-xl font-bold text-[#2d2d2d]">Invoice Defaults</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5">Electricity Rate (Rs./unit)</label>
            <input name="electricityRate" type="number" step="0.01" required className="input-sketch w-full px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5">Payment Due Day</label>
            <input name="paymentDueDay" type="number" min="1" max="31" required className="input-sketch w-full px-4 py-2.5 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5">Bank Details</label>
          <textarea
            name="bankDetails"
            rows={3}
            placeholder="Bank name, account number, branch..."
            className="input-sketch w-full px-4 py-2.5 text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5">QR Code Image</label>
          <input
            name="qrImage"
            type="file"
            accept="image/*"
            className="w-full text-sm text-[#2d2d2d]/60 file:mr-3 file:py-1.5 file:px-3 file:border-[2px] file:border-[#2d2d2d] file:bg-[#e5e0d8] file:text-[#2d2d2d] file:text-xs file:cursor-pointer"
            style={{ borderRadius: '12px 3px 10px 3px / 3px 10px 3px 12px' }}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="btn-sketch w-full bg-[#2d2d2d] text-white py-3 border-[3px] border-[#2d2d2d] font-medium text-sm hover:bg-[#ff4d4d] hover:border-[#ff4d4d]"
        >
          {pending ? 'Saving...' : 'Save Settings →'}
        </button>
      </form>
    </div>
  )
}
