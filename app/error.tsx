'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

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
            color: 'var(--danger)',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            marginBottom: '14px',
          }}
        >
          ERROR_500
        </div>
        <h1
          style={{
            fontFamily: 'Instrument Serif, serif',
            fontSize: '32px',
            letterSpacing: '-0.4px',
            marginBottom: '12px',
          }}
        >
          დაფიქსირდა შეცდომა
        </h1>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--text2)',
            marginBottom: '28px',
            lineHeight: 1.6,
          }}
        >
          რაღაც არასწორად წავიდა. გთხოვთ სცადოთ თავიდან ან დაბრუნდეთ მთავარ გვერდზე.
        </p>
        <div
          style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
          }}
        >
          <button onClick={reset} className="btn btn-primary">
            ხელახლა სცადეთ
          </button>
          <a href="/dashboard" className="btn btn-ghost">
            მთავარი
          </a>
        </div>
        {error.digest && (
          <div
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '10px',
              color: 'var(--text3)',
              marginTop: '32px',
              letterSpacing: '0.04em',
            }}
          >
            ID: {error.digest}
          </div>
        )}
      </div>
    </div>
  )
}
