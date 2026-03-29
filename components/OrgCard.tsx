'use client'

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
    <div style={{ marginTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text3)' }}>
          ვადა
        </span>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color }}>
          {days} დღე დარჩა
        </span>
      </div>
      <div style={{ height: '3px', background: 'var(--border2)', borderRadius: '2px' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px', transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

export default function OrgCard({ org }: { org: Organization }) {
  const days = getDaysRemaining(org.expires_at)
  const isExpired = !org.is_demo && !org.is_active

  return (
    <div style={{
      background: 'var(--surface)', border: `1px solid ${isExpired ? 'rgba(248,113,113,0.3)' : 'var(--border2)'}`,
      borderRadius: '16px', padding: '22px',
      opacity: isExpired ? 0.75 : 1,
      transition: 'all 0.2s',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Glow */}
      {!org.is_demo && org.is_active && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(74,222,128,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <div style={{ fontSize: '18px', marginBottom: '4px' }}>
            {org.is_demo ? '🔬' : '🏢'}
          </div>
          <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text)' }}>
            {org.name}
          </div>
        </div>
        <span className={`badge ${org.is_demo ? 'badge-demo' : isExpired ? 'badge-expired' : 'badge-active'}`}>
          {org.is_demo ? 'Demo' : isExpired ? 'ვადაგასული' : 'აქტიური'}
        </span>
      </div>

      {/* Demo info */}
      {org.is_demo && (
        <div style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: 1.6 }}>
          <div>✓ ფაილის ატვირთვა</div>
          <div style={{ color: 'var(--text3)' }}>✗ ექსპორტი (გათიშული)</div>
          <div style={{ color: 'var(--text3)' }}>✗ მხოლოდ 10 ჩანაწერი</div>
        </div>
      )}

      {/* Expired info */}
      {isExpired && (
        <div style={{ fontSize: '12px', color: 'var(--danger)', lineHeight: 1.6, marginBottom: '8px' }}>
          ვადა გაუვიდა. განახლებისთვის გადაიხადეთ 20 ₾ და მიმართეთ ადმინს.
        </div>
      )}

      {/* Countdown */}
      {!org.is_demo && org.is_active && days !== null && (
        <CountdownBar days={days} />
      )}

      {/* Action */}
      {org.is_active && (
        <Link
          href={`/dashboard/importer?org=${org.id}`}
          className="btn btn-primary btn-sm"
          style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}
        >
          {org.is_demo ? 'Demo-ს გახსნა' : 'იმპორტი →'}
        </Link>
      )}
    </div>
  )
}
