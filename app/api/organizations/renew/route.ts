import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { renewOrgSchema } from '@/lib/validation'
import { errorResponse, HttpError, parseJson } from '@/lib/api-handler'
import { clientKey, rateLimit, tooManyRequests } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { sendOrgRenewedEmail } from '@/lib/email'

export const runtime = 'nodejs'

const ROUTE = 'organizations/renew'

export async function POST(request: Request) {
  let userId: string | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new HttpError(401, 'გთხოვთ გაიაროთ ავტორიზაცია')
    userId = user.id

    const rl = rateLimit({
      key: `org-renew:${clientKey(request, user.id)}`,
      limit: 5,
      windowMs: 60_000,
    })
    if (!rl.ok) return tooManyRequests(rl)

    const { orgId } = await parseJson(request, renewOrgSchema)

    const admin = createAdminClient()

    // Atomic renewal via PL/pgSQL function: consumes one credit,
    // extends expires_at +365d, and re-activates the org.
    const { data: rpcData, error: rpcErr } = await admin.rpc('renew_organization', {
      p_org_id: orgId,
      p_user_id: user.id,
    })

    if (rpcErr) {
      const msg = rpcErr.message || ''
      if (msg.includes('org_not_found')) throw new HttpError(404, 'ორგანიზაცია ვერ მოიძებნა')
      if (msg.includes('forbidden')) throw new HttpError(403, 'წვდომა აკრძალულია')
      if (msg.includes('demo_cannot_renew')) throw new HttpError(400, 'Demo ვერ განახლდება')
      if (msg.includes('no_credits')) throw new HttpError(402, 'კრედიტი არასაკმარისია')
      throw rpcErr
    }

    const row = Array.isArray(rpcData) ? rpcData[0] : rpcData
    const newExpires: string | undefined = row?.new_expires_at

    logger.info('api.org_renewed', { route: ROUTE, userId, orgId, newExpires })

    // Fire-and-forget notification
    const { data: target } = await admin
      .from('organizations')
      .select('name, profiles:user_id(email, full_name)')
      .eq('id', orgId)
      .single()
    // profiles is a relation; Supabase returns it as an object when .single() on the parent
    const profile = (target as unknown as { profiles?: { email: string; full_name: string | null } } | null)?.profiles
    if (profile?.email && target?.name) {
      void sendOrgRenewedEmail(profile.email, profile.full_name, target.name).catch((e) =>
        logger.error('api.org_renewed.email_failed', { route: ROUTE, err: String(e) }),
      )
    }

    return NextResponse.json({ ok: true, expires_at: newExpires })
  } catch (err) {
    return errorResponse(err, { route: ROUTE, userId })
  }
}
