'use client'

import { Fragment, useEffect, useState } from 'react'
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
  const dt = new Date(d)
  const dd = String(dt.getDate()).padStart(2, '0')
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${dt.getFullYear()}`
}

export default function AdminUsersTable({ profiles }: { profiles: ProfileWithRelations[] }) {
  const router = useRouter()
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [grantModal, setGrantModal] = useState<ProfileWithRelations | null>(null)
  const [nameModal, setNameModal]   = useState<{ profile: ProfileWithRelations; org: Organization } | null>(null)
  const [search, setSearch]         = useState('')
  const [reqLoading, setReqLoading] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [daysMap, setDaysMap] = useState<Record<string, number | null>>({})

  useEffect(() => {
    const map: Record<string, number | null> = {}
    for (const p of profiles) {
      for (const org of p.organizations) {
        map[org.id] = getDaysRemaining(org.expires_at)
      }
    }
    setDaysMap(map)
  }, [profiles])

  async function handleDeleteOrg(orgId: string, orgName: string) {
    if (!window.confirm(`წაიშალოს ორგანიზაცია "${orgName}"?`)) return
    setDeleteLoading(orgId)
    await fetch('/api/admin/delete-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId }),
    })
    setDeleteLoading(null)
    router.refresh()
  }

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
      {/* Search bar */}
      <div style={{
        display: 'flex', gap: '12px', alignItems: 'center',
        marginBottom: '16px',
      }}>
        <div style={{ position: 'relative', flex: '0 0 320px' }}>
          <input
            className="input"
            placeholder="მომხმარებლის ძებნა..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ fontSize: '13px', paddingLeft: '40px' }}
          />
          <div style={{
            position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text3)', fontSize: '14px', pointerEvents: 'none',
          }}>
            ⌕
          </div>
        </div>
        <div style={{
          fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text3)',
          padding: '6px 12px', background: 'var(--surface2)',
          border: '1px solid var(--border)', borderRadius: '20px',
        }}>
          {filtered.length} მომხმარებელი
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>მომხმარებელი</th>
              <th>რეგ. თარიღი</th>
              <th>ორგ. / კრედიტი</th>
              <th>სტატუსი</th>
              <th>მოთხოვნები</th>
              <th>მოქმედება</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(profile => {
              const paidOrgs    = profile.organizations.filter(o => !o.is_demo)
              const totalCreds  = profile.credits.reduce((s, c) => s + c.amount, 0)
              const available   = totalCreds - paidOrgs.length
              const pendingReqs = profile.org_requests.filter(r => r.status === 'pending')
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: 'rgba(45,91,227,0.1)',
                            border: '1px solid rgba(45,91,227,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: 600, color: 'var(--accent)',
                          }}>
                            {(profile.full_name || profile.email)[0].toUpperCase()}
                          </div>
                          {pendingReqs.length > 0 && (
                            <div style={{
                              position: 'absolute', top: '-2px', right: '-2px',
                              width: '8px', height: '8px', borderRadius: '50%',
                              background: 'var(--warn)',
                              border: '1.5px solid var(--surface)',
                            }} />
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '13px' }}>{profile.full_name || '—'}</div>
                          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text3)', marginTop: '1px' }}>
                            {profile.email}
                          </div>
                        </div>
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
                        {totalCreds === 0 && (
                          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text3)' }}>
                            0 კრედიტი
                          </span>
                        )}
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

                    {/* Requests */}
                    <td onClick={e => e.stopPropagation()}>
                      {pendingReqs.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span className="badge badge-pending">
                            {pendingReqs.length > 1 ? `${pendingReqs.length} მოლოდინში` : '● მოლოდინში'}
                          </span>
                          {pendingReqs.length === 1 && (
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleRequest(pendingReqs[0].id, 'approve')}
                                disabled={reqLoading === pendingReqs[0].id}
                                style={{ fontSize: '11px', padding: '3px 10px' }}
                              >
                                ✓ დამტ.
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleRequest(pendingReqs[0].id, 'reject')}
                                disabled={reqLoading === pendingReqs[0].id}
                                style={{ fontSize: '11px', padding: '3px 10px' }}
                              >
                                ✗ უარი
                              </button>
                            </div>
                          )}
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
                          style={{ padding: '6px 10px' }}
                        >
                          {isExpanded ? '▲' : '▼'}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded row */}
                  {isExpanded && (
                    <tr key={`${profile.id}-exp`}>
                      <td colSpan={6} style={{
                        background: 'var(--surface2)',
                        padding: '20px 24px',
                        borderTop: '1px solid var(--border)',
                      }}>
                        <div style={{
                          fontSize: '10px', color: 'var(--text3)', marginBottom: '12px',
                          fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>
                          ორგანიზაციები
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: pendingReqs.length > 0 ? '20px' : '0' }}>
                          {profile.organizations.map(org => {
                            const days = daysMap[org.id] ?? null
                            const dayColor = !days ? undefined : days > 60 ? 'var(--accent2)' : days > 30 ? 'var(--warn)' : 'var(--danger)'
                            return (
                              <div key={org.id} style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                background: 'var(--surface2)', borderRadius: 'var(--radius-sm)',
                                padding: '10px 14px', border: '1px solid var(--border)',
                              }}>
                                <div style={{
                                  width: '22px', height: '22px', borderRadius: '6px',
                                  background: org.is_demo ? 'rgba(180,83,9,0.08)' : 'rgba(26,122,74,0.08)',
                                  border: `1px solid ${org.is_demo ? 'rgba(180,83,9,0.2)' : 'rgba(26,122,74,0.2)'}`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontFamily: 'DM Mono, monospace', fontSize: '9px', fontWeight: 600,
                                  color: org.is_demo ? 'var(--warn)' : 'var(--accent2)',
                                  flexShrink: 0,
                                }}>
                                  {org.is_demo ? 'D' : 'O'}
                                </div>
                                <span style={{ flex: 1, fontWeight: 500, fontSize: '13px', color: 'var(--text)' }}>
                                  {org.name}
                                </span>
                                <span className={`badge ${org.is_demo ? 'badge-demo' : org.is_active ? 'badge-active' : 'badge-expired'}`}>
                                  {org.is_demo ? 'Demo' : org.is_active ? 'აქტიური' : 'ვადაგასული'}
                                </span>
                                {days !== null && (
                                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: dayColor }}>
                                    {days > 0 ? `${days}დ` : 'ვადაგ.'}
                                  </span>
                                )}
                                {org.expires_at && (
                                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text3)' }}>
                                    {fmtDate(org.expires_at)}
                                  </span>
                                )}
                                {!org.is_demo && (
                                  <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => setNameModal({ profile, org })}
                                    style={{ fontSize: '11px', padding: '3px 10px' }}
                                  >
                                    სახელი
                                  </button>
                                )}
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDeleteOrg(org.id, org.name)}
                                  disabled={deleteLoading === org.id}
                                  style={{ fontSize: '11px', padding: '3px 10px' }}
                                >
                                  წაშლა
                                </button>
                              </div>
                            )
                          })}
                          {profile.organizations.length === 0 && (
                            <div style={{ color: 'var(--text3)', fontSize: '12px', fontFamily: 'DM Mono, monospace' }}>
                              ORG_EMPTY
                            </div>
                          )}
                        </div>

                        {/* Pending requests */}
                        {pendingReqs.length > 0 && (
                          <div>
                            <div style={{
                              fontSize: '10px', color: 'var(--text3)', marginBottom: '10px',
                              fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em',
                            }}>
                              მოლოდინში მოთხოვნები ({pendingReqs.length})
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {pendingReqs.map(req => (
                                <div key={req.id} style={{
                                  padding: '14px 16px',
                                  background: 'rgba(180,83,9,0.05)',
                                  border: '1px solid rgba(180,83,9,0.15)',
                                  borderLeft: '3px solid var(--warn)',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '12px',
                                }}>
                                  {req.message && (
                                    <div style={{ color: 'var(--text2)', marginBottom: '12px', lineHeight: 1.6, fontStyle: 'italic' }}>
                                      &ldquo;{req.message}&rdquo;
                                    </div>
                                  )}
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                      className="btn btn-success btn-sm"
                                      onClick={() => handleRequest(req.id, 'approve')}
                                      disabled={reqLoading === req.id}
                                    >
                                      ✓ დამტკიცება (+1 კრედიტი)
                                    </button>
                                    <button
                                      className="btn btn-danger btn-sm"
                                      onClick={() => handleRequest(req.id, 'reject')}
                                      disabled={reqLoading === req.id}
                                    >
                                      ✗ უარყოფა
                                    </button>
                                  </div>
                                </div>
                              ))}
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

      {grantModal && (
        <GrantCreditModal
          profile={grantModal}
          onClose={() => { setGrantModal(null); router.refresh() }}
        />
      )}
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
  const [amount, setAmount]   = useState(1)
  const [note, setNote]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

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
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
          კრედიტი
        </div>
        <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '22px', letterSpacing: '-0.3px' }}>
          კრედიტის დამატება
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '6px' }}>
          {profile.full_name || profile.email}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={labelStyle}>კრედიტების რაოდენობა</label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setAmount(a => Math.max(1, a - 1))}
              style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center', borderRadius: '50%' }}
            >
              −
            </button>
            <span style={{
              fontFamily: 'DM Mono, monospace', fontSize: '28px',
              color: 'var(--accent)', minWidth: '48px', textAlign: 'center',
              fontWeight: 500,
            }}>
              {amount}
            </span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setAmount(a => a + 1)}
              style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center', borderRadius: '50%' }}
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label style={labelStyle}>შენიშვნა</label>
          <input
            className="input"
            placeholder="მაგ. გადახდა 20.01.2025"
            value={note}
            onChange={e => setNote(e.target.value)}
            style={{ fontSize: '13px' }}
          />
        </div>

        {error && (
          <div style={{ fontSize: '12px', color: 'var(--danger)', padding: '10px 14px', background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.15)', borderRadius: 'var(--radius-sm)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
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
function RenameOrgModal({ org, onClose }: { org: Organization; onClose: () => void }) {
  const [name, setName]       = useState(org.name)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

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
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
          გადარქმევა
        </div>
        <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '22px', letterSpacing: '-0.3px' }}>
          ორგანიზაციის სახელი
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
        {error && (
          <div style={{ fontSize: '12px', color: 'var(--danger)', padding: '10px 14px', background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.15)', borderRadius: 'var(--radius-sm)' }}>
            {error}
          </div>
        )}
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
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px', width: '100%', maxWidth: '420px',
          boxShadow: 'var(--shadow-xl)',
          animation: 'modalIn 0.25s cubic-bezier(0.4,0,0.2,1)',
          position: 'relative', overflow: 'hidden',
        }}
      >
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
