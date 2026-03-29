'use client'

import { useState } from 'react'

export default function RequestOrgButton({ hasPending }: { hasPending: boolean }) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(hasPending)
  const [message, setMessage] = useState('')
  const [error, setError]     = useState('')

  async function sendRequest() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/org-requests/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error || 'შეცდომა'); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 16px', background: 'rgba(108,142,255,0.08)',
        border: '1px solid rgba(108,142,255,0.25)', borderRadius: '10px',
        fontSize: '13px', color: 'var(--accent)',
      }}>
        <span>⏳</span>
        <span>მოთხოვნა გაგზავნილია — ადმინი განიხილავს</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <textarea
        className="input"
        rows={2}
        placeholder="სურვილის შემთხვევაში დამატებითი შენიშვნა (არ არის სავალდებულო)..."
        value={message}
        onChange={e => setMessage(e.target.value)}
        style={{ resize: 'vertical', fontFamily: 'DM Sans, sans-serif' }}
      />
      {error && <div style={{ fontSize: '12px', color: 'var(--danger)' }}>{error}</div>}
      <button
        className="btn btn-primary"
        onClick={sendRequest}
        disabled={loading}
        style={{ alignSelf: 'flex-start' }}
      >
        {loading ? 'იგზავნება...' : '📨 მოთხოვნის გაგზავნა'}
      </button>
    </div>
  )
}
