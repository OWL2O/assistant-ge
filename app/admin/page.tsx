import { createAdminClient } from '@/lib/supabase/admin'
import AdminUsersTable from '@/components/admin/AdminUsersTable'
import type { Organization, OrgRequest } from '@/lib/types'

export default async function AdminPage() {
  const admin = createAdminClient()

  // Fetch all tables separately (avoids FK relationship requirement)
  const [
    { data: rawProfiles },
    { data: organizations },
    { data: credits },
    { data: orgRequests },
  ] = await Promise.all([
    admin.from('profiles').select('*').order('created_at', { ascending: false }),
    admin.from('organizations').select('*'),
    admin.from('credits').select('*'),
    admin.from('org_requests').select('*'),
  ])

  // Merge relations into profiles manually
  const profiles = (rawProfiles ?? []).map(p => ({
    ...p,
    organizations: (organizations ?? []).filter(o => o.user_id === p.id) as Organization[],
    credits:       (credits ?? []).filter(c => c.user_id === p.id),
    org_requests:  (orgRequests ?? []).filter(r => r.user_id === p.id) as OrgRequest[],
  }))

  // Stats
  const totalUsers  = profiles.length
  const totalOrgs   = (organizations ?? []).filter(o => !o.is_demo).length
  const pendingReqs = (orgRequests ?? []).filter(r => r.status === 'pending').length
  const expiredOrgs = (organizations ?? []).filter(o => !o.is_demo && !o.is_active).length

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '28px', marginBottom: '6px' }}>
          ⚙ ადმინის პანელი
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text2)' }}>
          ASSISTANT.ge — მომხმარებლების მართვა
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="სულ მომხმარებელი" value={totalUsers} icon="👥" />
        <StatCard label="აქტიური ორგ." value={totalOrgs} icon="🏢" color="var(--accent2)" />
        <StatCard label="მოლოდინში" value={pendingReqs} icon="⏳" color="var(--warn)" />
        <StatCard label="ვადაგასული" value={expiredOrgs} icon="⚠" color="var(--danger)" />
      </div>

      {/* Users table */}
      <AdminUsersTable profiles={profiles} />
    </div>
  )
}

function StatCard({ label, value, icon, color = 'var(--accent)' }: {
  label: string; value: number; icon: string; color?: string
}) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border2)',
      borderRadius: '14px', padding: '20px 22px',
    }}>
      <div style={{ fontSize: '22px', marginBottom: '10px' }}>{icon}</div>
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '26px', fontWeight: 500, color, marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{label}</div>
    </div>
  )
}
