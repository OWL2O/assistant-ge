import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { errorResponse } from '@/lib/api-handler'

export const runtime = 'nodejs'

const ROUTE = 'cron/expire-orgs'

/**
 * Daily cron — flips is_active=false on every paid org whose
 * expires_at is in the past.
 *
 * Scheduled via vercel.json:
 *   { "crons": [{ "path": "/api/cron/expire-orgs", "schedule": "0 3 * * *" }] }
 *
 * Protected by CRON_SECRET: Vercel injects the Authorization header when
 * calling the cron; any unauthenticated request is rejected.
 */
export async function GET(request: Request) {
  try {
    const secret = process.env.CRON_SECRET
    const auth = request.headers.get('authorization')
    if (!secret || auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin.rpc('expire_overdue_orgs')
    if (error) throw error

    const expired = typeof data === 'number' ? data : 0
    logger.info('cron.expire_orgs.ok', { route: ROUTE, expired })
    return NextResponse.json({ ok: true, expired })
  } catch (err) {
    return errorResponse(err, { route: ROUTE })
  }
}
