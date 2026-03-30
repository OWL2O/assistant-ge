'use client'

import { useEffect, useRef, useState } from 'react'

export default function RequestOrgButton({ hasPending: _hasPending }: { hasPending: boolean }) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError]     = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  async function sendRequest() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/org-requests/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error || 'შეცდომა')
      setLoading(false)
      return
    }
    setSent(true)
    setLoading(false)
    timerRef.current = setTimeout(() => {
      setSent(false)
      setMessage('')
    }, 4000)
  }

  if (sent) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 20px',
        background: 'rgba(52,211,153,0.06)',
        border: '1px solid rgba(52,211,153,0.2)',
        borderRadius: 'var(--radius-md)',
        fontSize: '14px', color: 'var(--accent2)',
        animation: 'fadeIn 0.3s ease',
      }}>
        <div style={{
          width: '20px', height: '20px', borderRadius: '50%',
          background: 'rgba(52,211,153,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', flexShrink: 0,
        }}>✓</div>
        <span>მოთხოვნა გაგზავნილია</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <textarea
        className="input"
        rows={2}
        placeholder="სურვილის შემთხვევაში დამატებითი შენიშვნა..."
        value={message}
        onChange={e => setMessage(e.target.value)}
        style={{ resize: 'vertical', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' }}
      />
      {error && (
        <div style={{
          fontSize: '13px', color: 'var(--danger)',
          padding: '10px 14px',
          background: 'rgba(251,113,133,0.06)',
          border: '1px solid rgba(251,113,133,0.15)',
          borderRadius: 'var(--radius-sm)',
        }}>
          {error}
        </div>
      )}
      <button
        className="btn btn-primary"
        onClick={sendRequest}
        disabled={loading}
        style={{ alignSelf: 'flex-start' }}
      >
        {loading ? 'იგზავნება...' : 'მოთხოვნის გაგზავნა'}
      </button>
    </div>
  )
}
