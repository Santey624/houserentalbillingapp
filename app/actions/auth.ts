'use server'

import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { signIn } from '@/lib/auth'
import { SignUpSchema, SignInSchema, ResetRequestSchema, ResetPasswordSchema } from '@/lib/validations'
import { generateToken } from '@/lib/utils'
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '@/lib/email'
import type { Role } from '@prisma/client'

type ActionState = { errors?: Record<string, string[]>; message?: string } | null

export async function signUpAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = SignUpSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { name, email, password, role } = parsed.data

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return { errors: { email: ['An account with this email already exists'] } }
  }

  const hashed = await bcrypt.hash(password, 12)
  const token = generateToken()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: role as Role,
      verificationTokens: {
        create: { token, type: 'email_verify', expiresAt },
      },
    },
  })

  // Create role-specific profile
  if (role === 'LANDLORD') {
    await db.landlord.create({
      data: { userId: user.id, displayName: name },
    })
  } else {
    await db.tenant.create({
      data: { userId: user.id, displayName: name },
    })
  }

  try {
    await sendVerificationEmail(email, token)
  } catch (error) {
    console.error('Failed to send verification email:', error)
    try {
      await db.user.delete({ where: { id: user.id } })
    } catch (cleanupError) {
      console.error('Failed to clean up user after email send failure:', cleanupError)
    }
    return { errors: { email: ['Could not send verification email. Please try signing up again.'] } }
  }

  redirect('/auth/verify?sent=1')
}

export async function signInAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = SignInSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { email, password } = parsed.data

  const user = await db.user.findUnique({ where: { email }, select: { emailVerified: true } })
  if (user && !user.emailVerified) {
    return { errors: { email: ['Please verify your email before signing in'] } }
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

  await db.user.update({
    where: { id: record.userId },
    data: { emailVerified: new Date() },
  })
  await db.verificationToken.delete({ where: { token } })

  return { success: true, message: 'Email verified! You can now sign in.' }
}

export async function requestPasswordResetAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = ResetRequestSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { email } = parsed.data
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

    try {
      await sendPasswordResetEmail(email, token)
    } catch (error) {
      console.error(`Failed to send password reset email for user ${user.id}:`, error)
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
  await db.user.update({ where: { id: record.userId }, data: { password: hashed } })
  await db.verificationToken.delete({ where: { token } })

  return { message: 'Password reset successfully. You can now sign in.' }
}
