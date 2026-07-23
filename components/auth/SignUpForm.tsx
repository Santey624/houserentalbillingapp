'use client'

import { useActionState } from 'react'
import { signUpAction } from '@/app/actions/auth'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface Props {
  defaultRole: 'LANDLORD' | 'TENANT'
}

export default function SignUpForm({ defaultRole }: Props) {
  const [state, action, pending] = useActionState(signUpAction, null)

  // #region agent log
  if (state?.errors) {
    fetch('http://127.0.0.1:7593/ingest/befd32db-d4a6-43bd-be73-44f8795636bc',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9b9e33'},body:JSON.stringify({sessionId:'9b9e33',runId:'signup-debug',hypothesisId:'D',location:'components/auth/SignUpForm.tsx:state',message:'signup form received error state',data:{fields:Object.keys(state.errors),hasGeneral:Boolean(state.errors._)},timestamp:Date.now()})}).catch(()=>{})
  }
  // #endregion

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="field-label">Full Name</label>
        <input
          name="name"
          type="text"
          required
          placeholder="Your full name"
          className="input-modern"
        />
        {state?.errors?.name && (
          <p className="field-error">{state.errors.name[0]}</p>
        )}
      </div>

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

      <div>
        <label className="field-label">Password</label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          className="input-modern"
        />
        {state?.errors?.password && (
          <p className="field-error">{state.errors.password[0]}</p>
        )}
      </div>

      <div>
        <label className="field-label">I am a</label>
        <select
          name="role"
          defaultValue={defaultRole}
          className="select-modern"
        >
          <option value="LANDLORD">Landlord</option>
          <option value="TENANT">Tenant</option>
        </select>
      </div>

      {state?.errors?._ && (
        <p className="field-error">{state.errors._[0]}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full h-11 mt-2"
      >
        {pending ? 'Creating account...' : <>Create account <ArrowRight size={14} /></>}
      </button>

      <p className="text-center text-sm text-muted-foreground pt-1">
        Already have an account?{' '}
        <Link href="/auth/signin" className="text-accent font-medium hover:underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </form>
  )
}
