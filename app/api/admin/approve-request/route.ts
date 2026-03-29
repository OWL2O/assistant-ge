import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Verify caller is admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { requestId, action } = await request.json()
  if (!requestId || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  // Fetch the request
  const { data: req } = await admin
    .from('org_requests')
    .select('id, user_id, status')
    .eq('id', requestId)
    .single()

  if (!req) return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  if (req.status !== 'pending') return NextResponse.json({ error: 'Already processed' }, { status: 409 })

  // Update status
  const newStatus = action === 'approve' ? 'approved' : 'rejected'
  const { error: updateError } = await admin
    .from('org_requests')
    .update({ status: newStatus })
    .eq('id', requestId)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  // If approved, grant +1 credit
  if (action === 'approve') {
    const { error: creditError } = await admin.from('credits').insert({
      user_id: req.user_id,
      granted_by: user.id,
      amount: 1,
      note: 'org request approved',
    })
    if (creditError) return NextResponse.json({ error: creditError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
