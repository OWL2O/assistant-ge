export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
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
    <div className="fade-in">
      {/* Page header */}
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{
          fontFamily: 'Instrument Serif, serif', fontSize: '30px',
          marginBottom: '6px', letterSpacing: '-0.4px',
        }}>
          ჩემი ორგანიზაციები
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text2)' }}>
          TBC ბანკის ამონაწერის იმპორტი FINS-ში
        </p>
      </div>

      {/* Admin shortcut */}
      {profile?.is_admin && (
        <div style={{
          background: 'rgba(45,91,227,0.05)',
          border: '1px solid rgba(45,91,227,0.15)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 20px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--accent)',
            }} />
            <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 500 }}>
              ადმინის პანელი
            </span>
          </div>
          <Link href="/admin" style={{
            fontSize: '12px', color: 'var(--accent)',
            fontFamily: 'DM Mono, monospace',
            background: 'rgba(45,91,227,0.08)',
            padding: '5px 14px', borderRadius: '20px',
            border: '1px solid rgba(45,91,227,0.2)',
          }}>
            გახსნა →
          </Link>
        </div>
      )}

      {/* Approval notification */}
      {hasApproval && (
        <div className="notification-banner notification-banner--success">
          <div className="notification-banner__icon" style={{ color: 'var(--accent2)' }}>✓</div>
          <div>
            <div className="notification-banner__title">
              ადმინმა დაამტკიცა თქვენი მოთხოვნა
            </div>
            <div className="notification-banner__body">
              შეგიძლიათ შექმნათ ახალი ორგანიზაცია ქვემოთ — {availableCredits} კრედიტი ხელმისაწვდომია
            </div>
          </div>
        </div>
      )}

      {/* Credit banner */}
      {!hasApproval && availableCredits > 0 && (
        <div className="notification-banner notification-banner--success">
          <div className="notification-banner__icon" style={{ color: 'var(--accent2)' }}>✓</div>
          <div>
            <div className="notification-banner__title">
              {availableCredits} კრედიტი ხელმისაწვდომია
            </div>
            <div className="notification-banner__body">
              შეგიძლიათ შექმნათ ახალი ორგანიზაცია ქვემოთ
            </div>
          </div>
        </div>
      )}

      {/* Orgs grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px', marginBottom: '40px',
      }}>
        {(orgs ?? []).map((org: Organization) => (
          <OrgCard key={org.id} org={org} />
        ))}
        {availableCredits > 0 && <CreateOrgForm />}
      </div>

      {/* Empty state */}
      {(orgs ?? []).length === 0 && (
        <div style={{
          textAlign: 'center', padding: '80px 20px',
          color: 'var(--text3)', fontFamily: 'DM Mono, monospace', fontSize: '12px',
          letterSpacing: '0.04em',
        }}>
          ORG_NOT_FOUND
        </div>
      )}

      {/* Request section */}
      <RequestSection hasPending={!!pendingReq} />
    </div>
  )
}
