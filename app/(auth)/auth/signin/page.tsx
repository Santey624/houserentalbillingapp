import SignInForm from '@/components/auth/SignInForm'
import ResendVerificationForm from '@/components/auth/ResendVerificationForm'

export default async function SignInPage(props: {
  searchParams: Promise<{ callbackUrl?: string; error?: string; signup?: string }>
}) {
  const { callbackUrl, error, signup } = await props.searchParams

  const signupNotice =
    signup === 'email_failed'
      ? 'Your account was created, but we could not send the verification email. Use the form below to resend it, or contact support if this continues.'
      : signup === 'pending'
        ? 'Check your email for a verification link before signing in. You can resend it below if needed.'
        : null

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl text-foreground mb-1.5">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
      </div>

      {signupNotice && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {signupNotice}
        </div>
      )}

      {error && (
        <div className="alert-error mb-6">
          {error === 'Verification'
            ? 'Please verify your email before signing in.'
            : 'Incorrect email or password. Please try again.'}
        </div>
      )}

      <SignInForm callbackUrl={callbackUrl} />

      <div className="mt-8 border-t border-border pt-6">
        <p className="mb-3 text-sm text-muted-foreground">
          Didn&apos;t get a verification email?
        </p>
        <ResendVerificationForm />
      </div>
    </>
  )
}
