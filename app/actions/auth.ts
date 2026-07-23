'use server'

import bcrypt from 'bcryptjs'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { signIn } from '@/lib/auth'
import { SignUpSchema, SignInSchema, ResetRequestSchema, ResetPasswordSchema } from '@/lib/validations'
import { generateToken } from '@/lib/utils'
import {
  sendVerificationEmail,
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
  // #region agent log
  fetch('http://127.0.0.1:7593/ingest/befd32db-d4a6-43bd-be73-44f8795636bc',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9401e7'},body:JSON.stringify({sessionId:'9401e7',runId:'verify-email-debug',hypothesisId:'D',location:'app/actions/auth.ts:signUpAction:entry',message:'signup action started',data:{hasName:Boolean(formData.get('name')),hasEmail:Boolean(formData.get('email')),hasPassword:Boolean(formData.get('password')),role:String(formData.get('role')??'')},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  const parsed = SignUpSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    // #region agent log
    fetch('http://127.0.0.1:7593/ingest/befd32db-d4a6-43bd-be73-44f8795636bc',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9401e7'},body:JSON.stringify({sessionId:'9401e7',runId:'verify-email-debug',hypothesisId:'D',location:'app/actions/auth.ts:signUpAction:validation',message:'signup validation failed',data:{fields:Object.keys(parsed.error.flatten().fieldErrors)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
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
    // #region agent log
    fetch('http://127.0.0.1:7593/ingest/befd32db-d4a6-43bd-be73-44f8795636bc',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9b9e33'},body:JSON.stringify({sessionId:'9b9e33',runId:'signup-debug',hypothesisId:'A',location:'app/actions/auth.ts:signUpAction:rateLimit',message:'signup rate limit error',data:{isRateLimit:error instanceof RateLimitExceededError,name:error instanceof Error?error.name:'unknown'},timestamp:Date.now()})}).catch(()=>{});
    console.error('[debug-9b9e33]', JSON.stringify({hypothesisId:'A',location:'signUpAction:rateLimit',isRateLimit:error instanceof RateLimitExceededError,name:error instanceof Error?error.name:'unknown'}))
    // #endregion
    if (error instanceof RateLimitExceededError) return { errors: { _: [error.message] } }
    throw error
  }

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    // #region agent log
    fetch('http://127.0.0.1:7593/ingest/befd32db-d4a6-43bd-be73-44f8795636bc',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9b9e33'},body:JSON.stringify({sessionId:'9b9e33',runId:'signup-debug',hypothesisId:'E',location:'app/actions/auth.ts:signUpAction:existing',message:'signup found existing user',data:{unverified:existing.emailVerified==null},timestamp:Date.now()})}).catch(()=>{});
    console.error('[debug-9b9e33]', JSON.stringify({hypothesisId:'E',location:'signUpAction:existing',unverified:existing.emailVerified==null}))
    // #endregion
    redirect('/auth/signin?signup=pending')
  }

  const hashed = await bcrypt.hash(password, 12)
  const token = generateToken()
  let user
  try {
    user = await db.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name,
          email,
          password: hashed,
          role: role as Role,
          emailVerified: null,
          verificationTokens: {
            create: {
              token,
              type: 'email_verify',
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
          },
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
    // #region agent log
    fetch('http://127.0.0.1:7593/ingest/befd32db-d4a6-43bd-be73-44f8795636bc',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9b9e33'},body:JSON.stringify({sessionId:'9b9e33',runId:'signup-debug',hypothesisId:'A',location:'app/actions/auth.ts:signUpAction:create',message:'signup create failed',data:{code:error instanceof Prisma.PrismaClientKnownRequestError?error.code:undefined,name:error instanceof Error?error.name:'unknown'},timestamp:Date.now()})}).catch(()=>{});
    console.error('[debug-9b9e33]', JSON.stringify({hypothesisId:'A',location:'signUpAction:create',code:error instanceof Prisma.PrismaClientKnownRequestError?error.code:undefined,name:error instanceof Error?error.name:'unknown'}))
    // #endregion
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      redirect('/auth/signin?signup=pending')
    }
    throw error
  }

  // #region agent log
  fetch('http://127.0.0.1:7593/ingest/befd32db-d4a6-43bd-be73-44f8795636bc',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9b9e33'},body:JSON.stringify({sessionId:'9b9e33',runId:'signup-debug',hypothesisId:'B',location:'app/actions/auth.ts:signUpAction:created',message:'signup user created',data:{role,emailVerified:user.emailVerified==null},timestamp:Date.now()})}).catch(()=>{});
  console.error('[debug-9b9e33]', JSON.stringify({hypothesisId:'B',location:'signUpAction:created',role,emailVerifiedNull:user.emailVerified==null}))
  // #endregion

  const delivery = await sendVerificationEmail(user.email, token)
  // #region agent log
  fetch('http://127.0.0.1:7593/ingest/befd32db-d4a6-43bd-be73-44f8795636bc',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9401e7'},body:JSON.stringify({sessionId:'9401e7',runId:'verify-email-debug',hypothesisId:'B',location:'app/actions/auth.ts:signUpAction:email',message:'verification email attempted',data:{success:delivery.success,errorName:delivery.success?null:(delivery.error instanceof Error?delivery.error.name:'unknown'),errorMessage:delivery.success?null:(delivery.error instanceof Error?delivery.error.message.slice(0,180):'unknown')},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  if (!delivery.success) {
    console.error('Verification email delivery failed', { userId: user.id })
    // #region agent log
    fetch('http://127.0.0.1:7593/ingest/befd32db-d4a6-43bd-be73-44f8795636bc',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9401e7'},body:JSON.stringify({sessionId:'9401e7',runId:'verify-email-debug',hypothesisId:'E',location:'app/actions/auth.ts:signUpAction:emailFailedRedirect',message:'signup redirecting after email failure',data:{emailSent:false},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    redirect('/auth/signin?signup=email_failed')
  }

  // #region agent log
  fetch('http://127.0.0.1:7593/ingest/befd32db-d4a6-43bd-be73-44f8795636bc',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9401e7'},body:JSON.stringify({sessionId:'9401e7',runId:'verify-email-debug',hypothesisId:'C',location:'app/actions/auth.ts:signUpAction:redirect',message:'signup redirecting to pending signin',data:{emailSent:true},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  redirect('/auth/signin?signup=pending')
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

  const existingUser = await db.user.findUnique({
    where: { email },
    select: { id: true, password: true, emailVerified: true, role: true },
  })
  if (existingUser?.password && !existingUser.emailVerified) {
    const passwordMatches = await bcrypt.compare(password, existingUser.password)
    if (passwordMatches) {
      // #region agent log
      fetch('http://127.0.0.1:7593/ingest/befd32db-d4a6-43bd-be73-44f8795636bc',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9b9e33'},body:JSON.stringify({sessionId:'9b9e33',runId:'signup-debug',hypothesisId:'C',location:'app/actions/auth.ts:signInAction:unverified',message:'signin blocked for unverified email',data:{},timestamp:Date.now()})}).catch(()=>{});
      console.error('[debug-9b9e33]', JSON.stringify({hypothesisId:'C',location:'signInAction:unverified'}))
      // #endregion
      return {
        errors: {
          email: ['Please verify your email before signing in. Check your inbox or resend the verification email below.'],
        },
      }
    }
  }

  try {
    await signIn('credentials', { email, password, redirect: false })
  } catch {
    return { errors: { email: ['Invalid email or password'] } }
  }

  const fullUser = existingUser ?? (await db.user.findUnique({ where: { email }, select: { role: true } }))
  if (!fullUser) return { errors: { email: ['Invalid email or password'] } }

  redirect(fullUser.role === 'LANDLORD' ? '/landlord' : '/tenant')
}

export async function resendVerificationEmailAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = ResetRequestSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { email } = parsed.data
  const requestHeaders = await headers()
  try {
    await enforceRateLimit(`${getClientAddress(requestHeaders)}:${email}`, {
      scope: 'auth:resend-verification',
      limit: 3,
      windowMs: 60 * 60 * 1000,
    })
  } catch (error) {
    if (error instanceof RateLimitExceededError) {
      return { message: 'If an unverified account exists, a new verification link has been sent.' }
    }
    throw error
  }

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, emailVerified: true },
  })

  if (user && !user.emailVerified) {
    await db.verificationToken.deleteMany({
      where: { userId: user.id, type: 'email_verify' },
    })
    const token = generateToken()
    await db.verificationToken.create({
      data: {
        userId: user.id,
        token,
        type: 'email_verify',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })
    const delivery = await sendVerificationEmail(email, token)
    // #region agent log
    fetch('http://127.0.0.1:7593/ingest/befd32db-d4a6-43bd-be73-44f8795636bc',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9401e7'},body:JSON.stringify({sessionId:'9401e7',runId:'verify-email-debug',hypothesisId:'B',location:'app/actions/auth.ts:resendVerification',message:'resend verification attempted',data:{success:delivery.success,errorMessage:delivery.success?null:(delivery.error instanceof Error?delivery.error.message.slice(0,180):'unknown')},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!delivery.success) {
      console.error('Resend verification email delivery failed', { userId: user.id })
      return {
        errors: {
          _: ['We could not send the verification email. Please try again later or contact support.'],
        },
      }
    }
  }

  return { message: 'If an unverified account exists, a new verification link has been sent.' }
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
