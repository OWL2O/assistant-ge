export default function AdminLoading() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .skel { background: var(--border); border-radius: 6px; animation: pulse 1.6s ease-in-out infinite; }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: '32px' }}>
        <div className="skel" style={{ height: '28px', width: '160px', marginBottom: '10px' }} />
        <div className="skel" style={{ height: '16px', width: '240px' }} />
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '24px',
          }}>
            <div className="skel" style={{ height: '36px', width: '50px', marginBottom: '12px' }} />
            <div className="skel" style={{ height: '12px', width: '90px' }} />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="skel" style={{ height: '16px', width: '120px' }} />
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div className="skel" style={{ height: '32px', width: '32px', borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skel" style={{ height: '14px', width: '180px', marginBottom: '8px' }} />
              <div className="skel" style={{ height: '12px', width: '120px' }} />
            </div>
            <div className="skel" style={{ height: '26px', width: '80px', borderRadius: '20px' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
