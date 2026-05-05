'use client'

import { useActionState } from 'react'
import { createBuildingAction } from '@/app/actions/buildings'
import Link from 'next/link'

export default function NewBuildingPage() {
  const [state, action, pending] = useActionState(createBuildingAction, null)

  return (
    <div className="p-8 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/landlord/buildings" className="text-gray-400 hover:text-gray-600 text-sm">← Buildings</Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Building</h1>

      <form action={action} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Building Name</label>
          <input name="name" type="text" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]" />
          {state?.errors?.name && <p className="text-red-600 text-xs mt-1">{state.errors.name[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input name="address" type="text" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]" />
          {state?.errors?.address && <p className="text-red-600 text-xs mt-1">{state.errors.address[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
          <input name="contact" type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]" />
        </div>
        <div className="flex items-center gap-2">
          <input name="isOpen" type="checkbox" defaultChecked id="isOpen" className="rounded" />
          <label htmlFor="isOpen" className="text-sm text-gray-700">Open to new tenants</label>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-[#0f3460] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0f3460]/90 transition disabled:opacity-60"
        >
          {pending ? 'Creating...' : 'Create Building'}
        </button>
      </form>
    </div>
  )
}
