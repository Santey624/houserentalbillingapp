'use client'

import { useActionState } from 'react'
import { resendVerificationEmailAction } from '@/app/actions/auth'

export default function ResendVerificationForm({ defaultEmail = '' }: { defaultEmail?: string }) {
  const [state, action, pending] = useActionState(resendVerificationEmailAction, null)

  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="field-label">Email for verification link</label>
        <input
          name="email"
          type="email"
          required
          defaultValue={defaultEmail}
          autoComplete="email"
          placeholder="you@example.com"
          className="input-modern"
        />
        {state?.errors?.email && (
          <p className="field-error">{state.errors.email[0]}</p>
        )}
        {state?.errors?._ && (
          <p className="field-error">{state.errors._[0]}</p>
        )}
        {state?.message && (
          <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="btn-secondary h-10 w-full text-sm"
      >
        {pending ? 'Sending...' : 'Resend verification email'}
      </button>
    </form>
  )
}
