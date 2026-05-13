import SignInForm from '@/components/auth/SignInForm'

export default async function SignInPage(props: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>
}) {
  const { callbackUrl, error } = await props.searchParams
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl text-foreground mb-1.5">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
      </div>

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
