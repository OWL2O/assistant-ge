import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import DashboardHeader from '@/components/DashboardHeader'

const getProfile = cache(async (userId: string) => {
  const admin = createAdminClient()
  const { data } = await admin.from('profiles').select('*').eq('id', userId).single()
  return data
})

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const profile = await getProfile(user.id)

  return (
    <div className="app-shell">
      <DashboardHeader profile={profile} />
      <div className="app-main">
        {children}
      </div>
    </div>
  )
}
