'use client'

import { useActionState } from 'react'
import { signInAction } from '@/app/actions/auth'
import Link from 'next/link'

interface Props {
  callbackUrl?: string
}

export default function SignInForm({ callbackUrl }: Props) {
  const [state, action, pending] = useActionState(signInAction, null)

  return (
    <form action={action} className="space-y-5">
      {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}

      <div>
        <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5">Email</label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="input-sketch w-full px-4 py-2.5 text-sm"
        />
        {state?.errors?.email && (
          <p className="text-[#ff4d4d] text-xs mt-1.5">{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-[#2d2d2d]">Password</label>
          <Link href="/auth/reset" className="text-xs text-[#2d5da1] hover:underline underline-offset-2">
            Forgot?
          </Link>
        </div>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="input-sketch w-full px-4 py-2.5 text-sm"
        />
        {state?.errors?.password && (
          <p className="text-[#ff4d4d] text-xs mt-1.5">{state.errors.password[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn-sketch w-full bg-[#2d2d2d] text-white py-3 border-[3px] border-[#2d2d2d] font-medium text-sm hover:bg-[#ff4d4d] hover:border-[#ff4d4d]"
      >
        {pending ? 'Signing in...' : 'Sign in →'}
      </button>

      <p className="text-center text-sm text-[#2d2d2d]/50">
        No account?{' '}
        <Link href="/auth/signup" className="text-[#2d5da1] font-medium hover:underline underline-offset-2">
          Sign up here
        </Link>
      </p>
    </form>
  )
}
