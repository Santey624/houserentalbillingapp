'use client'

import { useActionState } from 'react'
import { updateTenantSettingsAction } from '@/app/actions/settings'

export default function TenantSettingsPage() {
  const [state, action, pending] = useActionState(updateTenantSettingsAction, null)

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {state?.message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
          {state.message}
        </div>
      )}

      <form action={action} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Profile</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <input name="displayName" type="text" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]" />
          {state?.errors?.displayName && <p className="text-red-600 text-xs mt-1">{state.errors.displayName[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
          <input name="contact" type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]" />
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
