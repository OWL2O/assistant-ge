'use client'

import { useState } from 'react'
import RequestOrgButton from '@/components/RequestOrgButton'

export default function RequestSection({ hasPending }: { hasPending: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
    }}>
      {/* Collapsible header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'none', border: 'none',
          padding: '24px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <div>
          <div style={{
            fontSize: '10px', fontFamily: 'DM Mono, monospace',
            color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em',
            marginBottom: '6px',
          }}>
            მოთხოვნა
          </div>
          <div style={{
            fontFamily: 'Instrument Serif, serif', fontSize: '22px',
            letterSpacing: '-0.3px', color: 'var(--text)',
          }}>
            ახალი ორგანიზაციის მოთხოვნა
          </div>
        </div>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: 'var(--surface2)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', color: 'var(--text3)', flexShrink: 0,
          transition: 'transform 0.2s ease',
          transform: open ? 'rotate(180deg)' : 'none',
        }}>
          ▼
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <div style={{ padding: '0 32px 32px', position: 'relative', overflow: 'hidden' }}>
          <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.7, maxWidth: '540px', marginBottom: '24px' }}>
            ახალი ორგანიზაციის გასახსნელად საჭიროა{' '}
            <span style={{ color: 'var(--text)', fontWeight: 600 }}>100 ₾</span>-ის გადახდა
            და ადმინის დამტკიცება.
          </p>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', borderRadius: 'var(--radius-sm)',
            background: 'var(--surface2)', border: '1px solid var(--border)',
            marginBottom: '24px',
          }}>
            <div style={{
              width: '4px', height: '4px', borderRadius: '50%',
              background: 'var(--text3)',
            }} />
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text3)' }}>
              გადახდა:{' '}
            </span>
            <a
              href="tel:+995555289444"
              style={{
                fontFamily: 'DM Mono, monospace', fontSize: '12px',
                color: 'var(--text2)', letterSpacing: '0.04em',
              }}
            >
              +995 555 28 94 44
            </a>
          </div>

          {hasPending && (
            <div className="notification-banner notification-banner--info" style={{ marginBottom: '20px' }}>
              <div className="notification-banner__icon" style={{ color: 'var(--accent)' }}>i</div>
              <div>
                <div className="notification-banner__body">
                  გაქვთ განხილვის პროცესში მყოფი მოთხოვნა. შეგიძლიათ გააგზავნოთ კიდევ ერთი.
                </div>
              </div>
            </div>
          )}

          <RequestOrgButton hasPending={hasPending} />
        </div>
      )}
    </div>
  )
}
