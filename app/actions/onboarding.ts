'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { LandlordProfileSchema, BuildingSchema, UnitSchema } from '@/lib/validations'

type ActionState = { errors?: Record<string, string[]>; message?: string; buildingId?: string } | null

export async function onboardingProfileAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole('LANDLORD')
  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
  if (!landlord) return { errors: { _: ['Profile not found'] } }

  const parsed = LandlordProfileSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }

  await db.landlord.update({ where: { id: landlord.id }, data: parsed.data })
  return { message: 'saved' }
}

export async function onboardingBuildingAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole('LANDLORD')
  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
  if (!landlord) return { errors: { _: ['Profile not found'] } }

  const parsed = BuildingSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }

  const building = await db.building.create({ data: { ...parsed.data, landlordId: landlord.id } })
  return { message: 'saved', buildingId: building.id }
}

export async function onboardingUnitAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole('LANDLORD')
  const landlord = await db.landlord.findUnique({ where: { userId: session.user.id } })
  if (!landlord) return { errors: { _: ['Profile not found'] } }

  const parsed = UnitSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }

  const building = await db.building.findFirst({ where: { id: parsed.data.buildingId, landlordId: landlord.id } })
  if (!building) return { errors: { buildingId: ['Building not found'] } }

  await db.unit.create({ data: parsed.data })
  await db.landlord.update({ where: { id: landlord.id }, data: { onboardingDone: true } })

  revalidatePath('/landlord')
  redirect('/landlord')
}

export async function skipOnboardingAction(): Promise<void> {
  const session = await requireRole('LANDLORD')
  await db.landlord.update({ where: { userId: session.user.id }, data: { onboardingDone: true } })
  redirect('/landlord')
}
