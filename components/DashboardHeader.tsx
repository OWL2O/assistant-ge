'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

export default function DashboardHeader({ profile }: { profile: Profile | null }) {
  const router   = useRouter()
  const pathname = usePathname()
  const dark     = pathname.startsWith('/dashboard/importer')

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const bg         = dark ? '#16161c' : 'var(--surface)'
  const border     = dark ? '#2a2a38' : 'var(--border)'
  const textColor  = dark ? '#e8e8f0' : 'var(--text)'
  const text2Color = dark ? '#8888aa' : 'var(--text2)'
  const accent     = dark ? '#6c8eff' : 'var(--accent)'
  const pillBg     = dark ? '#1e1e27' : 'var(--surface2)'
  const pillBorder = dark ? '#2a2a38' : 'var(--border)'
  const adminBg    = dark ? 'rgba(108,142,255,0.08)' : 'rgba(45,91,227,0.07)'
  const adminBorder= dark ? 'rgba(108,142,255,0.2)'  : 'rgba(45,91,227,0.2)'
  const btnBg      = dark ? '#1e1e27' : 'var(--surface)'
  const btnBorder  = dark ? '#2a2a38' : 'var(--border2)'

  return (
    <header style={{
      background: bg,
      borderBottom: `1px solid ${border}`,
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: dark ? 'none' : '1200px', margin: '0 auto',
        padding: '0 28px', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/dashboard">
          <span style={{
            fontFamily: 'Instrument Serif, serif', fontSize: '20px',
            letterSpacing: '-0.3px', color: textColor,
          }}>
            ASSISTANTS<span style={{ color: accent, fontStyle: 'italic' }}>.ge</span>
          </span>
        </Link>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {profile?.is_admin && (
            <Link href="/admin" style={{
              fontSize: '12px', color: accent,
              fontFamily: 'DM Mono, monospace',
              background: adminBg,
              padding: '5px 14px', borderRadius: '20px',
              border: `1px solid ${adminBorder}`,
              transition: 'all 0.15s',
              letterSpacing: '0.02em',
            }}>
              ადმინი
            </Link>
          )}

          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '5px 14px', borderRadius: '20px',
            background: pillBg, border: `1px solid ${pillBorder}`,
          }}>
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%',
              background: accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '9px', fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {(profile?.full_name || profile?.email || '?')[0].toUpperCase()}
            </div>
            <span style={{
              fontFamily: 'DM Mono, monospace', fontSize: '12px',
              color: text2Color,
              maxWidth: '160px', overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {profile?.full_name || profile?.email}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-sm"
            style={{
              borderRadius: '20px',
              background: btnBg,
              border: `1px solid ${btnBorder}`,
              color: text2Color,
            }}
          >
            გასვლა
          </button>
        </div>
      </div>
    </header>
  )
}
