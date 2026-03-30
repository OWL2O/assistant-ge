'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateOrgForm() {
  const router = useRouter()
  const [name, setName]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function create() {
    if (!name.trim()) { setError('სახელი ცარიელია'); return }
    setLoading(true)
    setError('')

    const res = await fetch('/api/organizations/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    })

    const json = await res.json()
    if (!res.ok) { setError(json.error || 'შეცდომა'); setLoading(false); return }

    setName('')
    setLoading(false)
    router.refresh()
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px dashed var(--border2)',
      borderRadius: 'var(--radius-xl)', padding: '24px',
      display: 'flex', flexDirection: 'column', gap: '14px',
      justifyContent: 'center', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 0%, rgba(52,211,153,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div>
        <div style={{
          fontSize: '10px', fontFamily: 'DM Mono, monospace',
          color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.06em',
          marginBottom: '6px',
        }}>
          ახალი
        </div>
        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>
          ორგანიზაციის შექმნა
        </div>
      </div>

      <input
        className="input"
        placeholder="ორგანიზაციის სახელი..."
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && create()}
        style={{ fontSize: '14px', position: 'relative' }}
      />
      {error && <div style={{ fontSize: '12px', color: 'var(--danger)' }}>{error}</div>}
      <button
        className="btn btn-success btn-sm"
        onClick={create}
        disabled={loading}
        style={{ alignSelf: 'flex-start' }}
      >
        {loading ? 'იქმნება...' : '✓ შექმნა'}
      </button>
    </div>
  )
}
