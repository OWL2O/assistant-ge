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
    <header style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 24px', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/dashboard">
          <span style={{ fontFamily: 'Instrument Serif, serif', fontSize: '20px' }}>
            ASSISTANT<span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>.ge</span>
          </span>
        </Link>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {profile?.is_admin && (
            <Link href="/admin" className="btn btn-sm" style={{
              background: 'rgba(108,142,255,0.12)',
              color: 'var(--accent)',
              border: '1px solid rgba(108,142,255,0.25)',
              borderRadius: '7px', padding: '5px 12px', fontSize: '12px',
            }}>
              ⚙ ადმინი
            </Link>
          )}

          <div style={{
            fontFamily: 'DM Mono, monospace', fontSize: '11px',
            color: 'var(--text2)', textAlign: 'right',
          }}>
            {profile?.full_name || profile?.email}
          </div>

          <button onClick={handleLogout} className="btn btn-ghost btn-sm">
            გასვლა
          </button>
        </div>
      </div>
    </header>
  )
}
