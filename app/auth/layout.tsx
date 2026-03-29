export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--bg)',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 style={{
            fontFamily: 'Instrument Serif, serif',
            fontSize: '30px',
            letterSpacing: '-0.5px',
          }}>
            ASSISTANT<span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>.ge</span>
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '6px' }}>
            TBC → FINS იმპორტის პლატფორმა
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
