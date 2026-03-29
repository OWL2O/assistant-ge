import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await request.json()
  if (!name?.trim()) return NextResponse.json({ error: 'სახელი საჭიროა' }, { status: 400 })

  // Use admin client to bypass RLS for credit/org count queries
  const admin = createAdminClient()

  // Count credits
  const { data: credits } = await admin
    .from('credits').select('amount').eq('user_id', user.id)
  const totalCredits = credits?.reduce((s, c) => s + c.amount, 0) ?? 0

  // Count existing paid orgs
  const { count: paidCount } = await admin
    .from('organizations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_demo', false)

  if ((paidCount ?? 0) >= totalCredits) {
    return NextResponse.json({ error: 'კრედიტი არ გაქვთ' }, { status: 403 })
  }

  // Create org — active for 365 days
  const now = new Date()
  const expires = new Date(now)
  expires.setDate(expires.getDate() + 365)

  const { error } = await admin.from('organizations').insert({
    user_id: user.id,
    name: name.trim(),
    is_demo: false,
    is_active: true,
    activated_at: now.toISOString(),
    expires_at: expires.toISOString(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
