'use client'

import { useActionState } from 'react'
import { signInAction } from '@/app/actions/auth'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface Props {
  callbackUrl?: string
}

export default function SignInForm({ callbackUrl }: Props) {
  const [state, action, pending] = useActionState(signInAction, null)

  return (
    <form action={action} className="space-y-4">
      {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}
      {state?.errors?._ && (
        <div className="alert-error">{state.errors._[0]}</div>
      )}

      <div>
        <label className="field-label">Email</label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="input-modern"
        />
        {state?.errors?.email && (
          <p className="field-error">{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="field-label mb-0">Password</label>
          <Link
            href="/auth/reset"
            className="text-xs text-accent hover:underline underline-offset-2"
          >
            Forgot password?
          </Link>
        </div>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="input-modern"
        />
        {state?.errors?.password && (
          <p className="field-error">{state.errors.password[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full h-11 mt-2"
      >
        {pending ? 'Signing in...' : <>Sign in <ArrowRight size={14} /></>}
      </button>

      <p className="text-center text-sm text-muted-foreground pt-1">
        No account?{' '}
        <Link href="/auth/signup" className="text-accent font-medium hover:underline underline-offset-2">
          Sign up here
        </Link>
      </p>
    </form>
  )
}
