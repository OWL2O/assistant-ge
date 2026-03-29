'use client'

import { Fragment, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Organization, OrgRequest } from '@/lib/types'

type ProfileWithRelations = {
  id: string
  email: string
  full_name: string | null
  is_admin: boolean
  created_at: string
  organizations: Organization[]
  credits: { amount: number; created_at: string }[]
  org_requests: OrgRequest[]
}

function getDaysRemaining(expiresAt: string | null): number | null {
  if (!expiresAt) return null
  return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000)
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('ka-GE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function AdminUsersTable({ profiles }: { profiles: ProfileWithRelations[] }) {
  const router = useRouter()
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [grantModal, setGrantModal] = useState<ProfileWithRelations | null>(null)
  const [nameModal, setNameModal]  = useState<{ profile: ProfileWithRelations; org: Organization } | null>(null)
  const [search, setSearch]        = useState('')
  const [reqLoading, setReqLoading] = useState<string | null>(null)

  async function handleRequest(requestId: string, action: 'approve' | 'reject') {
    setReqLoading(requestId)
    const res = await fetch('/api/admin/approve-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, action }),
    })
    setReqLoading(null)
    if (res.ok) router.refresh()
  }

  const filtered = profiles.filter(p =>
    !p.is_admin &&
    (p.email.toLowerCase().includes(search.toLowerCase()) ||
     (p.full_name ?? '').toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      {/* Search */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input
          className="input"
          placeholder="მომხმარებლის ძებნა..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '320px', fontSize: '13px' }}
        />
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text3)' }}>
          {filtered.length} მომხმარებელი
        </span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>მომხმარებელი</th>
              <th>რეგისტრაცია</th>
              <th>ორგ. / კრედიტი</th>
              <th>სტატუსი</th>
              <th>მოთხოვნა</th>
              <th>მოქმედება</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(profile => {
              const paidOrgs    = profile.organizations.filter(o => !o.is_demo)
              const totalCreds  = profile.credits.reduce((s, c) => s + c.amount, 0)
              const available   = totalCreds - paidOrgs.length
              const pendingReq  = profile.org_requests.find(r => r.status === 'pending')
              const activeOrgs  = paidOrgs.filter(o => o.is_active)
              const expiredOrgs = paidOrgs.filter(o => !o.is_active)
              const isExpanded  = expanded === profile.id

              return (
                <Fragment key={profile.id}>
                  <tr
                    style={{ cursor: 'pointer' }}
                    onClick={() => setExpanded(isExpanded ? null : profile.id)}
                  >
                    {/* User */}
                    <td className="primary">
                      <div style={{ fontWeight: 500 }}>{profile.full_name || '—'}</div>
                      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>
                        {profile.email}
                      </div>
                    </td>

                    {/* Date */}
                    <td>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px' }}>
                        {fmtDate(profile.created_at)}
                      </span>
                    </td>

                    {/* Orgs / Credits */}
                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className="badge badge-active">{activeOrgs.length} აქტ.</span>
                        {expiredOrgs.length > 0 && <span className="badge badge-expired">{expiredOrgs.length} ვადაგ.</span>}
                        {available > 0 && <span className="badge badge-pending">{available} კრედ.</span>}
                        {totalCreds === 0 && <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text3)' }}>კრედიტი 0</span>}
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      {activeOrgs.length > 0 ? (
                        <span className="badge badge-active">● აქტიური</span>
                      ) : (
                        <span className="badge badge-demo">Demo</span>
                      )}
                    </td>

                    {/* Request */}
                    <td onClick={e => e.stopPropagation()}>
                      {pendingReq ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span className="badge badge-pending">⏳ მოლოდინში</span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleRequest(pendingReq.id, 'approve')}
                              disabled={reqLoading === pendingReq.id}
                              style={{ fontSize: '11px', padding: '3px 8px' }}
                            >
                              ✓ დამტ.
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRequest(pendingReq.id, 'reject')}
                              disabled={reqLoading === pendingReq.id}
                              style={{ fontSize: '11px', padding: '3px 8px' }}
                            >
                              ✗ უარი
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text3)', fontSize: '12px' }}>—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => setGrantModal(profile)}
                        >
                          + კრედიტი
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setExpanded(isExpanded ? null : profile.id)}
                        >
                          {isExpanded ? '▲' : '▼'}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded orgs row */}
                  {isExpanded && (
                    <tr key={`${profile.id}-exp`}>
                      <td colSpan={6} style={{ background: 'rgba(108,142,255,0.03)', padding: '16px 20px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '10px', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          ორგანიზაციები
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {profile.organizations.map(org => {
                            const days = getDaysRemaining(org.expires_at)
                            const dayColor = !days ? undefined : days > 60 ? 'var(--accent2)' : days > 30 ? 'var(--warn)' : 'var(--danger)'
                            return (
                              <div key={org.id} style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                background: 'var(--surface2)', borderRadius: '8px',
                                padding: '10px 14px', border: '1px solid var(--border)',
                              }}>
                                <span style={{ fontSize: '16px' }}>{org.is_demo ? '🔬' : '🏢'}</span>
                                <span style={{ flex: 1, fontWeight: 500, fontSize: '13px', color: 'var(--text)' }}>{org.name}</span>
                                <span className={`badge ${org.is_demo ? 'badge-demo' : org.is_active ? 'badge-active' : 'badge-expired'}`}>
                                  {org.is_demo ? 'Demo' : org.is_active ? 'აქტიური' : 'ვადაგასული'}
                                </span>
                                {days !== null && (
                                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: dayColor }}>
                                    {days > 0 ? `${days}დ` : 'ვადაგასული'}
                                  </span>
                                )}
                                {org.expires_at && (
                                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text3)' }}>
                                    → {fmtDate(org.expires_at)}
                                  </span>
                                )}
                                {!org.is_demo && (
                                  <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => setNameModal({ profile, org })}
                                    style={{ fontSize: '11px', padding: '3px 8px' }}
                                  >
                                    ✏ სახელი
                                  </button>
                                )}
                              </div>
                            )
                          })}
                          {profile.organizations.length === 0 && (
                            <div style={{ color: 'var(--text3)', fontSize: '12px' }}>ორგანიზაცია არ არის</div>
                          )}
                        </div>

                        {/* Request message */}
                        {pendingReq && (
                          <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '8px', fontSize: '12px' }}>
                            {pendingReq.message && (
                              <div style={{ color: 'var(--warn)', marginBottom: '8px' }}>
                                💬 {pendingReq.message}
                              </div>
                            )}
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleRequest(pendingReq.id, 'approve')}
                                disabled={reqLoading === pendingReq.id}
                              >
                                ✓ დამტკიცება (+1 კრედიტი)
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleRequest(pendingReq.id, 'reject')}
                                disabled={reqLoading === pendingReq.id}
                              >
                                ✗ უარყოფა
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Grant credit modal */}
      {grantModal && (
        <GrantCreditModal
          profile={grantModal}
          onClose={() => { setGrantModal(null); router.refresh() }}
        />
      )}

      {/* Rename org modal */}
      {nameModal && (
        <RenameOrgModal
          org={nameModal.org}
          onClose={() => { setNameModal(null); router.refresh() }}
        />
      )}
    </div>
  )
}

// ─── GRANT CREDIT MODAL ──────────────────────────────────────
function GrantCreditModal({ profile, onClose }: { profile: ProfileWithRelations; onClose: () => void }) {
  const [amount, setAmount] = useState(1)
  const [note, setNote]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  async function grant() {
    setLoading(true); setError('')
    const res = await fetch('/api/admin/grant-credit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId: profile.id, amount, note }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error || 'შეცდომა'); setLoading(false); return }
    onClose()
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '20px', marginBottom: '6px' }}>
        + კრედიტის დამატება
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '24px' }}>
        <b style={{ color: 'var(--text)' }}>{profile.full_name || profile.email}</b>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={labelStyle}>კრედიტების რაოდენობა</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setAmount(a => Math.max(1, a - 1))}>−</button>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '22px', color: 'var(--accent)', minWidth: '40px', textAlign: 'center' }}>{amount}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setAmount(a => a + 1)}>+</button>
          </div>
        </div>

        <div>
          <label style={labelStyle}>შენიშვნა (სურვილისამებრ)</label>
          <input
            className="input"
            placeholder="მაგ. გადახდა 20.01.2025"
            value={note}
            onChange={e => setNote(e.target.value)}
            style={{ fontSize: '13px' }}
          />
        </div>

        {error && <div style={{ fontSize: '12px', color: 'var(--danger)' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>გაუქმება</button>
          <button className="btn btn-success btn-sm" onClick={grant} disabled={loading}>
            {loading ? 'მიმდინარეობს...' : `✓ ${amount} კრედიტის დამატება`}
          </button>
        </div>
      </div>
    </ModalOverlay>
  )
}

// ─── RENAME ORG MODAL ────────────────────────────────────────
function RenameOrgModal({ org, onClose }: {
  org: Organization; onClose: () => void
}) {
  const [name, setName]     = useState(org.name)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  async function rename() {
    if (!name.trim()) { setError('სახელი ცარიელია'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/admin/rename-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId: org.id, name: name.trim() }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error); setLoading(false); return }
    onClose()
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '20px', marginBottom: '24px' }}>
        ✏ ორგანიზაციის გადარქმევა
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={labelStyle}>ახალი სახელი</label>
          <input
            className="input"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && rename()}
            autoFocus
          />
        </div>
        {error && <div style={{ fontSize: '12px', color: 'var(--danger)' }}>{error}</div>}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>გაუქმება</button>
          <button className="btn btn-primary btn-sm" onClick={rename} disabled={loading}>
            {loading ? 'ინახება...' : '✓ შენახვა'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  )
}

// ─── MODAL OVERLAY ───────────────────────────────────────────
function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(4px)', zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border2)',
        borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px',
      }}>
        {children}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', color: 'var(--text3)',
  fontFamily: 'DM Mono, monospace', textTransform: 'uppercase',
  letterSpacing: '0.06em', marginBottom: '8px',
}
