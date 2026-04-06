import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { renameOrgSchema } from '@/lib/validation'
import { errorResponse, HttpError, parseJson } from '@/lib/api-handler'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

const ROUTE = 'admin/rename-org'

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

    const { orgId, name } = await parseJson(request, renameOrgSchema)

    const { data: org, error: oErr } = await admin
      .from('organizations')
      .select('is_demo')
      .eq('id', orgId)
      .single()
    if (oErr) throw oErr
    if (org?.is_demo) throw new HttpError(400, 'Demo ორგანიზაციის სახელი არ შეიძლება შეიცვალოს')

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
