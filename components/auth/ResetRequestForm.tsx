'use client'

import { useActionState } from 'react'
import { requestPasswordResetAction } from '@/app/actions/auth'
import Link from 'next/link'

export default function ResetRequestForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, null)

  if (state?.message) {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">📧</div>
        <p className="text-gray-700 text-sm mb-4">{state.message}</p>
        <Link href="/auth/signin" className="text-[#0f3460] text-sm hover:underline">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          name="email"
          type="email"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
        />
        {state?.errors?.email && <p className="text-red-600 text-xs mt-1">{state.errors.email[0]}</p>}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-[#0f3460] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0f3460]/90 transition disabled:opacity-60"
      >
        {pending ? 'Sending...' : 'Send reset link'}
      </button>

      <p className="text-center text-sm text-gray-500">
        <Link href="/auth/signin" className="text-[#0f3460] hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  )
}
