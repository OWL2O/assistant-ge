export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '-20%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(129,140,248,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%', left: '20%',
        width: '400px', height: '300px',
        background: 'radial-gradient(ellipse, rgba(52,211,153,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontFamily: 'Instrument Serif, serif',
            fontSize: '36px',
            letterSpacing: '-0.5px',
            lineHeight: 1,
            color: 'var(--text)',
          }}>
            ASSISTANT<span style={{ color: 'var(--accent)', fontStyle: 'italic', fontWeight: 400 }}>.ge</span>
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '10px', letterSpacing: '0.04em' }}>
            TBC → FINS იმპორტის პლატფორმა
          </p>
          <div style={{
            width: '40px', height: '1px', margin: '16px auto 0',
            background: 'linear-gradient(90deg, transparent, var(--border2), transparent)',
          }} />
          <p style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '11px',
            color: 'var(--text3)',
            marginTop: '12px',
            letterSpacing: '0.05em',
          }}>
            +995 555 40 41 57
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
