import 'server-only'

import { createHash } from 'node:crypto'
import { db } from '@/lib/db'

export type RateLimitPolicy = {
  scope: string
  limit: number
  windowMs: number
}

export class RateLimitExceededError extends Error {
  constructor(public readonly retryAfterSeconds: number) {
    super('Too many requests. Please try again later.')
  }
}

function hashIdentifier(identifier: string) {
  return createHash('sha256').update(identifier.trim().toLowerCase()).digest('hex')
}

export function getClientAddress(headers: Headers) {
  const vercelAddress = headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()
  if (vercelAddress) return vercelAddress

  if (process.env.NODE_ENV !== 'production') {
    return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  }

  return 'unknown'
}

export async function enforceRateLimit(identifier: string, policy: RateLimitPolicy) {
  const now = new Date()
  const cutoff = new Date(now.getTime() - policy.windowMs)
  const key = `${policy.scope}:${hashIdentifier(identifier)}`

  const [bucket] = await db.$queryRaw<Array<{ count: number; windowStart: Date }>>`
    INSERT INTO "RateLimitBucket" ("key", "count", "windowStart", "updatedAt")
    VALUES (${key}, 1, ${now}, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "RateLimitBucket"."windowStart" <= ${cutoff} THEN 1
        ELSE "RateLimitBucket"."count" + 1
      END,
      "windowStart" = CASE
        WHEN "RateLimitBucket"."windowStart" <= ${cutoff} THEN ${now}
        ELSE "RateLimitBucket"."windowStart"
      END,
      "updatedAt" = ${now}
    RETURNING "count", "windowStart"
  `

  if (bucket.count > policy.limit) {
    const retryAt = bucket.windowStart.getTime() + policy.windowMs
    throw new RateLimitExceededError(Math.max(1, Math.ceil((retryAt - now.getTime()) / 1000)))
  }
}
