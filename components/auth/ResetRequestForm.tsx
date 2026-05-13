'use client'

import { useActionState } from 'react'
import { requestPasswordResetAction } from '@/app/actions/auth'
import Link from 'next/link'
import { Mail, ArrowRight, ChevronLeft } from 'lucide-react'

export default function ResetRequestForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, null)

  if (state?.message) {
    return (
      <div className="text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto">
          <Mail size={24} className="text-muted-foreground" />
        </div>
        <div className="alert-success">
          {state.message}
        </div>
        <Link href="/auth/signin" className="inline-flex items-center gap-1 text-accent text-sm hover:underline underline-offset-2">
          <ChevronLeft size={14} />
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="field-label">Email</label>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="input-modern"
        />
        {state?.errors?.email && (
          <p className="field-error">{state.errors.email[0]}</p>
        )}
      </div>

      <button type="submit" disabled={pending} className="btn-primary w-full h-11">
        {pending ? 'Sending...' : <>Send reset link <ArrowRight size={14} /></>}
      </button>

      <div className="text-center">
        <Link href="/auth/signin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={14} />
          Back to sign in
        </Link>
      </div>
    </form>
  )
}
