'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Organization } from '@/lib/types'

function getDaysRemaining(expiresAt: string | null): number | null {
  if (!expiresAt) return null
  const diff = new Date(expiresAt).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function CountdownBar({ days }: { days: number }) {
  const pct = Math.max(0, Math.min(100, (days / 365) * 100))
  const color = days > 60 ? 'var(--accent2)' : days > 30 ? 'var(--warn)' : 'var(--danger)'
  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          ვადა
        </span>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color }}>
          {days} დღე
        </span>
      </div>
      <div style={{ height: '2px', background: 'var(--border)', borderRadius: '2px' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: color, borderRadius: '2px',
          transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </div>
  )
}

export default function OrgCard({ org }: { org: Organization }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState(org.name)
  const [saving, setSaving] = useState(false)
  const [renameError, setRenameError] = useState('')

  const [days, setDays] = useState<number | null>(null)
  useEffect(() => {
    setDays(getDaysRemaining(org.expires_at))
  }, [org.expires_at])

  const isExpired = !org.is_demo && !org.is_active
  const isActive = !org.is_demo && org.is_active

  const borderColor = isExpired
    ? 'rgba(192,57,43,0.2)'
    : isActive
    ? 'rgba(26,122,74,0.18)'
    : 'var(--border)'

  async function saveRename() {
    const trimmed = draftName.trim()
    if (!trimmed || trimmed === org.name) { cancelEdit(); return }
    setSaving(true)
    setRenameError('')
    try {
      const res = await fetch('/api/organizations/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: org.id, name: trimmed }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'შეცდომა') }
      setEditing(false)
      router.refresh()
    } catch (e: unknown) {
      setRenameError(e instanceof Error ? e.message : 'შეცდომა')
    } finally {
      setSaving(false)
    }
  }

  function cancelEdit() {
    setEditing(false)
    setDraftName(org.name)
    setRenameError('')
  }

  return (
    <div
      className="org-card"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        opacity: isExpired ? 0.7 : 1,
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', position: 'relative' }}>
        <div style={{ flex: 1, minWidth: 0, marginRight: '10px' }}>
          <div style={{
            fontSize: '10px', fontFamily: 'DM Mono, monospace',
            color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em',
            marginBottom: '6px',
          }}>
            {org.is_demo ? 'Demo' : 'Org'}
          </div>

          {editing ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  autoFocus
                  value={draftName}
                  onChange={e => setDraftName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') cancelEdit() }}
                  disabled={saving}
                  style={{
                    flex: 1, background: 'var(--surface2)', border: '1px solid var(--accent)',
                    borderRadius: '6px', padding: '4px 8px', color: 'var(--text)',
                    fontWeight: 600, fontSize: '14px', outline: 'none',
                    boxShadow: '0 0 0 2px rgba(108,142,255,0.15)', minWidth: 0,
                  }}
                />
                <button
                  onClick={saveRename}
                  disabled={saving}
                  style={{
                    background: 'var(--accent)', border: 'none', borderRadius: '6px',
                    padding: '4px 10px', color: '#fff', fontSize: '12px', fontWeight: 500,
                    cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
                    flexShrink: 0,
                  }}
                >
                  {saving ? '…' : '✓'}
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={saving}
                  style={{
                    background: 'var(--surface2)', border: '1px solid var(--border2)',
                    borderRadius: '6px', padding: '4px 8px', color: 'var(--text2)',
                    fontSize: '12px', cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  ✕
                </button>
              </div>
              {renameError && (
                <div style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px' }}>{renameError}</div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text)', letterSpacing: '-0.2px' }}>
                {org.name}
              </div>
              <button
                onClick={() => { setDraftName(org.name); setEditing(true) }}
                title="სახელის შეცვლა"
                style={{
                  background: 'none', border: 'none', padding: '2px 5px',
                  cursor: 'pointer', color: 'var(--text3)', fontSize: '13px',
                  borderRadius: '4px', lineHeight: 1, flexShrink: 0,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text2)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}
              >
                ✎
              </button>
            </div>
          )}
        </div>
        <span className={`badge ${org.is_demo ? 'badge-demo' : isExpired ? 'badge-expired' : 'badge-active'}`}>
          {org.is_demo ? 'Demo' : isExpired ? 'ვადაგასული' : 'აქტიური'}
        </span>
      </div>

      {/* Demo feature list */}
      {org.is_demo && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
          {[
            { label: 'ფაილის ატვირთვა', ok: true },
            { label: 'ექსპორტი', ok: false },
            { label: 'მხოლოდ 10 ჩანაწერი', ok: false },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '4px', height: '4px', borderRadius: '50%',
                background: f.ok ? 'var(--accent2)' : 'var(--text3)',
                flexShrink: 0,
              }} />
              <span style={{ fontSize: '12px', color: f.ok ? 'var(--text2)' : 'var(--text3)' }}>
                {f.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Expired info */}
      {isExpired && (
        <p style={{ fontSize: '12px', color: 'var(--danger)', lineHeight: 1.6, marginBottom: '8px' }}>
          ვადა გაუვიდა. განახლებისთვის გადაიხადეთ 20 ₾.
        </p>
      )}

      {/* Countdown */}
      {isActive && days !== null && (
        <CountdownBar days={days} />
      )}

      {/* Action */}
      {org.is_active && (
        <Link
          href={`/dashboard/importer?org=${org.id}`}
          className="btn btn-primary btn-sm"
          style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}
        >
          {org.is_demo ? 'Demo-ს გახსნა' : 'იმპორტი →'}
        </Link>
      )}
    </div>
  )
}
