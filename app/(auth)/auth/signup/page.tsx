import SignUpForm from '@/components/auth/SignUpForm'

export default async function SignUpPage(props: {
  searchParams: Promise<{ role?: string }>
}) {
  const { role } = await props.searchParams
  return (
    <>
      <h1 className="font-heading text-3xl font-bold text-[#2d2d2d] rotate-1 inline-block mb-1">
        Create account ✨
      </h1>
      <p className="text-[#2d2d2d]/50 text-sm mb-7">join the AKS Rental family</p>
      <SignUpForm defaultRole={role === 'LANDLORD' ? 'LANDLORD' : 'TENANT'} />
    </>
  )
}
