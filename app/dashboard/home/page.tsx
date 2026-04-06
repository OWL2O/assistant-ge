'use client'

import { useState } from 'react'

const CARDS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 1L11.06 6.26L17 7.27L13 11.14L13.18 17.02L9 14.77L4.82 17.02L5 11.14L1 7.27L6.94 6.26L9 1Z"
          stroke="rgba(108,142,255,0.8)" strokeWidth="1.2" fill="rgba(108,142,255,0.1)" strokeLinejoin="round"/>
      </svg>
    ),
    accent: 'rgba(108,142,255,0.28)',
    glow: 'rgba(108,142,255,0.07)',
    label: 'სწრაფი კონვერტაცია',
    body: 'ათასობით ტრანზაქცია წამებში — ფაილი ჩაატვირთეთ, ჩამოტვირთეთ. ნულოვანი ხელით შეყვანა.',
    tag: 'INSTANT',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="rgba(251,191,36,0.7)" strokeWidth="1.2" fill="rgba(251,191,36,0.06)"/>
        <text x="9" y="13" textAnchor="middle" fill="rgba(251,191,36,0.85)" fontSize="9" fontFamily="monospace">₾</text>
      </svg>
    ),
    accent: 'rgba(251,191,36,0.28)',
    glow: 'rgba(251,191,36,0.06)',
    label: 'NBG კურსების ავტო-ჩაწერა',
    body: 'USD / EUR კურსები ყოველი ტრანზაქციის თარიღისთვის — NBG API-დან real-time.',
    tag: 'AUTO',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="14" height="14" rx="3" stroke="rgba(74,222,128,0.7)" strokeWidth="1.2" fill="rgba(74,222,128,0.06)"/>
        <path d="M5 9l3 3 5-5" stroke="rgba(74,222,128,0.8)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    accent: 'rgba(74,222,128,0.28)',
    glow: 'rgba(74,222,128,0.06)',
    label: 'ორგანიზაციების მართვა',
    body: 'Demo და ფასიანი პაკეტები — თითოეული ორგანიზაცია სრულად იზოლირებული.',
    tag: 'MULTI-ORG',
  },
]

export default function DashboardHomePage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '52px 36px 80px' }}>

      {/* ── Hero ── */}
      <div style={{ marginBottom: '64px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          borderRadius: '20px',
          background: 'rgba(108,142,255,0.07)',
          border: '1px solid rgba(108,142,255,0.18)',
          marginBottom: '24px',
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'rgba(74,222,128,0.9)',
            boxShadow: '0 0 8px rgba(74,222,128,0.7)',
            display: 'inline-block',
            animation: 'pulse 2s ease-in-out infinite',
          }} />
          <span style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '10px',
            letterSpacing: '0.14em',
            color: 'rgba(108,142,255,0.8)',
            textTransform: 'uppercase',
          }}>
            Live · ASSISTANTS.ge
          </span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-serif), serif',
          fontSize: 'clamp(32px, 4vw, 48px)',
          fontWeight: 400,
          lineHeight: 1.12,
          letterSpacing: '-0.5px',
          marginBottom: '20px',
        }}>
          <span style={{ color: '#ffffff' }}>TBC / BOG ამონაწერიდან</span>
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #6c8eff 0%, #a78bfa 50%, #6c8eff 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            FINS-ში ავტომატურად
          </span>
        </h1>

        <p style={{
          fontSize: '15px',
          color: 'rgba(255,255,255,0.42)',
          lineHeight: 1.8,
          maxWidth: '520px',
          fontWeight: 400,
        }}>
          ASSISTANTS.ge გარდაქმნის TBC და BOG ბანკების Excel-ამონაწერს FINS-ბუღალტრული
          პროგრამის იმპორტის ფორმატში — ვალუტის კურსების ავტომატური ჩაწერით,
          ნულოვანი ხელით შეყვანით.
        </p>
      </div>

      {/* ── Feature cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '14px',
        marginBottom: '64px',
      }}>
        {CARDS.map((card, i) => (
          <div
            key={card.label}
            onMouseEnter={() => setHoveredCard(i)}
            onMouseLeave={() => setHoveredCard(null)}
            className="glass-card"
            style={{
              padding: '26px 22px',
              cursor: 'default',
              boxShadow: hoveredCard === i
                ? `0 0 40px ${card.glow}, inset 0 1px 0 ${card.accent}`
                : 'none',
              borderColor: hoveredCard === i ? card.accent : 'rgba(255,255,255,0.07)',
              transform: hoveredCard === i ? 'translateY(-2px)' : 'none',
              transition: 'all 0.25s ease',
            }}
          >
            <div style={{
              width: '36px', height: '36px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${card.accent}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px',
            }}>
              {card.icon}
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              marginBottom: '8px',
            }}>
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.88)',
                letterSpacing: '-0.1px',
              }}>
                {card.label}
              </span>
            </div>

            <p style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.35)',
              lineHeight: 1.7,
              marginBottom: '16px',
            }}>
              {card.body}
            </p>

            <span style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '9px',
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.18)',
              textTransform: 'uppercase',
            }}>
              {card.tag}
            </span>
          </div>
        ))}
      </div>

      {/* ── How it works ── */}
      <div style={{ marginBottom: '64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <span style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '10px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.2)',
          }}>
            01 — როგორ მუშაობს
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
        </div>

        <div className="glass-card" style={{ padding: '40px 32px' }}>
          <svg
            viewBox="0 0 760 160"
            width="100%"
            style={{ display: 'block', maxWidth: '720px', margin: '0 auto' }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(108,142,255,0.7)" />
                <stop offset="100%" stopColor="rgba(167,139,250,0.4)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Step 1 — TBC Excel */}
            <g transform="translate(20, 24)">
              <rect x="0" y="0" width="130" height="112" rx="10"
                fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
              <rect x="12" y="14" width="106" height="72" rx="6"
                fill="rgba(74,222,128,0.05)" stroke="rgba(74,222,128,0.2)" strokeWidth="1"/>
              <text x="65" y="46" textAnchor="middle"
                fill="rgba(74,222,128,0.65)" fontSize="12" fontFamily="monospace" letterSpacing="1">XLS</text>
              <text x="65" y="62" textAnchor="middle"
                fill="rgba(74,222,128,0.35)" fontSize="8" fontFamily="monospace">TBC / BOG ამონაწერი</text>
              {[78, 86, 94].map((y) => (
                <rect key={y} x="22" y={y} width={y === 86 ? 54 : 86} height="4" rx="2"
                  fill="rgba(74,222,128,0.1)" />
              ))}
              <text x="65" y="125" textAnchor="middle"
                fill="rgba(255,255,255,0.15)" fontSize="8.5" fontFamily="monospace" letterSpacing="0.08em">
                01 · UPLOAD
              </text>
            </g>

            {/* Arrow 1 */}
            <g transform="translate(162, 80)">
              <line x1="0" y1="0" x2="68" y2="0"
                stroke="url(#flowGrad)" strokeWidth="1.2" strokeDasharray="5 3"/>
              <polygon points="68,0 60,-3.5 60,3.5" fill="rgba(108,142,255,0.6)"/>
            </g>

            {/* Step 2 — Platform */}
            <g transform="translate(242, 14)">
              <rect x="0" y="0" width="160" height="112" rx="10"
                fill="rgba(108,142,255,0.04)" stroke="rgba(108,142,255,0.2)" strokeWidth="1"
                filter="url(#glow)"/>
              <text x="80" y="26" textAnchor="middle"
                fill="rgba(108,142,255,0.85)" fontSize="10" fontFamily="monospace" letterSpacing="1">
                ASSISTANTS.ge
              </text>
              {/* Parse rows */}
              {[36, 48, 60, 72, 84, 96].map((y, idx) => (
                <g key={y}>
                  <rect x="12" y={y} width={idx % 3 === 0 ? 60 : idx % 2 === 0 ? 46 : 80} height="4" rx="2"
                    fill="rgba(255,255,255,0.06)"/>
                  <rect x="100" y={y} width="24" height="4" rx="2"
                    fill={idx < 3 ? 'rgba(108,142,255,0.2)' : 'rgba(74,222,128,0.15)'}/>
                </g>
              ))}
              {/* NBG badge */}
              <rect x="34" y="-14" width="92" height="18" rx="5"
                fill="rgba(251,191,36,0.08)" stroke="rgba(251,191,36,0.3)" strokeWidth="0.8"/>
              <text x="80" y="-3" textAnchor="middle"
                fill="rgba(251,191,36,0.75)" fontSize="8" fontFamily="monospace" letterSpacing="0.5">
                NBG RATE API ↗
              </text>
            </g>

            {/* Arrow 2 */}
            <g transform="translate(414, 80)">
              <line x1="0" y1="0" x2="68" y2="0"
                stroke="url(#flowGrad)" strokeWidth="1.2" strokeDasharray="5 3"/>
              <polygon points="68,0 60,-3.5 60,3.5" fill="rgba(108,142,255,0.6)"/>
            </g>

            {/* Step 3 — FINS */}
            <g transform="translate(494, 24)">
              <rect x="0" y="0" width="130" height="112" rx="10"
                fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
              <text x="65" y="22" textAnchor="middle"
                fill="rgba(255,255,255,0.45)" fontSize="10" fontFamily="monospace" letterSpacing="1">FINS</text>
              {[30, 42, 54, 66, 78, 90].map((y, idx) => (
                <rect key={y} x="12" y={y} width={idx === 5 ? 56 : 106} height="4" rx="2"
                  fill={idx === 0 ? 'rgba(108,142,255,0.22)' : 'rgba(255,255,255,0.05)'}/>
              ))}
              {/* Download button */}
              <rect x="18" y="100" width="94" height="16" rx="4"
                fill="rgba(74,222,128,0.1)" stroke="rgba(74,222,128,0.3)" strokeWidth="0.8"/>
              <text x="65" y="111" textAnchor="middle"
                fill="rgba(74,222,128,0.75)" fontSize="8" fontFamily="monospace">↓ ჩამოტვირთვა</text>
              <text x="65" y="138" textAnchor="middle"
                fill="rgba(255,255,255,0.15)" fontSize="8.5" fontFamily="monospace" letterSpacing="0.08em">
                03 · EXPORT
              </text>
            </g>

            {/* Step 2 label */}
            <text x="322" y="148" textAnchor="middle"
              fill="rgba(255,255,255,0.15)" fontSize="8.5" fontFamily="monospace" letterSpacing="0.08em">
              02 · PROCESS
            </text>
          </svg>
        </div>
      </div>

      {/* ── Video section ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <span style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '10px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.2)',
          }}>
            02 — ვიდეო სახელმძღვანელო
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
        </div>

        <p style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.3)',
          marginBottom: '20px',
          lineHeight: 1.65,
        }}>
          სრული demo — Excel-ფაილის ატვირთვიდან FINS-ში მზა ჩანაწერამდე.
        </p>

        {/* Glow halo behind video */}
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            inset: '-32px',
            background: 'radial-gradient(ellipse at 50% 50%, rgba(108,142,255,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
            borderRadius: '24px',
          }} />

          <div className="glass-card" style={{
            position: 'relative',
            overflow: 'hidden',
            paddingBottom: '56.25%',
            height: 0,
            border: '1px solid rgba(108,142,255,0.18)',
            boxShadow: '0 0 60px rgba(108,142,255,0.08)',
          }}>
            <iframe
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '100%', height: '100%',
                border: 'none',
              }}
              src="https://www.youtube.com/embed/7P9xVk26bBc?si=Zosy2iWJtXjwdXAz"
              title="ASSISTANTS.ge — ვიდეო სახელმძღვანელო"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
