import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Must be admin (use admin client to bypass RLS)
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { targetUserId, amount, note } = await request.json()
  if (!targetUserId || !amount || amount < 1) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  }

  const { error } = await admin.from('credits').insert({
    user_id: targetUserId,
    granted_by: user.id,
    amount,
    note: note || null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
