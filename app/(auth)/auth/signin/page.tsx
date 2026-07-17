import SignInForm from '@/components/auth/SignInForm'

export default async function SignInPage(props: {
  searchParams: Promise<{ callbackUrl?: string; error?: string; signup?: string }>
}) {
  const { callbackUrl, error, signup } = await props.searchParams
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl text-foreground mb-1.5">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
      </div>

      {signup === 'success' && (
        <div className="alert-success mb-6">
          Your account is ready. Sign in with the email and password you just created.
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
    </>
  )
}
