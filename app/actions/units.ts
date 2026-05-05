'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { UnitSchema } from '@/lib/validations'

type ActionState = { errors?: Record<string, string[]>; message?: string } | null

async function getLandlordId(userId: string) {
  const landlord = await db.landlord.findUnique({ where: { userId } })
  if (!landlord) throw new Error('Landlord profile not found')
  return landlord.id
}

export async function createUnitAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole('LANDLORD')
  const landlordId = await getLandlordId(session.user.id)

  const parsed = UnitSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }

  // Verify building belongs to landlord
  const building = await db.building.findFirst({
    where: { id: parsed.data.buildingId, landlordId },
  })
  if (!building) return { errors: { buildingId: ['Building not found'] } }

  const unit = await db.unit.create({ data: parsed.data })

  revalidatePath(`/landlord/buildings/${parsed.data.buildingId}`)
  redirect(`/landlord/units/${unit.id}`)
}

export async function updateUnitAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole('LANDLORD')
  const landlordId = await getLandlordId(session.user.id)

  const id = formData.get('id') as string
  const unit = await db.unit.findFirst({
    where: { id },
    include: { building: true },
  })
  if (!unit || unit.building.landlordId !== landlordId) {
    return { errors: { _: ['Unit not found'] } }
  }

  const parsed = UnitSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }

  await db.unit.update({ where: { id }, data: parsed.data })

  revalidatePath(`/landlord/units/${id}`)
  revalidatePath(`/landlord/buildings/${unit.buildingId}`)
  return { message: 'Unit updated.' }
}

export async function deleteUnitAction(id: string): Promise<void> {
  const session = await requireRole('LANDLORD')
  const landlordId = await getLandlordId(session.user.id)

  const unit = await db.unit.findFirst({
    where: { id },
    include: { building: true },
  })
  if (!unit || unit.building.landlordId !== landlordId) throw new Error('Unit not found')

  const buildingId = unit.buildingId
  await db.unit.delete({ where: { id } })
  revalidatePath(`/landlord/buildings/${buildingId}`)
  redirect(`/landlord/buildings/${buildingId}`)
}
