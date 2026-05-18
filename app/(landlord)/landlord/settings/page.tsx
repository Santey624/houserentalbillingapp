import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SettingsForm from '@/components/landlord/SettingsForm'

export default async function LandlordSettingsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'LANDLORD') {
    redirect('/auth/signin')
  }

  const landlord = await db.landlord.findUnique({
    where: { userId: session.user.id }
  })

  if (!landlord) {
    return <div>Landlord profile not found</div>
  }

  return (
    <div className="p-5 sm:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-4xl text-foreground mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and invoice defaults</p>
      </div>

      <SettingsForm landlord={landlord} />
    </div>
  )
}
