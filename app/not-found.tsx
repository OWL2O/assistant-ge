import Link from 'next/link'

export const metadata = {
  title: 'გვერდი ვერ მოიძებნა — ASSISTANTS.ge',
}

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
      }}
    >
      <div style={{ maxWidth: '440px', textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '10px',
            color: 'var(--text3)',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            marginBottom: '14px',
          }}
        >
          ERROR_404
        </div>
        <h1
          style={{
            fontFamily: 'Instrument Serif, serif',
            fontSize: '32px',
            letterSpacing: '-0.4px',
            marginBottom: '12px',
          }}
        >
          გვერდი ვერ მოიძებნა
        </h1>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--text2)',
            marginBottom: '28px',
            lineHeight: 1.6,
          }}
        >
          ბმული, რომელიც გახსენით, აღარ არსებობს ან არასწორია.
        </p>
        <Link href="/dashboard" className="btn btn-primary">
          მთავარზე დაბრუნება
        </Link>
      </div>
    </div>
  )
}
