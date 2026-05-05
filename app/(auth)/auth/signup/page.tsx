import SignUpForm from '@/components/auth/SignUpForm'

export default async function SignUpPage(props: {
  searchParams: Promise<{ role?: string }>
}) {
  const { role } = await props.searchParams
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Create account</h1>
      <p className="text-gray-500 text-sm mb-6">Join AKS Rental Platform</p>
      <SignUpForm defaultRole={role === 'LANDLORD' ? 'LANDLORD' : 'TENANT'} />
    </>
  )
}
