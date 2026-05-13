import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export default async function ResetPasswordPage(props: {
  params: Promise<{ token: string }>
}) {
  const { token } = await props.params
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl text-foreground mb-1.5">Reset password</h1>
        <p className="text-sm text-muted-foreground">Enter your new password below</p>
      </div>
      <ResetPasswordForm token={token} />
    </>
  )
}
