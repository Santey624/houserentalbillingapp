import ResetRequestForm from '@/components/auth/ResetRequestForm'

export default function ResetRequestPage() {
  return (
    <>
      <h1 className="font-heading text-3xl font-bold text-[#2d2d2d] -rotate-1 inline-block mb-1">
        Forgot password? 🤔
      </h1>
      <p className="text-[#2d2d2d]/50 text-sm mb-7">
        we&apos;ll send a reset link to your email
      </p>
      <ResetRequestForm />
    </>
  )
}
