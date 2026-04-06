'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  orgId: string
  /** Visual style: "ghost" for active orgs, "primary" for expired. */
  variant?: 'ghost' | 'primary'
}

export default function RenewOrgButton({ orgId, variant = 'primary' }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [success, setSuccess] = useState(false)

  // Clear the success flash after 2.5s
  useEffect(() => {
    if (!success) return
    const t = setTimeout(() => setSuccess(false), 2500)
    return () => clearTimeout(t)
  }, [success])

  async function renew() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/organizations/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'განახლება ვერ მოხერხდა')
      setConfirming(false)
      setSuccess(true)
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'შეცდომა')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 12px',
          borderRadius: '4px',
          background: 'rgba(74,222,128,0.12)',
          border: '1px solid rgba(74,222,128,0.25)',
          color: 'var(--accent2)',
          fontSize: '12px',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          animation: 'fade-in 0.3s ease',
        }}
      >
        ✓ განახლდა
      </div>
    )
  }

  if (!confirming) {
    return (
      <button
        className={variant === 'primary' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
        onClick={() => setConfirming(true)}
        style={{ fontSize: '12px', padding: '5px 12px', whiteSpace: 'nowrap' }}
      >
        ↻ განახლება
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--text2)', marginRight: '4px' }}>
          1 კრედიტი?
        </span>
        <button
          className="btn btn-success btn-sm"
          onClick={renew}
          disabled={loading}
          aria-label="განახლების დადასტურება"
          style={{ fontSize: '11px', padding: '4px 10px' }}
        >
          {loading ? '…' : '✓ დიახ'}
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => { setConfirming(false); setError(null) }}
          disabled={loading}
          aria-label="გაუქმება"
          style={{ fontSize: '11px', padding: '4px 10px' }}
        >
          ✕
        </button>
      </div>
      {error && (
        <span role="alert" style={{ fontSize: '10px', color: 'var(--danger)' }}>{error}</span>
      )}
    </div>
  )
}
