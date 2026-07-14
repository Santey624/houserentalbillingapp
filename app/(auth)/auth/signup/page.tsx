import SignUpForm from '@/components/auth/SignUpForm'

export default async function SignUpPage(props: {
  searchParams: Promise<{ role?: string }>
}) {
  const { role } = await props.searchParams
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl text-foreground mb-1.5">Create your account</h1>
        <p className="text-sm text-muted-foreground">Join the GharKatha platform today</p>
      </div>
      <SignUpForm defaultRole={role === 'LANDLORD' ? 'LANDLORD' : 'TENANT'} />
    </>
  )
}
