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
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="card-glow" />

      <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '22px', marginBottom: '6px' }}>
        შესვლა
      </h2>
      <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '28px' }}>
        სისტემაში შესასვლელად შეიყვანეთ თქვენი მონაცემები
      </p>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '6px', fontFamily: 'DM Mono, monospace' }}>
            ელ-ფოსტა
          </label>
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
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '6px', fontFamily: 'DM Mono, monospace' }}>
            პაროლი
          </label>
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
          <div style={{ fontSize: '13px', color: 'var(--danger)', padding: '10px 14px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <button
          className="btn btn-primary"
          type="submit"
          disabled={loading}
          style={{ marginTop: '8px', justifyContent: 'center' }}
        >
          {loading ? 'შესვლა...' : 'შესვლა →'}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text3)', marginTop: '24px' }}>
        ანგარიში არ გაქვთ?{' '}
        <Link href="/auth/register" style={{ color: 'var(--accent)' }}>
          რეგისტრაცია
        </Link>
      </p>
    </div>
  )
}
