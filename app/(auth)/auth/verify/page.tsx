import { verifyEmailAction } from '@/app/actions/auth'
import Link from 'next/link'
import { Mail, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'

export default async function VerifyPage(props: {
  searchParams: Promise<{ token?: string; sent?: string }>
}) {
  const { token, sent } = await props.searchParams

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
          <Mail size={24} className="text-muted-foreground" />
        </div>
        <h1 className="text-2xl text-foreground mb-2">Check your email</h1>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          We&apos;ve sent a verification link to your email address. Click the link to verify your account.
        </p>
        <Link href="/auth/signin" className="text-accent text-sm hover:underline underline-offset-2">
          Already verified? Sign in
        </Link>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
          <XCircle size={24} className="text-red-500" />
        </div>
        <h1 className="text-xl text-foreground mb-2">Invalid link</h1>
        <p className="text-muted-foreground text-sm mb-6">This verification link is missing a token.</p>
        <Link href="/auth/signup" className="text-accent text-sm hover:underline underline-offset-2">
          Sign up again
        </Link>
      </div>
    )
  }

  const result = await verifyEmailAction(token)

  return (
    <div className="text-center">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 ${result.success ? 'bg-emerald-50' : 'bg-red-50'}`}>
        {result.success
          ? <CheckCircle2 size={24} className="text-emerald-600" />
          : <XCircle size={24} className="text-red-500" />
        }
      </div>
      <h1 className="text-2xl text-foreground mb-2">
        {result.success ? 'Email Verified!' : 'Verification Failed'}
      </h1>
      <p className="text-muted-foreground text-sm mb-8 leading-relaxed">{result.message}</p>
      {result.success ? (
        <Link href="/auth/signin" className="btn-primary inline-flex">
          Sign In <ArrowRight size={14} />
        </Link>
      ) : (
        <Link href="/auth/signup" className="text-accent text-sm hover:underline underline-offset-2">
          Sign up again
        </Link>
      )}
    </div>
  )
}
