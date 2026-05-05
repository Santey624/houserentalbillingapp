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
    <form action={action} className="space-y-4">
      {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
        />
        {state?.errors?.email && <p className="text-red-600 text-xs mt-1">{state.errors.email[0]}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <Link href="/auth/reset" className="text-xs text-[#0f3460] hover:underline">
            Forgot password?
          </Link>
        </div>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
        />
        {state?.errors?.password && <p className="text-red-600 text-xs mt-1">{state.errors.password[0]}</p>}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-[#0f3460] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0f3460]/90 transition disabled:opacity-60"
      >
        {pending ? 'Signing in...' : 'Sign in'}
      </button>

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="text-[#0f3460] font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  )
}
