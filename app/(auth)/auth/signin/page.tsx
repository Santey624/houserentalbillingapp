import SignInForm from '@/components/auth/SignInForm'

export default async function SignInPage(props: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>
}) {
  const { callbackUrl, error } = await props.searchParams
  return (
    <>
      <h1 className="font-heading text-3xl font-bold text-[#2d2d2d] -rotate-1 inline-block mb-1">
        Welcome back! 👋
      </h1>
      <p className="text-[#2d2d2d]/50 text-sm mb-7">sign in to your account</p>

      {error && (
        <div
          className="mb-5 px-4 py-3 bg-[#ff4d4d]/10 border-[2px] border-[#ff4d4d] text-[#ff4d4d] text-sm"
          style={{ borderRadius: '95px 8px 85px 8px / 8px 85px 8px 95px' }}
        >
          {error === 'Verification'
            ? '⚠️ Please verify your email first!'
            : '⚠️ Wrong email or password!'}
        </div>
      )}

      <SignInForm callbackUrl={callbackUrl} />
    </>
  )
}
