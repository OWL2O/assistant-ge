'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const origin = window.location.origin
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
    })

    setLoading(false)
    if (error) {
      setError('შეცდომა. სცადეთ მოგვიანებით.')
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="card fade-in">
        <div style={{
          textAlign: 'center', padding: '12px 0',
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'rgba(74,222,128,0.1)',
            border: '1px solid rgba(74,222,128,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: '20px',
          }}>
            ✓
          </div>
          <h2 style={{
            fontFamily: 'Instrument Serif, serif', fontSize: '22px',
            marginBottom: '10px', letterSpacing: '-0.3px',
          }}>
            შეამოწმეთ მეილი
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.7 }}>
            პაროლის აღდგენის ბმული გაიგზავნა{' '}
            <span style={{ color: 'var(--text)', fontWeight: 500 }}>{email}</span>-ზე.
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '12px' }}>
            მეილი არ მოვიდა? შეამოწმეთ სპამ-ფოლდერი.
          </p>
        </div>
        <div className="divider" style={{ margin: '28px 0' }} />
        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text3)' }}>
          <Link href="/auth/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>
            ← შესვლაზე დაბრუნება
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="card fade-in">
      <h2 style={{
        fontFamily: 'Instrument Serif, serif', fontSize: '24px',
        marginBottom: '4px', letterSpacing: '-0.3px',
      }}>
        პაროლის აღდგენა
      </h2>
      <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '32px' }}>
        შეიყვანეთ თქვენი მეილი და გამოგიგზავნით აღდგენის ბმულს
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={labelStyle}>ელ-ფოსტა</label>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>

        {error && (
          <div style={{
            fontSize: '13px', color: 'var(--danger)',
            padding: '12px 16px',
            background: 'rgba(192,57,43,0.06)',
            border: '1px solid rgba(192,57,43,0.15)',
            borderRadius: 'var(--radius-sm)',
          }}>
            {error}
          </div>
        )}

        <button
          className="btn btn-primary btn-lg"
          type="submit"
          disabled={loading}
          style={{ justifyContent: 'center', marginTop: '4px' }}
        >
          {loading ? 'იგზავნება...' : 'გაგზავნა'}
        </button>
      </form>

      <div className="divider" style={{ margin: '28px 0' }} />

      <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text3)' }}>
        <Link href="/auth/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>
          ← შესვლაზე დაბრუნება
        </Link>
      </p>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '12px', color: 'var(--text2)',
  marginBottom: '8px', fontFamily: 'DM Mono, monospace',
  textTransform: 'uppercase', letterSpacing: '0.04em',
}
