'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს')
      return
    }
    if (password !== confirm) {
      setError('პაროლები არ ემთხვევა')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('შეცდომა. სცადეთ ხელახლა ან მოითხოვეთ ახალი ბმული.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="card fade-in">
      <h2 style={{
        fontFamily: 'Instrument Serif, serif', fontSize: '24px',
        marginBottom: '4px', letterSpacing: '-0.3px',
      }}>
        ახალი პაროლი
      </h2>
      <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '32px' }}>
        შეიყვანეთ და დაადასტურეთ ახალი პაროლი
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label htmlFor="reset-password" style={labelStyle}>ჩაწერეთ ახალი პაროლი</label>
          <input
            id="reset-password"
            className={`input ${error ? 'error' : ''}`}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoFocus
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <div>
          <label htmlFor="reset-confirm" style={labelStyle}>გაიმეორეთ პაროლი</label>
          <input
            id="reset-confirm"
            className={`input ${error ? 'error' : ''}`}
            type="password"
            placeholder="••••••••"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
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
          {loading ? 'ინახება...' : 'პაროლის შეცვლა'}
        </button>
      </form>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '12px', color: 'var(--text2)',
  marginBottom: '8px', fontFamily: 'DM Mono, monospace',
  textTransform: 'uppercase', letterSpacing: '0.04em',
}
