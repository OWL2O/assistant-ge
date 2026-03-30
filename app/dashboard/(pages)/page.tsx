import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import OrgCard from '@/components/OrgCard'
import RequestOrgButton from '@/components/RequestOrgButton'
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
          background: 'rgba(129,140,248,0.05)',
          border: '1px solid rgba(129,140,248,0.15)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 20px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--accent)',
              boxShadow: '0 0 6px var(--accent)',
            }} />
            <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 500 }}>
              ადმინის პანელი
            </span>
          </div>
          <Link href="/admin" style={{
            fontSize: '12px', color: 'var(--accent)',
            fontFamily: 'DM Mono, monospace',
            background: 'rgba(129,140,248,0.1)',
            padding: '5px 14px', borderRadius: '20px',
            border: '1px solid rgba(129,140,248,0.2)',
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
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(129,140,248,0.15), transparent)',
        }} />

        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontSize: '10px', fontFamily: 'DM Mono, monospace',
            color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em',
            marginBottom: '8px',
          }}>
            მოთხოვნა
          </div>
          <h2 style={{
            fontFamily: 'Instrument Serif, serif', fontSize: '22px',
            letterSpacing: '-0.3px', marginBottom: '10px',
          }}>
            ახალი ორგანიზაციის მოთხოვნა
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.7, maxWidth: '540px' }}>
            ახალი ორგანიზაციის გასახსნელად საჭიროა{' '}
            <span style={{ color: 'var(--text)', fontWeight: 600 }}>100 ₾</span>-ის გადახდა
            და ადმინის დამტკიცება.
          </p>
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '8px 16px', borderRadius: 'var(--radius-sm)',
          background: 'var(--surface2)', border: '1px solid var(--border)',
          marginBottom: '24px',
        }}>
          <div style={{
            width: '4px', height: '4px', borderRadius: '50%',
            background: 'var(--text3)',
          }} />
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text3)' }}>
            გადახდა:{' '}
          </span>
          <a
            href="tel:+995555404157"
            style={{
              fontFamily: 'DM Mono, monospace', fontSize: '12px',
              color: 'var(--text2)', letterSpacing: '0.04em',
            }}
          >
            +995 555 40 41 57
          </a>
        </div>

        {pendingReq && (
          <div className="notification-banner notification-banner--info" style={{ marginBottom: '20px' }}>
            <div className="notification-banner__icon" style={{ color: 'var(--accent)' }}>i</div>
            <div>
              <div className="notification-banner__body">
                გაქვთ განხილვის პროცესში მყოფი მოთხოვნა. შეგიძლიათ გააგზავნოთ კიდევ ერთი.
              </div>
            </div>
          </div>
        )}

        <RequestOrgButton hasPending={false} />
      </div>
    </div>
  )
}
