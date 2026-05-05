'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { BuildingSchema } from '@/lib/validations'

type ActionState = { errors?: Record<string, string[]>; message?: string } | null

export async function createBuildingAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole('LANDLORD')
  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
  if (!landlord) return { errors: { _: ['Landlord profile not found'] } }

  const parsed = BuildingSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }

  const building = await db.building.create({
    data: { ...parsed.data, landlordId: landlord.id },
  })

  revalidatePath('/landlord/buildings')
  redirect(`/landlord/buildings/${building.id}`)
}

export async function updateBuildingAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole('LANDLORD')
  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
  if (!landlord) return { errors: { _: ['Landlord profile not found'] } }

  const id = formData.get('id') as string
  const building = await db.building.findFirst({ where: { id, landlordId: landlord.id } })
  if (!building) return { errors: { _: ['Building not found'] } }

  const parsed = BuildingSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }

  await db.building.update({ where: { id }, data: parsed.data })

  revalidatePath('/landlord/buildings')
  revalidatePath(`/landlord/buildings/${id}`)
  return { message: 'Building updated.' }
}

export async function deleteBuildingAction(id: string): Promise<void> {
  const session = await requireRole('LANDLORD')
  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
  if (!landlord) throw new Error('Landlord not found')

  await db.building.deleteMany({ where: { id, landlordId: landlord.id } })
  revalidatePath('/landlord/buildings')
  redirect('/landlord/buildings')
}
