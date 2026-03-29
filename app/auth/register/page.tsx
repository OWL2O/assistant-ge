'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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
      setError(error.message)
      setLoading(false)
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
        <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '22px', marginBottom: '10px' }}>
          გთხოვთ დაადასტურეთ მეილი
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.7 }}>
          გამოგიგზავნეთ დადასტურების ლინკი <b style={{ color: 'var(--text)' }}>{email}</b>-ზე.
          შეამოწმეთ inbox (ან spam).
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '16px' }}>
          დადასტურების შემდეგ შეგიძლიათ შეხვიდეთ სისტემაში.
        </p>
        <Link href="/auth/login" className="btn btn-ghost" style={{ marginTop: '24px', display: 'inline-flex' }}>
          ← შესვლის გვერდი
        </Link>
      </div>
    )
  }

  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="card-glow" />

      <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '22px', marginBottom: '6px' }}>
        რეგისტრაცია
      </h2>
      <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '28px' }}>
        შექმენით ანგარიში ASSISTANT.ge-ზე
      </p>

      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '6px', fontFamily: 'DM Mono, monospace' }}>
            სახელი და გვარი
          </label>
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
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '6px', fontFamily: 'DM Mono, monospace' }}>
            ელ-ფოსტა
          </label>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '6px', fontFamily: 'DM Mono, monospace' }}>
            პაროლი
          </label>
          <input
            className="input"
            type="password"
            placeholder="მინიმუმ 8 სიმბოლო"
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
          {loading ? 'მიმდინარეობს...' : 'რეგისტრაცია →'}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text3)', marginTop: '24px' }}>
        უკვე გაქვთ ანგარიში?{' '}
        <Link href="/auth/login" style={{ color: 'var(--accent)' }}>
          შესვლა
        </Link>
      </p>
    </div>
  )
}
