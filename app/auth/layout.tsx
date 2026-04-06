import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ავტორიზაცია',
  description: 'ASSISTANTS.ge — შესვლა ან რეგისტრაცია',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-shell">

      {/* ── Left panel: dark brand panel ── */}
      <div className="auth-panel-left">

        {/* Top: tag line */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}>
            Financial Operations Platform
          </div>
        </div>

        {/* Center: brand */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontFamily: 'Instrument Serif, serif',
            fontSize: 'clamp(48px, 4.5vw, 68px)',
            color: '#FFFFFF',
            letterSpacing: '-1.5px',
            lineHeight: 0.92,
            marginBottom: '28px',
          }}>
            ASSISTANTS
            <span style={{ color: 'rgba(108,142,255,0.85)', fontStyle: 'italic' }}>.ge</span>
          </h1>
          <div style={{
            width: '36px', height: '1.5px',
            background: 'rgba(255,255,255,0.12)',
            marginBottom: '24px',
          }} />
          <p style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.38)',
            lineHeight: 1.85,
            maxWidth: '300px',
            fontWeight: 300,
            letterSpacing: '0.01em',
          }}>
            TBC და BOG ბანკების ამონაწერების ავტომატური
            გარდაქმნა FINS სააღრიცხვო სისტემისთვის.
          </p>
        </div>

        {/* Bottom: contact */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            height: '1px',
            background: 'rgba(255,255,255,0.06)',
            marginBottom: '20px',
          }} />
          <p style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: '0.1em',
          }}>
            +995 555 28 94 44
          </p>
        </div>
      </div>

      {/* ── Right panel: form area ── */}
      <div className="auth-panel-right">
        <div style={{ width: '100%', maxWidth: '360px' }}>
          {children}
        </div>
      </div>

    </div>
  )
}
