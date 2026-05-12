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
    <form action={action} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5">Full Name</label>
        <input
          name="name"
          type="text"
          required
          className="input-sketch w-full px-4 py-2.5 text-sm"
        />
        {state?.errors?.name && (
          <p className="text-[#ff4d4d] text-xs mt-1.5">{state.errors.name[0]}</p>
        )}
      </div>

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

      <div>
        <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5">Password</label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="input-sketch w-full px-4 py-2.5 text-sm"
        />
        {state?.errors?.password && (
          <p className="text-[#ff4d4d] text-xs mt-1.5">{state.errors.password[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5">I am a</label>
        <select
          name="role"
          defaultValue={defaultRole}
          className="input-sketch w-full px-4 py-2.5 text-sm appearance-none cursor-pointer"
        >
          <option value="LANDLORD">🏠 Landlord</option>
          <option value="TENANT">👤 Tenant</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn-sketch w-full bg-[#2d2d2d] text-white py-3 border-[3px] border-[#2d2d2d] font-medium text-sm hover:bg-[#ff4d4d] hover:border-[#ff4d4d]"
      >
        {pending ? 'Creating account...' : 'Create account →'}
      </button>

      <p className="text-center text-sm text-[#2d2d2d]/50">
        Already have an account?{' '}
        <Link href="/auth/signin" className="text-[#2d5da1] font-medium hover:underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </form>
  )
}
