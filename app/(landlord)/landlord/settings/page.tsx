'use client'

import { useActionState } from 'react'
import { updateLandlordSettingsAction } from '@/app/actions/settings'

export default function LandlordSettingsPage() {
  const [state, action, pending] = useActionState(updateLandlordSettingsAction, null)

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {state?.message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
          {state.message}
        </div>
      )}

      <form action={action} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4" encType="multipart/form-data">
        <h3 className="font-semibold text-gray-900">Profile</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <input name="displayName" type="text" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]" />
          {state?.errors?.displayName && <p className="text-red-600 text-xs mt-1">{state.errors.displayName[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input name="address" type="text" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
          <input name="contact" type="text" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]" />
        </div>

        <hr className="my-4 border-gray-100" />
        <h3 className="font-semibold text-gray-900">Invoice Defaults</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Electricity Rate (Rs./unit)</label>
            <input name="electricityRate" type="number" step="0.01" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Due Day</label>
            <input name="paymentDueDay" type="number" min="1" max="31" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bank Details</label>
          <textarea name="bankDetails" rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]" placeholder="Bank name, account number, branch..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">QR Code Image</label>
          <input name="qrImage" type="file" accept="image/*" className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#0f3460] file:text-white file:text-xs" />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-[#0f3460] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0f3460]/90 transition disabled:opacity-60"
        >
          {pending ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
