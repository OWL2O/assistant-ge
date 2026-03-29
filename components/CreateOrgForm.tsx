'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateOrgForm() {
  const router = useRouter()
  const [name, setName]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

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
      background: 'var(--surface)', border: '2px dashed var(--border2)',
      borderRadius: '16px', padding: '22px',
      display: 'flex', flexDirection: 'column', gap: '12px',
      justifyContent: 'center',
    }}>
      <div style={{ fontSize: '13px', color: 'var(--accent2)', fontWeight: 500 }}>
        + ახალი ორგანიზაცია
      </div>
      <input
        className="input"
        placeholder="ორგანიზაციის სახელი..."
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && create()}
        style={{ fontSize: '13px' }}
      />
      {error && <div style={{ fontSize: '12px', color: 'var(--danger)' }}>{error}</div>}
      <button
        className="btn btn-success btn-sm"
        onClick={create}
        disabled={loading}
      >
        {loading ? 'იქმნება...' : '✓ შექმნა'}
      </button>
    </div>
  )
}
