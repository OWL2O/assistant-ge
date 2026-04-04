export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import OrgCard from '@/components/OrgCard'
import RequestSection from '@/components/RequestSection'
import CreateOrgForm from '@/components/CreateOrgForm'
import type { Organization } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()

  const [
    { data: orgs },
    { data: creditsData },
    { data: pendingReq },
    { data: approvedRequests },
    { data: profile },
  ] = await Promise.all([
    admin.from('organizations').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
    admin.from('credits').select('amount').eq('user_id', user.id),
    admin.from('org_requests').select('id').eq('user_id', user.id).eq('status', 'pending').maybeSingle(),
    admin.from('org_requests').select('id').eq('user_id', user.id).eq('status', 'approved'),
    admin.from('profiles').select('is_admin').eq('id', user.id).single(),
  ])

  const totalCredits     = creditsData?.reduce((s, c) => s + c.amount, 0) ?? 0
  const paidOrgs         = (orgs ?? []).filter(o => !o.is_demo).length
  const availableCredits = totalCredits - paidOrgs
  const hasApproval      = (approvedRequests?.length ?? 0) > 0 && availableCredits > 0

  return (
    <div className="fade-in" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 32px' }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontFamily: 'Instrument Serif, serif',
            fontSize: '26px',
            color: 'var(--text)',
            letterSpacing: '-0.4px',
            marginBottom: '6px',
          }}>
            ჩემი ორგანიზაციები
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text3)' }}>
            TBC და BOG ბანკების ამონაწერების იმპორტი FINS-ში
          </p>
        </div>

        {/* ── Notifications ── */}
        {hasApproval && (
          <div className="notification-banner notification-banner--success">
            <div className="notification-banner__icon" style={{ color: 'var(--accent2)' }}>✓</div>
            <div>
              <div className="notification-banner__title">ადმინმა დაამტკიცა თქვენი მოთხოვნა</div>
              <div className="notification-banner__body">
                შეგიძლიათ შექმნათ ახალი ორგანიზაცია ქვემოთ — {availableCredits} კრედიტი ხელმისაწვდომია
              </div>
            </div>
          </div>
        )}

        {!hasApproval && availableCredits > 0 && (
          <div className="notification-banner notification-banner--success">
            <div className="notification-banner__icon" style={{ color: 'var(--accent2)' }}>✓</div>
            <div>
              <div className="notification-banner__title">{availableCredits} კრედიტი ხელმისაწვდომია</div>
              <div className="notification-banner__body">შეგიძლიათ შექმნათ ახალი ორგანიზაცია ქვემოთ</div>
            </div>
          </div>
        )}

        {/* ── Section label ── */}
        {((orgs ?? []).length > 0 || availableCredits > 0) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <span style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '10px',
              color: 'var(--text3)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              {(orgs ?? []).length} ORG{(orgs ?? []).length !== 1 ? 'S' : ''}
            </span>
          </div>
        )}

        {/* ── Org list ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '40px' }}>
          {(orgs ?? []).map((org: Organization) => (
            <OrgCard key={org.id} org={org} />
          ))}
          {availableCredits > 0 && <CreateOrgForm />}
        </div>

        {/* ── Empty state ── */}
        {(orgs ?? []).length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: 'var(--text3)',
            fontFamily: 'DM Mono, monospace',
            fontSize: '11px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            ORG_NOT_FOUND
          </div>
        )}

        {/* ── Request section ── */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '32px' }}>
          <RequestSection hasPending={!!pendingReq} />
        </div>

      </div>
    </div>
  )
}
