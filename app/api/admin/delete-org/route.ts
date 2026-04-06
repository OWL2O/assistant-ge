import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { errorResponse, HttpError, parseJson } from '@/lib/api-handler'
import { logger } from '@/lib/logger'
import { z } from 'zod'

export const runtime = 'nodejs'

const ROUTE = 'admin/delete-org'

const deleteOrgSchema = z.object({
  orgId: z.string().uuid(),
})

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

    const { orgId } = await parseJson(request, deleteOrgSchema)

    const { error } = await admin
      .from('organizations')
      .delete()
      .eq('id', orgId)
    if (error) throw error

    logger.info('api.org_deleted', { route: ROUTE, userId, orgId })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return errorResponse(err, { route: ROUTE, userId })
  }
}
