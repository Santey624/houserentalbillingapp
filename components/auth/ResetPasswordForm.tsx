'use client'

import { useActionState } from 'react'
import { resetPasswordAction } from '@/app/actions/auth'
import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'

interface Props {
  token: string
}

export default function ResetPasswordForm({ token }: Props) {
  const [state, action, pending] = useActionState(resetPasswordAction, null)

  if (state?.message) {
    return (
      <div className="text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto">
          <CheckCircle2 size={24} className="text-emerald-600" />
        </div>
        <p className="text-muted-foreground text-sm">{state.message}</p>
        <Link href="/auth/signin" className="btn-primary inline-flex">
          Sign in <ArrowRight size={14} />
        </Link>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <label className="field-label">New Password</label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          className="input-modern"
        />
        {state?.errors?.password && <p className="field-error">{state.errors.password[0]}</p>}
        {state?.errors?.token && <p className="field-error">{state.errors.token[0]}</p>}
      </div>

      <button type="submit" disabled={pending} className="btn-primary w-full h-11">
        {pending ? 'Resetting...' : <>Reset password <ArrowRight size={14} /></>}
      </button>
    </form>
  )
}
