import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { renameOrgSchema } from '@/lib/validation'
import { errorResponse, HttpError, parseJson } from '@/lib/api-handler'
import { clientKey, rateLimit, tooManyRequests } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

const ROUTE = 'organizations/rename'

export async function POST(request: Request) {
  let userId: string | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new HttpError(401, 'გთხოვთ გაიაროთ ავტორიზაცია')
    userId = user.id

    const rl = rateLimit({
      key: `org-rename:${clientKey(request, user.id)}`,
      limit: 10,
      windowMs: 60_000,
    })
    if (!rl.ok) return tooManyRequests(rl)

    const { orgId, name } = await parseJson(request, renameOrgSchema)

    const admin = createAdminClient()

    // Verify ownership — user can only rename their own orgs.
    const { data: org, error: oErr } = await admin
      .from('organizations')
      .select('id, user_id, is_demo')
      .eq('id', orgId)
      .eq('user_id', user.id)
      .maybeSingle()
    if (oErr) throw oErr
    if (!org) throw new HttpError(404, 'ორგანიზაცია ვერ მოიძებნა')
    if (org.is_demo) throw new HttpError(400, 'Demo ორგანიზაციის სახელი არ შეიძლება შეიცვალოს')

    const { error } = await admin
      .from('organizations')
      .update({ name })
      .eq('id', orgId)
    if (error) throw error

    logger.info('api.org_renamed', { route: ROUTE, userId, orgId, name })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return errorResponse(err, { route: ROUTE, userId })
  }
}
