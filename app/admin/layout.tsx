import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import DashboardHeader from '@/components/DashboardHeader'

export const metadata: Metadata = {
  title: 'ადმინის პანელი',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles').select('*').eq('id', user.id).single()

  if (!profile?.is_admin) redirect('/dashboard')

  return (
    <div className="app-shell">
      <DashboardHeader profile={profile} />
      <div className="app-main" style={{ background: 'var(--bg)' }}>
        <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 32px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
