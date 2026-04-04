import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orgId, name } = await request.json()
  if (!orgId || !name?.trim()) return NextResponse.json({ error: 'Invalid params' }, { status: 400 })

  const admin = createAdminClient()

  // Verify ownership — user can only rename their own orgs
  const { data: org } = await admin
    .from('organizations')
    .select('id, user_id')
    .eq('id', orgId)
    .eq('user_id', user.id)
    .single()

  if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await admin
    .from('organizations')
    .update({ name: name.trim() })
    .eq('id', orgId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
