'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import GoogleButton from '@/components/GoogleButton'

const EMAILS_KEY = 'assistants_saved_emails'

function saveEmail(email: string) {
  try {
    const saved: string[] = JSON.parse(localStorage.getItem(EMAILS_KEY) || '[]')
    const updated = [email, ...saved.filter(e => e !== email)].slice(0, 10)
    localStorage.setItem(EMAILS_KEY, JSON.stringify(updated))
  } catch {}
}

export default function RegisterPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 8) {
      setError('პაროლი მინიმუმ 8 სიმბოლო უნდა იყოს')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        setError('ეს ელ-ფოსტა უკვე დარეგისტრირებულია')
      } else {
        setError('დარეგისტრირება ვერ მოხერხდა. სცადეთ ხელახლა.')
      }
      setLoading(false)
      return
    }

    saveEmail(email)
    setDone(true)
  }

  if (done) {
    return (
      <div className="fade-in" style={{ textAlign: 'center' }}>
        <div style={{
          width: '48px', height: '48px',
          borderRadius: '4px',
          background: 'rgba(45,91,227,0.07)',
          border: '1px solid rgba(45,91,227,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px',
          fontSize: '22px', color: 'var(--accent)',
        }}>
          ✉
        </div>
        <h2 style={{
          fontFamily: 'Instrument Serif, serif',
          fontSize: '26px', marginBottom: '14px', letterSpacing: '-0.4px',
        }}>
          გთხოვთ დაადასტურეთ მეილი
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.75 }}>
          გამოგიგზავნეთ დადასტურების ლინკი{' '}
          <b style={{ color: 'var(--text)' }}>{email}</b>-ზე.
          შეამოწმეთ inbox (ან spam).
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '12px' }}>
          დადასტურების შემდეგ შეგიძლიათ შეხვიდეთ სისტემაში.
        </p>
        <Link href="/auth/login" className="btn btn-ghost" style={{ marginTop: '32px', display: 'inline-flex' }}>
          ← შესვლის გვერდი
        </Link>
      </div>
    )
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
          რეგისტრაცია
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text3)', lineHeight: 1.6 }}>
          შექმენით ანგარიში ASSISTANTS.ge-ზე
        </p>
      </div>

      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        <div>
          <label htmlFor="reg-name" style={labelStyle}>სახელი და გვარი</label>
          <input
            id="reg-name"
            className="input-line"
            type="text"
            placeholder="გიორგი მაისურაძე"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor="reg-email" style={labelStyle}>ელ-ფოსტა</label>
          <input
            id="reg-email"
            className={`input-line ${error ? 'error' : ''}`}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="reg-password" style={labelStyle}>პაროლი</label>
          <div style={{ position: 'relative' }}>
            <input
              id="reg-password"
              className={`input-line ${error ? 'error' : ''}`}
              type={showPw ? 'text' : 'password'}
              placeholder="მინიმუმ 8 სიმბოლო"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
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

        <button
          className="btn btn-primary btn-lg"
          type="submit"
          disabled={loading}
          style={{ justifyContent: 'center', marginTop: '8px', width: '100%' }}
        >
          {loading ? 'მიმდინარეობს...' : 'რეგისტრაცია'}
        </button>
      </form>

      {/* Divider */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        margin: '28px 0',
      }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        <span style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace', letterSpacing: '0.08em' }}>
          ან
        </span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      <GoogleButton label="Google-ით რეგისტრაცია" />

      <div style={{
        marginTop: '28px',
        paddingTop: '24px',
        borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'center', gap: '6px',
        fontSize: '13px', color: 'var(--text3)',
      }}>
        უკვე გაქვთ ანგარიში?{' '}
        <Link href="/auth/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>
          შესვლა
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
