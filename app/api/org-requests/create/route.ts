import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createOrgRequestSchema } from '@/lib/validation'
import { errorResponse, HttpError, parseJson } from '@/lib/api-handler'
import { clientKey, rateLimit, tooManyRequests } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

const ROUTE = 'org-requests/create'

export async function POST(request: Request) {
  let userId: string | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new HttpError(401, 'გთხოვთ გაიაროთ ავტორიზაცია')
    userId = user.id

    // ── Rate limit: 3 requests / 10 minutes / user ──
    const rl = rateLimit({
      key: `org-req:${clientKey(request, user.id)}`,
      limit: 3,
      windowMs: 10 * 60_000,
    })
    if (!rl.ok) {
      logger.warn('api.rate_limited', { route: ROUTE, userId })
      return tooManyRequests(rl)
    }

    const { message } = await parseJson(request, createOrgRequestSchema)

    const admin = createAdminClient()

    // Block duplicate pending requests.
    const { count: pendingCount, error: countErr } = await admin
      .from('org_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'pending')
    if (countErr) throw countErr
    if ((pendingCount ?? 0) > 0) {
      throw new HttpError(409, 'უკვე გაქვთ მოლოდინში მოთხოვნა')
    }

    const { error } = await admin.from('org_requests').insert({
      user_id: user.id,
      message: message || null,
      status: 'pending',
    })
    if (error) throw error

    logger.info('api.org_request_created', { route: ROUTE, userId })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return errorResponse(err, { route: ROUTE, userId })
  }
}
