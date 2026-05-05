import SignInForm from '@/components/auth/SignInForm'

export default async function SignInPage(props: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>
}) {
  const { callbackUrl, error } = await props.searchParams
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
      <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error === 'Verification' ? 'Please verify your email before signing in.' : 'Invalid email or password.'}
        </div>
      )}
      <SignInForm callbackUrl={callbackUrl} />
    </>
  )
}
