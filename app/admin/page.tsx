import { createAdminClient } from '@/lib/supabase/admin'
import AdminUsersTable from '@/components/admin/AdminUsersTable'
import type { Organization, OrgRequest } from '@/lib/types'

export default async function AdminPage() {
  const admin = createAdminClient()

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

  const profiles = (rawProfiles ?? []).map(p => ({
    ...p,
    organizations: (organizations ?? []).filter(o => o.user_id === p.id) as Organization[],
    credits:       (credits ?? []).filter(c => c.user_id === p.id),
    org_requests:  (orgRequests ?? []).filter(r => r.user_id === p.id) as OrgRequest[],
  }))

  const totalUsers  = profiles.length
  const totalOrgs   = (organizations ?? []).filter(o => !o.is_demo).length
  const pendingReqs = (orgRequests ?? []).filter(r => r.status === 'pending').length
  const expiredOrgs = (organizations ?? []).filter(o => !o.is_demo && !o.is_active).length

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{
          fontSize: '10px', fontFamily: 'DM Mono, monospace',
          color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em',
          marginBottom: '8px',
        }}>
          პანელი
        </div>
        <h1 style={{
          fontFamily: 'Instrument Serif, serif', fontSize: '30px',
          marginBottom: '6px', letterSpacing: '-0.4px',
        }}>
          ადმინის პანელი
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text2)' }}>
          ASSISTANT.ge — მომხმარებლების მართვა
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '36px' }}>
        <StatCard label="მომხმარებელი" value={totalUsers} color="var(--accent)" />
        <StatCard label="აქტიური ორგ." value={totalOrgs} color="var(--accent2)" />
        <StatCard label="მოლოდინში" value={pendingReqs} color="var(--warn)" />
        <StatCard label="ვადაგასული" value={expiredOrgs} color="var(--danger)" />
      </div>

      {/* Table */}
      <AdminUsersTable profiles={profiles} />
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="stat-card">
      <div className="stat-card__value" style={{ color }}>{value}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  )
}
