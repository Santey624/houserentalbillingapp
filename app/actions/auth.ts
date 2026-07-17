'use server'

import bcrypt from 'bcryptjs'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { signIn } from '@/lib/auth'
import { SignUpSchema, SignInSchema, ResetRequestSchema, ResetPasswordSchema } from '@/lib/validations'
import { generateToken } from '@/lib/utils'
import {
  sendPasswordResetEmail,
} from '@/lib/email'
import {
  enforceRateLimit,
  getClientAddress,
  RateLimitExceededError,
} from '@/lib/rate-limit'
import { Prisma, type Role } from '@prisma/client'

type ActionState = { errors?: Record<string, string[]>; message?: string } | null

export async function signUpAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = SignUpSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { name, email, password, role } = parsed.data
  const requestHeaders = await headers()
  try {
    await enforceRateLimit(`${getClientAddress(requestHeaders)}:${email}`, {
      scope: 'auth:signup',
      limit: 5,
      windowMs: 60 * 60 * 1000,
    })
  } catch (error) {
    if (error instanceof RateLimitExceededError) return { errors: { _: [error.message] } }
    throw error
  }

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    redirect('/auth/signin?signup=success')
  }

  const hashed = await bcrypt.hash(password, 12)
  try {
    await db.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name,
          email,
          password: hashed,
          role: role as Role,
          emailVerified: new Date(),
        },
      })

      if (role === 'LANDLORD') {
        await tx.landlord.create({ data: { userId: created.id, displayName: name } })
      } else {
        await tx.tenant.create({ data: { userId: created.id, displayName: name } })
      }
      return created
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      redirect('/auth/signin?signup=success')
    }
    throw error
  }

  redirect('/auth/signin?signup=success')
}

export async function signInAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = SignInSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { email, password } = parsed.data
  const requestHeaders = await headers()
  try {
    await enforceRateLimit(`${getClientAddress(requestHeaders)}:${email}`, {
      scope: 'auth:signin',
      limit: 10,
      windowMs: 15 * 60 * 1000,
    })
  } catch (error) {
    if (error instanceof RateLimitExceededError) return { errors: { _: [error.message] } }
    throw error
  }

  try {
    await signIn('credentials', { email, password, redirect: false })
  } catch {
    return { errors: { email: ['Invalid email or password'] } }
  }

  const fullUser = await db.user.findUnique({ where: { email }, select: { role: true } })
  if (!fullUser) return { errors: { email: ['Invalid email or password'] } }

  redirect(fullUser.role === 'LANDLORD' ? '/landlord' : '/tenant')
}

export async function verifyEmailAction(token: string): Promise<{ success: boolean; message: string }> {
  const record = await db.verificationToken.findUnique({ where: { token } })

  if (!record || record.type !== 'email_verify') {
    return { success: false, message: 'Invalid or expired verification link.' }
  }
  if (record.expiresAt < new Date()) {
    await db.verificationToken.delete({ where: { token } })
    return { success: false, message: 'Verification link has expired. Please sign up again.' }
  }

  const verified = await db.$transaction(async (tx) => {
    const consumed = await tx.verificationToken.deleteMany({
      where: {
        token,
        userId: record.userId,
        type: 'email_verify',
        expiresAt: { gt: new Date() },
      },
    })
    if (consumed.count !== 1) return false
    await tx.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    })
    return true
  })
  if (!verified) return { success: false, message: 'Invalid or expired verification link.' }

  return { success: true, message: 'Email verified! You can now sign in.' }
}

export async function requestPasswordResetAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = ResetRequestSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { email } = parsed.data
  const requestHeaders = await headers()
  try {
    await enforceRateLimit(`${getClientAddress(requestHeaders)}:${email}`, {
      scope: 'auth:password-reset',
      limit: 3,
      windowMs: 60 * 60 * 1000,
    })
  } catch (error) {
    if (error instanceof RateLimitExceededError) return { message: 'If an account exists, a reset link has been sent.' }
    throw error
  }
  const user = await db.user.findUnique({ where: { email } })

  if (user) {
    // Delete any existing reset tokens
    await db.verificationToken.deleteMany({
      where: { userId: user.id, type: 'password_reset' },
    })

    const token = generateToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1h

    await db.verificationToken.create({
      data: { userId: user.id, token, type: 'password_reset', expiresAt },
    })

    const result = await sendPasswordResetEmail(email, token)
    if (!result.success) {
      console.error('Password reset email delivery failed', { userId: user.id })
      // Cleanup token if email failed
      await db.verificationToken.deleteMany({
        where: { userId: user.id, type: 'password_reset' },
      })
    }
  }

  // Always return success to avoid email enumeration
  return { message: 'If an account exists, a reset link has been sent.' }
}

export async function resetPasswordAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = ResetPasswordSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { token, password } = parsed.data
  const record = await db.verificationToken.findUnique({ where: { token } })

  if (!record || record.type !== 'password_reset') {
    return { errors: { token: ['Invalid or expired reset link'] } }
  }
  if (record.expiresAt < new Date()) {
    await db.verificationToken.delete({ where: { token } })
    return { errors: { token: ['Reset link has expired. Please request a new one.'] } }
  }

  const hashed = await bcrypt.hash(password, 12)
  const reset = await db.$transaction(async (tx) => {
    const consumed = await tx.verificationToken.deleteMany({
      where: {
        token,
        userId: record.userId,
        type: 'password_reset',
        expiresAt: { gt: new Date() },
      },
    })
    if (consumed.count !== 1) return false

    await tx.user.update({
      where: { id: record.userId },
      data: { password: hashed, sessionVersion: { increment: 1 } },
    })
    await tx.verificationToken.deleteMany({ where: { userId: record.userId } })
    await tx.session.deleteMany({ where: { userId: record.userId } })
    return true
  })
  if (!reset) return { errors: { token: ['Invalid or expired reset link'] } }

  return { message: 'Password reset successfully. You can now sign in.' }
}
