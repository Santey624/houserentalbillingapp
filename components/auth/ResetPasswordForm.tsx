'use client'

import { useActionState } from 'react'
import { resetPasswordAction } from '@/app/actions/auth'
import Link from 'next/link'

interface Props {
  token: string
}

export default function ResetPasswordForm({ token }: Props) {
  const [state, action, pending] = useActionState(resetPasswordAction, null)

  if (state?.message) {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">✅</div>
        <p className="text-gray-700 text-sm mb-4">{state.message}</p>
        <Link
          href="/auth/signin"
          className="inline-block bg-[#0f3460] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#0f3460]/90 transition"
        >
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
        />
        {state?.errors?.password && <p className="text-red-600 text-xs mt-1">{state.errors.password[0]}</p>}
        {state?.errors?.token && <p className="text-red-600 text-xs mt-1">{state.errors.token[0]}</p>}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-[#0f3460] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0f3460]/90 transition disabled:opacity-60"
      >
        {pending ? 'Resetting...' : 'Reset password'}
      </button>
    </form>
  )
}
