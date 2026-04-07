'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function GoogleButton({ label = 'Google-ით შესვლა' }: { label?: string }) {
  const [loading, setLoading] = useState(false)

  async function handleGoogle() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    // browser redirects — no need to setLoading(false)
  }

  return (
    <button
      type="button"
      onClick={handleGoogle}
      disabled={loading}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '11px 16px',
        borderRadius: '6px',
        background: 'transparent',
        border: '1px solid var(--border2)',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '13px',
        color: loading ? 'var(--text3)' : 'var(--text2)',
        transition: 'border-color 0.15s, color 0.15s, background 0.15s',
        opacity: loading ? 0.6 : 1,
      }}
      onMouseEnter={e => {
        if (!loading) {
          e.currentTarget.style.borderColor = 'var(--accent)'
          e.currentTarget.style.color = 'var(--text)'
          e.currentTarget.style.background = 'rgba(108,142,255,0.04)'
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border2)'
        e.currentTarget.style.color = 'var(--text2)'
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {/* Google G logo */}
      <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
        <path d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.2-.1-2.5-.4-3.5z" fill="#FFC107"/>
        <path d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z" fill="#FF3D00"/>
        <path d="M24 44c5.2 0 10-1.9 13.6-5.1l-6.3-5.3C29.5 35.5 26.9 36 24 36c-5.3 0-9.7-3.3-11.3-7.9L6 33.5C9.3 39.7 16.1 44 24 44z" fill="#4CAF50"/>
        <path d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.3 5.3C41.1 36.5 44 30.7 44 24c0-1.2-.1-2.5-.4-3.5z" fill="#1976D2"/>
      </svg>
      {loading ? 'გადამისამართება...' : label}
    </button>
  )
}
