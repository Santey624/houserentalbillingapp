'use client'

import { useActionState } from 'react'
import { signUpAction } from '@/app/actions/auth'
import Link from 'next/link'

interface Props {
  defaultRole: 'LANDLORD' | 'TENANT'
}

export default function SignUpForm({ defaultRole }: Props) {
  const [state, action, pending] = useActionState(signUpAction, null)

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          name="name"
          type="text"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
        />
        {state?.errors?.name && <p className="text-red-600 text-xs mt-1">{state.errors.name[0]}</p>}
      </div>

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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
        />
        {state?.errors?.password && <p className="text-red-600 text-xs mt-1">{state.errors.password[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
        <select
          name="role"
          defaultValue={defaultRole}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
        >
          <option value="LANDLORD">Landlord</option>
          <option value="TENANT">Tenant</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-[#0f3460] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0f3460]/90 transition disabled:opacity-60"
      >
        {pending ? 'Creating account...' : 'Create account'}
      </button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/auth/signin" className="text-[#0f3460] font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
