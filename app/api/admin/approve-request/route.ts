import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { approveRequestSchema } from '@/lib/validation'
import { errorResponse, HttpError, parseJson } from '@/lib/api-handler'
import { logger } from '@/lib/logger'
import { sendRequestApprovedEmail, sendRequestRejectedEmail } from '@/lib/email'

export const runtime = 'nodejs'

const ROUTE = 'admin/approve-request'

export async function POST(request: Request) {
  let userId: string | null = null
  try {
    // ── AuthZ ────────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new HttpError(401, 'გთხოვთ გაიაროთ ავტორიზაცია')
    userId = user.id

    const admin = createAdminClient()
    const { data: profile, error: profileErr } = await admin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    if (profileErr) throw profileErr
    if (!profile?.is_admin) throw new HttpError(403, 'წვდომა აკრძალულია')

    // ── Validation ───────────────────────────────────────────
    const { requestId, action } = await parseJson(request, approveRequestSchema)

    // ── Atomic status update + credit insert via RPC ─────────
    // The PL/pgSQL function runs in a single transaction: if the
    // credit insert fails, the status update is rolled back as well.
    const { data: rpcData, error: rpcErr } = await admin.rpc('approve_org_request', {
      p_request_id: requestId,
      p_admin_id: user.id,
      p_action: action,
    })

    if (rpcErr) {
      // Map Postgres exceptions → HTTP statuses
      const msg = rpcErr.message || ''
      if (msg.includes('request_not_found')) throw new HttpError(404, 'მოთხოვნა ვერ მოიძებნა')
      if (msg.includes('already_processed')) throw new HttpError(409, 'უკვე დამუშავებულია')
      if (msg.includes('invalid_action')) throw new HttpError(400, 'არასწორი მოქმედება')
      throw rpcErr
    }

    // RPC returns [{ user_id, new_status }]
    const row = Array.isArray(rpcData) ? rpcData[0] : rpcData
    const targetUserId: string | undefined = row?.user_id

    logger.info('api.approve_request.ok', {
      route: ROUTE,
      userId,
      requestId,
      action,
      targetUserId,
    })

    // ── Notify the user (fire-and-forget; never fails the txn) ──
    if (targetUserId) {
      const { data: target } = await admin
        .from('profiles')
        .select('email, full_name')
        .eq('id', targetUserId)
        .single()

      if (target?.email) {
        const send =
          action === 'approve'
            ? sendRequestApprovedEmail(target.email, target.full_name)
            : sendRequestRejectedEmail(target.email, target.full_name)
        // Don't await — fail-open so a Resend outage can't break approvals.
        void send.catch((e) =>
          logger.error('api.approve_request.email_failed', { route: ROUTE, err: String(e) }),
        )
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return errorResponse(err, { route: ROUTE, userId })
  }
}
