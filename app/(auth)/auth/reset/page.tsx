import ResetRequestForm from '@/components/auth/ResetRequestForm'

export default function ResetRequestPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl text-foreground mb-1.5">Forgot password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>
      <ResetRequestForm />
    </>
  )
}
