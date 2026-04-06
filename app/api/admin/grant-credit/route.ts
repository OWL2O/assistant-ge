import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { grantCreditSchema } from '@/lib/validation'
import { errorResponse, HttpError, parseJson } from '@/lib/api-handler'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

const ROUTE = 'admin/grant-credit'

export async function POST(request: Request) {
  let userId: string | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new HttpError(401, 'გთხოვთ გაიაროთ ავტორიზაცია')
    userId = user.id

    const admin = createAdminClient()
    const { data: profile, error: pErr } = await admin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    if (pErr) throw pErr
    if (!profile?.is_admin) throw new HttpError(403, 'წვდომა აკრძალულია')

    const { targetUserId, amount, note } = await parseJson(request, grantCreditSchema)

    const { error } = await admin.from('credits').insert({
      user_id: targetUserId,
      granted_by: user.id,
      amount,
      note: note || null,
    })
    if (error) throw error

    logger.info('api.credit_granted', { route: ROUTE, userId, targetUserId, amount })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return errorResponse(err, { route: ROUTE, userId })
  }
}
