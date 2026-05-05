import ResetRequestForm from '@/components/auth/ResetRequestForm'

export default function ResetRequestPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot password?</h1>
      <p className="text-gray-500 text-sm mb-6">
        Enter your email address and we&apos;ll send you a reset link.
      </p>
      <ResetRequestForm />
    </>
  )
}
