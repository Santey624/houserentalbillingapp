'use client'

import { useActionState } from 'react'
import { submitMaintenanceRequestAction } from '@/app/actions/maintenance'

export default function TenantMaintenancePage() {
  const [state, action, pending] = useActionState(submitMaintenanceRequestAction, null)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-xl">
      <h1 className="font-heading text-3xl font-bold text-[#2d2d2d] mb-6">Maintenance 🔧</h1>

      {state?.message && (
        <div className="mb-5 px-4 py-3 bg-[#d4f5d4] border-[2px] border-[#1a5c1a] text-[#1a5c1a] text-sm wobbly-sm">
          ✓ {state.message}
        </div>
      )}

      <div className="card-sketch p-5 sm:p-6">
        <h3 className="font-heading text-xl font-bold text-[#2d2d2d] mb-4">Submit New Request</h3>
        <form action={action} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5">Title</label>
            <input
              name="title"
              type="text"
              required
              minLength={3}
              placeholder="e.g., Leaking pipe in bathroom"
              className="input-sketch w-full px-4 py-2.5 text-sm"
            />
            {state?.errors?.title && (
              <p className="text-[#ff4d4d] text-xs mt-1.5">{state.errors.title[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5">Description</label>
            <textarea
              name="description"
              required
              minLength={10}
              rows={4}
              placeholder="Describe the issue in detail..."
              className="input-sketch w-full px-4 py-2.5 text-sm resize-none"
            />
            {state?.errors?.description && (
              <p className="text-[#ff4d4d] text-xs mt-1.5">{state.errors.description[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5">Photo (optional)</label>
            <input
              name="photo"
              type="file"
              accept="image/*"
              className="w-full text-sm text-[#2d2d2d]/60 file:mr-3 file:py-1.5 file:px-3 file:border-[2px] file:border-[#2d2d2d] file:bg-[#e5e0d8] file:text-[#2d2d2d] file:text-xs file:cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="btn-sketch w-full bg-[#2d2d2d] text-white py-3 border-[3px] border-[#2d2d2d] font-medium text-sm hover:bg-[#ff4d4d] hover:border-[#ff4d4d]"
          >
            {pending ? 'Submitting...' : 'Submit Request →'}
          </button>
        </form>
      </div>
    </div>
  )
}
