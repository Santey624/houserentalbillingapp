import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LandlordSidebar from '@/components/landlord/Sidebar'

export default async function LandlordLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')
  if (session.user.role !== 'LANDLORD') redirect('/tenant')

  return (
    <div className="md:flex md:min-h-screen">
      <LandlordSidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
    </div>
  )
}
