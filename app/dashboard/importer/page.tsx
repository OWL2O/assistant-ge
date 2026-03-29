import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import TbcImporter from '@/components/importer/TbcImporter'

export default async function ImporterPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>
}) {
  const { org: orgId } = await searchParams
  if (!orgId) redirect('/dashboard')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Use admin client to bypass RLS (same pattern as dashboard page)
  const admin = createAdminClient()
  const { data: org } = await admin
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .eq('user_id', user.id)
    .single()

  if (!org) notFound()

  // Expired non-demo org
  if (!org.is_demo && !org.is_active) {
    redirect('/dashboard')
  }

  return <TbcImporter org={org} />
}
