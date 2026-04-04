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
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [savedEmails, setSavedEmails] = useState<string[]>([])
  const [showPw, setShowPw]           = useState(false)

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
    <div className="fade-in">

      {/* Heading */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{
          fontFamily: 'Instrument Serif, serif',
          fontSize: '28px', letterSpacing: '-0.5px',
          color: 'var(--text)', marginBottom: '8px',
        }}>
          შესვლა
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text3)', lineHeight: 1.6 }}>
          სისტემაში შესასვლელად შეიყვანეთ თქვენი მონაცემები
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* Email */}
        <div>
          <label style={labelStyle}>ელ-ფოსტა</label>
          <input
            className={`input-line ${error ? 'error' : ''}`}
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

        {/* Password */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>პაროლი</label>
            <Link href="/auth/forgot-password" style={{
              fontSize: '11px', color: 'var(--text3)',
              fontFamily: 'DM Mono, monospace',
              letterSpacing: '0.02em',
              transition: 'color 0.15s',
            }}>
              დამავიწყდა
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              className={`input-line ${error ? 'error' : ''}`}
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ paddingRight: '36px' }}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              style={{
                position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text3)', fontSize: '15px', lineHeight: 1, padding: '2px',
              }}
              tabIndex={-1}
              aria-label={showPw ? 'პაროლის დამალვა' : 'პაროლის ჩვენება'}
            >
              {showPw ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            fontSize: '12px', color: 'var(--danger)',
            display: 'flex', alignItems: 'center', gap: '7px',
          }}>
            <span style={{
              display: 'inline-block', width: '4px', height: '4px',
              borderRadius: '50%', background: 'var(--danger)', flexShrink: 0,
            }} />
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          className="btn btn-primary btn-lg"
          type="submit"
          disabled={loading}
          style={{ justifyContent: 'center', marginTop: '8px', width: '100%' }}
        >
          {loading ? 'შემოწმება...' : 'შესვლა'}
        </button>
      </form>

      {/* Register link */}
      <div style={{
        marginTop: '40px',
        paddingTop: '24px',
        borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'center', gap: '6px',
        fontSize: '13px', color: 'var(--text3)',
      }}>
        ანგარიში არ გაქვთ?{' '}
        <Link href="/auth/register" style={{
          color: 'var(--accent)', fontWeight: 500,
        }}>
          რეგისტრაცია
        </Link>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '10px',
  color: 'var(--text3)',
  marginBottom: '10px',
  fontFamily: 'DM Mono, monospace',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
}
