'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'

export async function endTenancyAction(tenancyId: string) {
  const session = await requireRole('LANDLORD')
  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
  if (!landlord) throw new Error('Landlord not found')

  const tenancy = await db.tenancy.findFirst({
    where: { 
      id: tenancyId,
      unit: { building: { landlordId: landlord.id } }
    }
  })

  if (!tenancy) throw new Error('Tenancy not found')

  await db.tenancy.update({
    where: { id: tenancyId },
    data: { 
      status: 'ENDED',
      endDate: new Date()
    }
  })

  revalidatePath('/landlord/tenants')
  revalidatePath(`/landlord/units/${tenancy.unitId}`)
  revalidatePath('/landlord/invoices/new')
}
