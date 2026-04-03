'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const EMAILS_KEY = 'assistants_saved_emails'

function saveEmail(email: string) {
  try {
    const saved: string[] = JSON.parse(localStorage.getItem(EMAILS_KEY) || '[]')
    const updated = [email, ...saved.filter(e => e !== email)].slice(0, 10)
    localStorage.setItem(EMAILS_KEY, JSON.stringify(updated))
  } catch {}
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [savedEmails, setSavedEmails] = useState<string[]>([])

  useEffect(() => {
    try {
      const saved: string[] = JSON.parse(localStorage.getItem(EMAILS_KEY) || '[]')
      setSavedEmails(saved)
    } catch {}
  }, [])

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

    saveEmail(email)
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
            list="saved-emails-list"
            required
            autoFocus
          />
          <datalist id="saved-emails-list">
            {savedEmails.map(e => <option key={e} value={e} />)}
          </datalist>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>პაროლი</label>
            <Link href="/auth/forgot-password" style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>
              დამავიწყდა პაროლი?
            </Link>
          </div>
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
