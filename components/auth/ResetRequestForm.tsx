'use client'

import { useActionState } from 'react'
import { requestPasswordResetAction } from '@/app/actions/auth'
import Link from 'next/link'

export default function ResetRequestForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, null)

  if (state?.message) {
    return (
      <div className="text-center space-y-4">
        <div className="text-5xl animate-bounce-gentle inline-block">📧</div>
        <p
          className="text-[#2d2d2d] text-sm px-4 py-3 bg-[#e5e0d8] border-[2px] border-[#2d2d2d]"
          style={{ borderRadius: '95px 8px 85px 8px / 8px 85px 8px 95px' }}
        >
          {state.message}
        </p>
        <Link
          href="/auth/signin"
          className="inline-block text-[#2d5da1] text-sm hover:underline underline-offset-2"
        >
          ← Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5">Email</label>
        <input
          name="email"
          type="email"
          required
          className="input-sketch w-full px-4 py-2.5 text-sm"
        />
        {state?.errors?.email && (
          <p className="text-[#ff4d4d] text-xs mt-1.5">{state.errors.email[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn-sketch w-full bg-[#2d2d2d] text-white py-3 border-[3px] border-[#2d2d2d] font-medium text-sm hover:bg-[#ff4d4d] hover:border-[#ff4d4d]"
      >
        {pending ? 'Sending...' : 'Send reset link →'}
      </button>

      <p className="text-center text-sm text-[#2d2d2d]/50">
        <Link href="/auth/signin" className="text-[#2d5da1] hover:underline underline-offset-2">
          ← Back to sign in
        </Link>
      </p>
    </form>
  )
}
