import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LandlordSidebar from '@/components/landlord/Sidebar'

export default async function LandlordLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')
  if (session.user.role !== 'LANDLORD') redirect('/tenant')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <LandlordSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
