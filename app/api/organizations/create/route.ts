import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createOrgSchema } from '@/lib/validation'
import { errorResponse, HttpError, parseJson } from '@/lib/api-handler'
import { clientKey, rateLimit, tooManyRequests } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

const ROUTE = 'organizations/create'

export async function POST(request: Request) {
  let userId: string | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new HttpError(401, 'გთხოვთ გაიაროთ ავტორიზაცია')
    userId = user.id

    // ── Rate limit: 5 creates / minute / user ──
    const rl = rateLimit({
      key: `org-create:${clientKey(request, user.id)}`,
      limit: 5,
      windowMs: 60_000,
    })
    if (!rl.ok) {
      logger.warn('api.rate_limited', { route: ROUTE, userId })
      return tooManyRequests(rl)
    }

    const { name } = await parseJson(request, createOrgSchema)

    const admin = createAdminClient()

    // Credit accounting — treat as read-modify-write within the route,
    // then constrain with a unique-ish guard via the insert itself.
    const { data: credits, error: cErr } = await admin
      .from('credits')
      .select('amount')
      .eq('user_id', user.id)
    if (cErr) throw cErr
    const totalCredits = credits?.reduce((s, c) => s + c.amount, 0) ?? 0

    const { count: paidCount, error: oErr } = await admin
      .from('organizations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_demo', false)
    if (oErr) throw oErr

    if ((paidCount ?? 0) >= totalCredits) {
      throw new HttpError(403, 'კრედიტი არ გაქვთ')
    }

    const now = new Date()
    const expires = new Date(now)
    expires.setDate(expires.getDate() + 365)

    const { error } = await admin.from('organizations').insert({
      user_id: user.id,
      name,
      is_demo: false,
      is_active: true,
      activated_at: now.toISOString(),
      expires_at: expires.toISOString(),
    })
    if (error) throw error

    logger.info('api.org_created', { route: ROUTE, userId, name })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return errorResponse(err, { route: ROUTE, userId })
  }
}
