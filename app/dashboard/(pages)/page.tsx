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

  // Use admin client to bypass RLS issues
  const admin = createAdminClient()

  const { data: orgs } = await admin
    .from('organizations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const { data: creditsData } = await admin
    .from('credits')
    .select('amount')
    .eq('user_id', user.id)

  const totalCredits = creditsData?.reduce((s, c) => s + c.amount, 0) ?? 0
  const paidOrgs = (orgs ?? []).filter(o => !o.is_demo).length
  const availableCredits = totalCredits - paidOrgs

  const { data: pendingReq } = await admin
    .from('org_requests')
    .select('id, message')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .maybeSingle()

  // Check if admin
  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '28px', marginBottom: '6px' }}>
          ჩემი ორგანიზაციები
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text2)' }}>
          TBC ბანკის ამონაწერის იმპორტი FINS-ში
        </p>
      </div>

      {/* Admin shortcut */}
      {profile?.is_admin && (
        <div style={{
          background: 'rgba(108,142,255,0.07)', border: '1px solid rgba(108,142,255,0.2)',
          borderRadius: '12px', padding: '14px 20px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '13px', color: 'var(--accent)' }}>⚙ ადმინის პანელი</span>
          <Link href="/admin" style={{
            fontSize: '12px', color: 'var(--accent)', fontFamily: 'DM Mono, monospace',
            textDecoration: 'none', background: 'rgba(108,142,255,0.12)',
            padding: '5px 12px', borderRadius: '7px', border: '1px solid rgba(108,142,255,0.25)',
          }}>
            გახსნა →
          </Link>
        </div>
      )}

      {/* Credit banner */}
      {availableCredits > 0 && (
        <div style={{
          background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.2)',
          borderRadius: '12px', padding: '16px 20px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
        }}>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--accent2)', fontWeight: 500 }}>
              🎉 თქვენ გაქვთ {availableCredits} ახალი ორგანიზაციის კრედიტი
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '2px' }}>
              შეგიძლიათ შექმნათ ახალი ორგანიზაცია ქვემოთ
            </div>
          </div>
        </div>
      )}

      {/* Orgs grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {(orgs ?? []).map((org: Organization) => (
          <OrgCard key={org.id} org={org} />
        ))}
        {availableCredits > 0 && (
          <AddOrgCard />
        )}
      </div>

      {/* Empty state */}
      {(orgs ?? []).length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          color: 'var(--text3)', fontFamily: 'DM Mono, monospace', fontSize: '12px',
        }}>
          ორგანიზაცია არ მოიძებნა
        </div>
      )}

      {/* Request section */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border2)',
        borderRadius: '16px', padding: '28px', marginTop: '32px',
      }}>
        <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '18px', marginBottom: '8px' }}>
          ახალი ორგანიზაციის მოთხოვნა
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '20px', lineHeight: 1.7 }}>
          ახალი ორგანიზაციის გასახსნელად საჭიროა <b style={{ color: 'var(--text)' }}>100 ₾</b>-ის გადახდა
          და ადმინის დამტკიცება. მოთხოვნის გაგზავნის შემდეგ ადმინი
          დაამტკიცებს და კრედიტს დაამატებს თქვენს ანგარიშზე.
        </p>
        <RequestOrgButton hasPending={!!pendingReq} />
      </div>
    </div>
  )
}

function AddOrgCard() {
  return <CreateOrgForm />
}