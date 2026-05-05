import { verifyEmailAction } from '@/app/actions/auth'
import Link from 'next/link'

export default async function VerifyPage(props: {
  searchParams: Promise<{ token?: string; sent?: string }>
}) {
  const { token, sent } = await props.searchParams

  if (sent) {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">📧</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
        <p className="text-gray-500 text-sm mb-6">
          We&apos;ve sent a verification link to your email address. Click the link to verify your account.
        </p>
        <Link href="/auth/signin" className="text-[#0f3460] text-sm hover:underline">
          Already verified? Sign in
        </Link>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid link</h1>
        <p className="text-gray-500 text-sm">This verification link is missing a token.</p>
        <Link href="/auth/signup" className="text-[#0f3460] text-sm hover:underline mt-4 block">
          Sign up again
        </Link>
      </div>
    )
  }

  const result = await verifyEmailAction(token)

  return (
    <div className="text-center">
      <div className="text-5xl mb-4">{result.success ? '✅' : '❌'}</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {result.success ? 'Email Verified!' : 'Verification Failed'}
      </h1>
      <p className="text-gray-500 text-sm mb-6">{result.message}</p>
      {result.success ? (
        <Link
          href="/auth/signin"
          className="inline-block bg-[#0f3460] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#0f3460]/90 transition"
        >
          Sign In
        </Link>
      ) : (
        <Link href="/auth/signup" className="text-[#0f3460] text-sm hover:underline">
          Sign up again
        </Link>
      )}
    </div>
  )
}
