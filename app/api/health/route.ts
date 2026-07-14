import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startedAt = Date.now()
  try {
    await db.$queryRaw`SELECT 1`
    return Response.json(
      { status: 'ok', checks: { database: 'ok' }, durationMs: Date.now() - startedAt },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch {
    console.error('Readiness database check failed')
    return Response.json(
      { status: 'unavailable', checks: { database: 'failed' } },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
