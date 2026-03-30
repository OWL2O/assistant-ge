'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

export default function DashboardHeader({ profile }: { profile: Profile | null }) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <header className="glass" style={{
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 28px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/dashboard">
          <span style={{
            fontFamily: 'Instrument Serif, serif', fontSize: '20px',
            letterSpacing: '-0.3px', color: 'var(--text)',
          }}>
            ASSISTANT<span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>.ge</span>
          </span>
        </Link>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {profile?.is_admin && (
            <Link href="/admin" style={{
              fontSize: '12px', color: 'var(--accent)',
              fontFamily: 'DM Mono, monospace',
              background: 'rgba(129,140,248,0.08)',
              padding: '5px 14px', borderRadius: '20px',
              border: '1px solid rgba(129,140,248,0.2)',
              transition: 'all 0.15s',
              letterSpacing: '0.02em',
            }}>
              ადმინი
            </Link>
          )}

          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '5px 14px', borderRadius: '20px',
            background: 'var(--surface2)', border: '1px solid var(--border)',
          }}>
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '9px', fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {(profile?.full_name || profile?.email || '?')[0].toUpperCase()}
            </div>
            <span style={{
              fontFamily: 'DM Mono, monospace', fontSize: '12px',
              color: 'var(--text2)',
              maxWidth: '160px', overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {profile?.full_name || profile?.email}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-sm"
            style={{ borderRadius: '20px' }}
          >
            გასვლა
          </button>
        </div>
      </div>
    </header>
  )
}
