'use client'

import { useState } from 'react'
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

export default function RegisterPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
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
      <div className="card fade-in" style={{ textAlign: 'center' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'rgba(45,91,227,0.08)',
          border: '1px solid rgba(45,91,227,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '24px', color: 'var(--accent)',
        }}>
          ✉
        </div>
        <h2 style={{
          fontFamily: 'Instrument Serif, serif', fontSize: '24px',
          marginBottom: '12px', letterSpacing: '-0.3px',
        }}>
          გთხოვთ დაადასტურეთ მეილი
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.7 }}>
          გამოგიგზავნეთ დადასტურების ლინკი{' '}
          <b style={{ color: 'var(--text)' }}>{email}</b>-ზე.
          შეამოწმეთ inbox (ან spam).
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '12px' }}>
          დადასტურების შემდეგ შეგიძლიათ შეხვიდეთ სისტემაში.
        </p>
        <Link href="/auth/login" className="btn btn-ghost" style={{ marginTop: '28px', display: 'inline-flex' }}>
          ← შესვლის გვერდი
        </Link>
      </div>
    )
  }

  return (
    <div className="card fade-in">
      <h2 style={{
        fontFamily: 'Instrument Serif, serif', fontSize: '24px',
        marginBottom: '4px', letterSpacing: '-0.3px',
      }}>
        რეგისტრაცია
      </h2>
      <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '32px' }}>
        შექმენით ანგარიში ASSISTANTS.ge-ზე
      </p>

      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={labelStyle}>სახელი და გვარი</label>
          <input
            className="input"
            type="text"
            placeholder="გიორგი მაისურაძე"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
          />
        </div>

        <div>
          <label style={labelStyle}>ელ-ფოსტა</label>
          <input
            className={`input ${error ? 'error' : ''}`}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label style={labelStyle}>პაროლი</label>
          <input
            className={`input ${error ? 'error' : ''}`}
            type="password"
            placeholder="მინიმუმ 8 სიმბოლო"
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
          {loading ? 'მიმდინარეობს...' : 'რეგისტრაცია'}
        </button>
      </form>

      <div className="divider" style={{ margin: '28px 0' }} />

      <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text3)' }}>
        უკვე გაქვთ ანგარიში?{' '}
        <Link href="/auth/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>
          შესვლა
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
