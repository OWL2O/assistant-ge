'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

type NavItem = {
  label: string
  href: string
}

export default function DashboardHeader({ profile }: { profile: Profile | null }) {
  const router   = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const navItems: NavItem[] = [
    { label: 'მთავარი', href: '/dashboard/home' },
    { label: 'ორგანიზაციები', href: '/dashboard' },
    { label: 'კურსები', href: '/dashboard/rates' },
  ]
  if (profile?.is_admin) {
    navItems.push({ label: 'ადმინი', href: '/admin' })
  }

  const initial = (profile?.full_name || profile?.email || '?')[0].toUpperCase()
  const displayName = profile?.full_name || profile?.email || ''

  const isImporter = pathname.startsWith('/dashboard/importer')

  if (isImporter) {
    return (
      <aside style={{
        width: '48px', flexShrink: 0,
        background: '#0B0B0E',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        height: '100vh', position: 'sticky', top: 0, overflow: 'hidden',
      }}>
        <Link href="/dashboard" title="ორგანიზაციებზე დაბრუნება" style={{
          marginTop: '22px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textDecoration: 'none',
        }}>
          <span style={{
            fontFamily: 'Instrument Serif, serif',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: '0.08em',
            lineHeight: 1,
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}>
            ASSISTANTS<span style={{ color: 'rgba(108,142,255,0.7)', fontStyle: 'italic' }}>.ge</span>
          </span>
        </Link>
      </aside>
    )
  }

  return (
    <aside className="app-sidebar">

      {/* ── Logo ── */}
      <div style={{
        padding: '28px 24px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0,
      }}>
        <Link href="/dashboard">
          <span style={{
            fontFamily: 'Instrument Serif, serif',
            fontSize: '17px',
            color: '#FFFFFF',
            letterSpacing: '-0.3px',
            lineHeight: 1,
          }}>
            ASSISTANTS
            <span style={{ color: 'rgba(108,142,255,0.8)', fontStyle: 'italic' }}>.ge</span>
          </span>
        </Link>
        <div style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '9px',
          color: 'rgba(255,255,255,0.2)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginTop: '6px',
        }}>
          TBC / BOG → FINS
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{
        flex: 1,
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        overflowY: 'auto',
      }}>
        {navItems.map(item => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '9px 12px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: isActive ? 500 : 400,
                color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.42)',
                background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                transition: 'all 0.15s ease',
                textDecoration: 'none',
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* ── User + Logout ── */}
      <div style={{
        padding: '16px 12px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0,
      }}>
        {/* User row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          marginBottom: '8px',
        }}>
          <div style={{
            width: '28px', height: '28px',
            borderRadius: '4px',
            background: 'rgba(108,142,255,0.2)',
            border: '1px solid rgba(108,142,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 700,
            color: 'rgba(108,142,255,0.9)',
            flexShrink: 0,
          }}>
            {initial}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.7)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {displayName}
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '9px 12px',
            borderRadius: '4px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.28)',
            transition: 'all 0.15s ease',
            textAlign: 'left',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'rgba(255,255,255,0.28)'
          }}
        >
          <span style={{ fontSize: '13px', lineHeight: 1, width: '16px', textAlign: 'center', flexShrink: 0 }}>↩</span>
          გასვლა
        </button>
      </div>

    </aside>
  )
}
