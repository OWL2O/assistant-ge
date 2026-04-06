'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Organization } from '@/lib/types'
import RenewOrgButton from './RenewOrgButton'

function getDaysRemaining(expiresAt: string | null): number | null {
  if (!expiresAt) return null
  const diff = new Date(expiresAt).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function CountdownBar({ days }: { days: number }) {
  const pct   = Math.max(0, Math.min(100, (days / 365) * 100))
  const color = days > 60 ? 'var(--accent2)' : days > 30 ? 'var(--warn)' : 'var(--danger)'
  return (
    <div style={{ width: '140px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{
          fontFamily: 'DM Mono, monospace', fontSize: '9px',
          color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          ვადა
        </span>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', color }}>
          {days}დ
        </span>
      </div>
      <div style={{ height: '1.5px', background: 'var(--border)', borderRadius: '2px' }}>
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
  const [editing, setEditing]       = useState(false)
  const [draftName, setDraftName]   = useState(org.name)
  const [saving, setSaving]         = useState(false)
  const [renameError, setRenameError] = useState('')
  const [days, setDays]             = useState<number | null>(null)

  useEffect(() => {
    setDays(getDaysRemaining(org.expires_at))
  }, [org.expires_at])

  const isExpired = !org.is_demo && !org.is_active
  const isActive  = !org.is_demo && org.is_active

  const borderColor = isExpired
    ? 'rgba(192,57,43,0.18)'
    : isActive
    ? 'rgba(26,122,74,0.15)'
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
      className="org-list-card"
      style={{
        borderColor,
        opacity: isExpired ? 0.65 : 1,
      }}
    >
      {/* ── Left: org info ── */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Type tag */}
        <div style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '9px',
          color: 'var(--text3)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: '8px',
        }}>
          {org.is_demo ? 'Demo' : 'Organization'}
        </div>

        {/* Name row */}
        {editing ? (
          <div style={{ marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                autoFocus
                value={draftName}
                onChange={e => setDraftName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') cancelEdit() }}
                disabled={saving}
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--accent)',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  color: 'var(--text)',
                  fontWeight: 600,
                  fontSize: '15px',
                  outline: 'none',
                  boxShadow: '0 0 0 2px rgba(45,91,227,0.12)',
                  minWidth: 0, flex: 1,
                }}
              />
              <button
                onClick={saveRename}
                disabled={saving}
                aria-label="სახელის შენახვა"
                style={{
                  background: 'var(--accent)', border: 'none', borderRadius: '4px',
                  padding: '5px 12px', color: '#fff', fontSize: '12px', fontWeight: 500,
                  cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, flexShrink: 0,
                }}
              >
                {saving ? '…' : '✓'}
              </button>
              <button
                onClick={cancelEdit}
                disabled={saving}
                aria-label="გაუქმება"
                style={{
                  background: 'transparent', border: '1px solid var(--border2)',
                  borderRadius: '4px', padding: '5px 10px', color: 'var(--text2)',
                  fontSize: '12px', cursor: 'pointer', flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>
            {renameError && (
              <div style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '5px' }}>{renameError}</div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{
              fontWeight: 600, fontSize: '15px',
              color: 'var(--text)', letterSpacing: '-0.2px',
            }}>
              {org.name}
            </span>
            <span className={`badge ${org.is_demo ? 'badge-demo' : isExpired ? 'badge-expired' : 'badge-active'}`}>
              {org.is_demo ? 'Demo' : isExpired ? 'ვადაგასული' : 'აქტიური'}
            </span>
            {!org.is_demo && (
              <button
                onClick={() => { setDraftName(org.name); setEditing(true) }}
                title="სახელის შეცვლა"
                aria-label="სახელის შეცვლა"
                style={{
                  background: 'none', border: 'none', padding: '2px 4px',
                  cursor: 'pointer', color: 'var(--text3)', fontSize: '12px',
                  borderRadius: '3px', lineHeight: 1, flexShrink: 0,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text2)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}
              >
                ✎
              </button>
            )}
          </div>
        )}

        {/* Demo features */}
        {org.is_demo && !editing && (
          <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
            {[
              { label: 'ფაილის ატვირთვა', ok: true },
              { label: 'ექსპორტი', ok: false },
              { label: '10 ჩანაწერი', ok: false },
            ].map(f => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{
                  width: '3px', height: '3px', borderRadius: '50%',
                  background: f.ok ? 'var(--accent2)' : 'var(--text3)',
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: '11px', color: f.ok ? 'var(--text3)' : 'var(--text3)', opacity: f.ok ? 1 : 0.6 }}>
                  {f.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Expired message */}
        {isExpired && !editing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
            <p style={{ fontSize: '12px', color: 'var(--danger)', opacity: 0.85, margin: 0 }}>
              ვადა გაუვიდა — განახლება 1 კრედიტი
            </p>
            <RenewOrgButton orgId={org.id} variant="primary" />
          </div>
        )}
      </div>

      {/* ── Right: countdown + hover action ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '12px',
        flexShrink: 0,
      }}>
        {isActive && days !== null && <CountdownBar days={days} />}
        {isActive && days !== null && days <= 30 && days > 0 && (
          <RenewOrgButton orgId={org.id} variant="ghost" />
        )}

        {org.is_active && (
          <Link
            href={`/dashboard/importer?org=${org.id}`}
            className="org-action"
            style={{
              fontSize: '13px',
              color: 'var(--accent)',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
              letterSpacing: '0.01em',
            }}
          >
            {org.is_demo ? 'Demo გახსნა' : 'გახსნა'} →
          </Link>
        )}
      </div>
    </div>
  )
}
