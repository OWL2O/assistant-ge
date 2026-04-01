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
            ASSISTANTS<span style={{ color: 'var(--accent)', fontStyle: 'italic', fontWeight: 400 }}>.ge</span>
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '10px', letterSpacing: '0.04em' }}>
            TBC → FINS იმპორტის პლატფორმა
          </p>
          <div style={{
            width: '40px', height: '1px', margin: '16px auto 0',
            background: 'var(--border)',
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
