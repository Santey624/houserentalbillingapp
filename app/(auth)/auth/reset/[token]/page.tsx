import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export default async function ResetPasswordPage(props: {
  params: Promise<{ token: string }>
}) {
  const { token } = await props.params
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset password</h1>
      <p className="text-gray-500 text-sm mb-6">Enter your new password below.</p>
      <ResetPasswordForm token={token} />
    </>
  )
}
