'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('მეილი ან პაროლი არასწორია')
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
        შესვლა
      </h2>
      <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '32px' }}>
        სისტემაში შესასვლელად შეიყვანეთ თქვენი მონაცემები
      </p>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={labelStyle}>ელ-ფოსტა</label>
          <input
            className={`input ${error ? 'error' : ''}`}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div>
          <label style={labelStyle}>პაროლი</label>
          <input
            className={`input ${error ? 'error' : ''}`}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <div style={{
            fontSize: '13px', color: 'var(--danger)',
            padding: '12px 16px',
            background: 'rgba(251,113,133,0.06)',
            border: '1px solid rgba(251,113,133,0.15)',
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
          {loading ? 'შესვლა...' : 'შესვლა'}
        </button>
      </form>

      <div className="divider" style={{ margin: '28px 0' }} />

      <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text3)' }}>
        ანგარიში არ გაქვთ?{' '}
        <Link href="/auth/register" style={{ color: 'var(--accent)', fontWeight: 500 }}>
          რეგისტრაცია
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
