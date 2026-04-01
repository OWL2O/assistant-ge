export default function DashboardLoading() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .skel { background: var(--border); border-radius: 6px; animation: pulse 1.6s ease-in-out infinite; }
      `}</style>

      {/* Page header skeleton */}
      <div style={{ marginBottom: '32px' }}>
        <div className="skel" style={{ height: '28px', width: '200px', marginBottom: '10px' }} />
        <div className="skel" style={{ height: '16px', width: '300px' }} />
      </div>

      {/* Org cards skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '20px', padding: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <div className="skel" style={{ height: '10px', width: '40px', marginBottom: '10px' }} />
                <div className="skel" style={{ height: '18px', width: '140px' }} />
              </div>
              <div className="skel" style={{ height: '22px', width: '60px', borderRadius: '20px' }} />
            </div>
            <div className="skel" style={{ height: '2px', width: '100%', marginBottom: '20px' }} />
            <div className="skel" style={{ height: '36px', width: '100%', borderRadius: '8px' }} />
          </div>
        ))}
      </div>

      {/* Request section skeleton */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
        <div className="skel" style={{ height: '18px', width: '180px', marginBottom: '12px' }} />
        <div className="skel" style={{ height: '14px', width: '340px', marginBottom: '8px' }} />
        <div className="skel" style={{ height: '14px', width: '280px' }} />
      </div>
    </div>
  )
}
