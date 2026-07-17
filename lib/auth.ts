import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import type { Role } from '@prisma/client'

declare module 'next-auth' {
  interface User {
    role?: Role
    sessionVersion?: number
  }
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: Role
      sessionVersion: number
    }
  }
}

// JWT augmentation for @auth/core
declare module '@auth/core/jwt' {
  interface JWT {
    id: string
    role: Role
    sessionVersion: number
    revoked?: boolean
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt', maxAge: 12 * 60 * 60 },
  jwt: { maxAge: 12 * 60 * 60 },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined

        if (!email || !password) return null

        const user = await db.user.findUnique({ where: { email } })
        if (!user || !user.password) return null

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          sessionVersion: user.sessionVersion,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? ''
        token.role = user.role as Role
        token.sessionVersion = user.sessionVersion ?? 0
        token.revoked = false
      } else if (token.id) {
        const current = await db.user.findUnique({
          where: { id: token.id },
          select: { role: true, sessionVersion: true },
        })
        token.revoked = !current || current.sessionVersion !== token.sessionVersion
        if (current) token.role = current.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.revoked ? '' : (token.id ?? '')
      session.user.role = token.role
      session.user.sessionVersion = token.sessionVersion
      return session
    },
  },
})

export async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')
  return session
}

export async function requireRole(role: Role) {
  const session = await requireAuth()
  if (session.user.role !== role) throw new Error('Forbidden')
  return session
}
