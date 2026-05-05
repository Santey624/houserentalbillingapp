'use client'

import { useActionState } from 'react'
import { submitMaintenanceRequestAction } from '@/app/actions/maintenance'

export default function TenantMaintenancePage() {
  const [state, action, pending] = useActionState(submitMaintenanceRequestAction, null)

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Maintenance Requests</h1>

      {state?.message && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          {state.message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Submit New Request</h3>
        <form action={action} encType="multipart/form-data" className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              name="title"
              type="text"
              required
              minLength={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
              placeholder="e.g., Leaking pipe in bathroom"
            />
            {state?.errors?.title && <p className="text-red-600 text-xs mt-1">{state.errors.title[0]}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              required
              minLength={10}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
              placeholder="Describe the issue in detail..."
            />
            {state?.errors?.description && <p className="text-red-600 text-xs mt-1">{state.errors.description[0]}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo (optional)</label>
            <input
              name="photo"
              type="file"
              accept="image/*"
              className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#0f3460] file:text-white file:text-xs"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-[#0f3460] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0f3460]/90 transition disabled:opacity-60"
          >
            {pending ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  )
}
