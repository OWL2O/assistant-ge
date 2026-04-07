'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

type NbgCurrency = {
  code: string
  quantity: number
  rate: number
  rateFormated: string
  diffFormated: string
  diff: number
  name: string
  validFromDate: string
}

type NbgResponse = Array<{
  date: string
  currencies: NbgCurrency[]
}>

// Currency → ISO country code (lowercase, for flagcdn.com)
const CURRENCY_COUNTRY: Record<string, string> = {
  AED: 'ae', AMD: 'am', AUD: 'au', AZN: 'az', BRL: 'br', BYN: 'by',
  CAD: 'ca', CHF: 'ch', CNY: 'cn', CZK: 'cz', DKK: 'dk', EGP: 'eg',
  EUR: 'eu', GBP: 'gb', HKD: 'hk', HUF: 'hu', ILS: 'il', INR: 'in',
  IRR: 'ir', ISK: 'is', JPY: 'jp', KGS: 'kg', KRW: 'kr', KWD: 'kw',
  KZT: 'kz', MDL: 'md', NOK: 'no', NZD: 'nz', PLN: 'pl', QAR: 'qa',
  RON: 'ro', RSD: 'rs', RUB: 'ru', SEK: 'se', SGD: 'sg', TJS: 'tj',
  TMT: 'tm', TRY: 'tr', UAH: 'ua', USD: 'us', UZS: 'uz', ZAR: 'za',
}

function FlagImg({ code, size = 28 }: { code: string; size?: number }) {
  const cc = CURRENCY_COUNTRY[code]
  if (!cc) return <span style={{ width: size, height: size * 0.7, display: 'inline-block' }} />
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${cc}.png`}
      alt={code}
      width={size}
      height={Math.round(size * 0.7)}
      style={{ borderRadius: '3px', objectFit: 'cover', display: 'block', flexShrink: 0 }}
    />
  )
}

function dateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function todayStr(): string {
  return dateStr(new Date())
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return dateStr(d)
}

function formatShortDate(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getFullYear()).slice(2)}`
}

function formatTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

// Enumerate all dates in [from, to] inclusive
function datesBetween(from: string, to: string): string[] {
  const out: string[] = []
  const cur = new Date(from)
  const end = new Date(to)
  while (cur <= end) {
    out.push(dateStr(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return out
}

export default function RatesPage() {
  const [date, setDate]               = useState(todayStr())
  const [data, setData]               = useState<NbgCurrency[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [search, setSearch]           = useState('')
  const [selected, setSelected]       = useState<NbgCurrency | null>(null)

  const fetchRates = useCallback(async (d: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/rates?date=${d}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Network error')
      const json: NbgResponse = await res.json()
      setData(json[0]?.currencies ?? [])
      setLastUpdated(new Date())
    } catch {
      setError('კურსების მოტანა ვერ მოხერხდა. სცადეთ თავიდან.')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRates(date)
  }, [date, fetchRates])

  // Auto-refresh every 5 min, only when viewing today
  useEffect(() => {
    if (date !== todayStr()) return
    const id = setInterval(() => fetchRates(date), 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [date, fetchRates])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selected) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [selected])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return data
    return data.filter(
      c =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q)
    )
  }, [data, search])

  const isToday = date === todayStr()

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '52px 36px 80px' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '44px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          borderRadius: '20px',
          background: 'rgba(251,191,36,0.07)',
          border: '1px solid rgba(251,191,36,0.2)',
          marginBottom: '20px',
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: isToday ? 'rgba(74,222,128,0.9)' : 'rgba(251,191,36,0.9)',
            boxShadow: isToday ? '0 0 8px rgba(74,222,128,0.7)' : '0 0 8px rgba(251,191,36,0.6)',
            animation: isToday ? 'pulse 2s ease-in-out infinite' : 'none',
          }} />
          <span style={{
            fontFamily: MONO,
            fontSize: '10px',
            letterSpacing: '0.14em',
            color: isToday ? 'rgba(74,222,128,0.85)' : 'rgba(251,191,36,0.85)',
            textTransform: 'uppercase',
          }}>
            {isToday ? 'Live · NBG' : 'Archive · NBG'}
          </span>
        </div>

        <h1 style={{
          fontFamily: SERIF,
          fontSize: 'clamp(28px, 3.4vw, 42px)',
          fontWeight: 400,
          lineHeight: 1.12,
          letterSpacing: '-0.5px',
          marginBottom: '14px',
        }}>
          <span style={{ color: '#ffffff' }}>ვალუტის კურსები</span>
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            საქართველოს ეროვნული ბანკი
          </span>
        </h1>

        <p style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.42)',
          lineHeight: 1.7,
          maxWidth: '560px',
        }}>
          ოფიციალური კურსები პირდაპირ ეროვნული ბანკის API-დან. ავტომატური განახლება
          ყოველ 5 წუთში · კალენდრის მიხედვით ნახვა · ისტორიული გრაფიკები.
        </p>
      </div>

      {/* ── Controls ── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '28px',
        padding: '16px',
        background: 'rgba(255,255,255,0.015)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={mutedLabel}>თარიღი</label>
          <input
            type="date"
            value={date}
            max={todayStr()}
            onChange={e => setDate(e.target.value)}
            style={ctrlInput}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '200px' }}>
          <label style={mutedLabel}>ძებნა</label>
          <input
            type="text"
            placeholder="USD, EUR, დოლარი..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={ctrlInput}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
          <label style={mutedLabel}>
            {lastUpdated ? `განახლდა ${formatTime(lastUpdated)}` : '—'}
          </label>
          <button
            onClick={() => fetchRates(date)}
            disabled={loading}
            style={{
              background: 'rgba(108,142,255,0.12)',
              border: '1px solid rgba(108,142,255,0.3)',
              color: 'rgba(108,142,255,0.95)',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: MONO,
              letterSpacing: '0.06em',
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.15s ease',
            }}
          >
            {loading ? '⟳ იტვირთება...' : '↻ განახლება'}
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{
          padding: '20px',
          background: 'rgba(248,113,113,0.06)',
          border: '1px solid rgba(248,113,113,0.25)',
          borderRadius: '10px',
          color: 'rgba(248,113,113,0.9)',
          fontSize: '13px',
          textAlign: 'center',
          marginBottom: '20px',
        }}>
          ⚠ {error}
        </div>
      )}

      {/* ── Skeleton ── */}
      {loading && data.length === 0 && (
        <div style={gridStyle}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: '130px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '10px',
                animation: 'shimmer 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && filtered.length === 0 && !error && (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '13px',
        }}>
          ვალუტა ვერ მოიძებნა
        </div>
      )}

      {/* ── Currency grid ── */}
      {filtered.length > 0 && (
        <div style={gridStyle}>
          {filtered.map(c => (
            <CurrencyCard key={c.code} c={c} onClick={() => setSelected(c)} />
          ))}
        </div>
      )}

      {/* ── Detail modal ── */}
      {selected && (
        <CurrencyDetailModal
          currency={selected}
          onClose={() => setSelected(null)}
        />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.7; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// Currency card (grid item)
// ────────────────────────────────────────────────────────────────

function CurrencyCard({ c, onClick }: { c: NbgCurrency; onClick: () => void }) {
  const isUp   = c.diff < 0
  const isDown = c.diff > 0
  const isFlat = c.diff === 0
  const accentUp   = 'rgba(74,222,128,0.85)'
  const accentDown = 'rgba(248,113,113,0.85)'
  const accentFlat = 'rgba(255,255,255,0.3)'
  const accent = isUp ? accentUp : isDown ? accentDown : accentFlat
  const glow   = isUp
    ? 'rgba(74,222,128,0.06)'
    : isDown
    ? 'rgba(248,113,113,0.06)'
    : 'rgba(255,255,255,0.02)'

  return (
    <div
      className="glass-card"
      onClick={onClick}
      style={{
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = accent.replace('0.85', '0.35')
        e.currentTarget.style.boxShadow = `0 0 32px ${glow}`
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = ''
        e.currentTarget.style.boxShadow = ''
        e.currentTarget.style.transform = ''
      }}
    >
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '120px',
        height: '120px',
        background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FlagImg code={c.code} size={28} />
          <span style={{
            fontFamily: MONO,
            fontSize: '15px',
            fontWeight: 600,
            color: '#fff',
            letterSpacing: '0.05em',
          }}>
            {c.code}
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          borderRadius: '4px',
          background: isUp
            ? 'rgba(74,222,128,0.1)'
            : isDown
            ? 'rgba(248,113,113,0.1)'
            : 'rgba(255,255,255,0.04)',
          border: `1px solid ${isUp
            ? 'rgba(74,222,128,0.25)'
            : isDown
            ? 'rgba(248,113,113,0.25)'
            : 'rgba(255,255,255,0.08)'}`,
        }}>
          <span style={{ fontSize: '10px', color: accent }}>
            {isUp ? '▲' : isDown ? '▼' : '—'}
          </span>
          <span style={{
            fontFamily: MONO,
            fontSize: '10px',
            color: accent,
            fontWeight: 500,
          }}>
            {isFlat ? '0.0000' : Math.abs(c.diff).toFixed(4)}
          </span>
        </div>
      </div>

      <div style={{
        fontFamily: MONO,
        fontSize: '24px',
        fontWeight: 500,
        color: '#fff',
        lineHeight: 1,
        marginBottom: '6px',
        letterSpacing: '-0.5px',
        fontVariantNumeric: 'tabular-nums',
        position: 'relative',
      }}>
        {c.rateFormated}
        <span style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.4)',
          marginLeft: '5px',
          fontWeight: 400,
        }}>
          ₾
        </span>
      </div>

      <div style={{
        fontFamily: MONO,
        fontSize: '10px',
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: '0.04em',
        position: 'relative',
      }}>
        {c.quantity} {c.code}
      </div>
      <div style={{
        fontSize: '11px',
        color: 'rgba(255,255,255,0.28)',
        marginTop: '4px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        position: 'relative',
      }}>
        {c.name}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// Detail modal — history chart
// ────────────────────────────────────────────────────────────────

type HistoryPoint = { date: string; rate: number }

function CurrencyDetailModal({
  currency,
  onClose,
}: {
  currency: NbgCurrency
  onClose: () => void
}) {
  const [from, setFrom]         = useState(daysAgo(20))
  const [to, setTo]             = useState(todayStr())
  const [history, setHistory]   = useState<HistoryPoint[]>([])
  const [loading, setLoading]   = useState(false)
  const [hover, setHover]       = useState<number | null>(null)
  const cacheRef = useRef<Record<string, HistoryPoint[]>>({})

  const cacheKey = `${currency.code}|${from}|${to}`

  useEffect(() => {
    if (cacheRef.current[cacheKey]) {
      setHistory(cacheRef.current[cacheKey])
      return
    }
    let cancelled = false
    async function load() {
      setLoading(true)
      const dates = datesBetween(from, to)
      try {
        const results = await Promise.all(
          dates.map(d =>
            fetch(
              `https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/ka/json/?currencies=${currency.code}&date=${d}`,
              { cache: 'force-cache' }
            )
              .then(r => r.json() as Promise<NbgResponse>)
              .then(json => {
                const cur = json[0]?.currencies?.[0]
                return cur ? { date: d, rate: cur.rate } : null
              })
              .catch(() => null)
          )
        )
        if (cancelled) return
        // Dedupe by actual rate value (weekends return Friday's rate)
        const points: HistoryPoint[] = []
        const seen = new Set<string>()
        for (let i = 0; i < results.length; i++) {
          const r = results[i]
          if (!r) continue
          const key = dates[i]
          if (seen.has(key)) continue
          seen.add(key)
          points.push({ date: dates[i], rate: r.rate })
        }
        cacheRef.current[cacheKey] = points
        setHistory(points)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [cacheKey, currency.code, from, to])

  // ESC to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const isUp   = currency.diff < 0
  const isDown = currency.diff > 0
  const accent = isUp ? 'rgba(74,222,128,0.9)' : isDown ? 'rgba(248,113,113,0.9)' : 'rgba(108,142,255,0.9)'

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5,5,10,0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn 0.2s ease',
        overflowY: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '1000px',
          background: '#13131a',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
          padding: '28px 32px 32px',
          position: 'relative',
          animation: 'slideUp 0.28s ease',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
          }}
          title="დახურვა (Esc)"
        >
          ✕
        </button>

        {/* Header row: flag + code + name + rate + diff */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          paddingBottom: '22px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <FlagImg code={currency.code} size={40} />
            <div>
              <div style={{
                fontFamily: MONO,
                fontSize: '20px',
                fontWeight: 600,
                color: '#fff',
                letterSpacing: '0.04em',
                lineHeight: 1,
              }}>
                {currency.code}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.45)',
                marginTop: '6px',
              }}>
                {currency.quantity} {currency.name}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              fontFamily: MONO,
              fontSize: '32px',
              fontWeight: 500,
              color: '#fff',
              letterSpacing: '-0.5px',
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {currency.rateFormated}
              <span style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.4)',
                fontWeight: 400,
                marginLeft: '6px',
              }}>₾</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              background: isUp
                ? 'rgba(74,222,128,0.1)'
                : isDown
                ? 'rgba(248,113,113,0.1)'
                : 'rgba(255,255,255,0.04)',
              border: `1px solid ${accent.replace('0.9', '0.3')}`,
            }}>
              <span style={{ fontSize: '12px', color: accent }}>
                {isUp ? '▲' : isDown ? '▼' : '—'}
              </span>
              <span style={{
                fontFamily: MONO,
                fontSize: '12px',
                color: accent,
                fontWeight: 500,
              }}>
                {Math.abs(currency.diff).toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        {/* Date range */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={mutedLabel}>დან</label>
            <input
              type="date"
              value={from}
              max={to}
              onChange={e => setFrom(e.target.value)}
              style={ctrlInput}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={mutedLabel}>მდე</label>
            <input
              type="date"
              value={to}
              min={from}
              max={todayStr()}
              onChange={e => setTo(e.target.value)}
              style={ctrlInput}
            />
          </div>

          {/* Quick ranges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '220px' }}>
            <label style={mutedLabel}>სწრაფი არჩევანი</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { label: '7 დღე', days: 7 },
                { label: '20 დღე', days: 20 },
                { label: '30 დღე', days: 30 },
                { label: '90 დღე', days: 90 },
              ].map(preset => (
                <button
                  key={preset.days}
                  onClick={() => { setFrom(daysAgo(preset.days)); setTo(todayStr()) }}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '6px',
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '11px',
                    fontFamily: MONO,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(108,142,255,0.3)'
                    e.currentTarget.style.color = '#fff'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{
          background: 'rgba(255,255,255,0.015)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '10px',
          padding: '24px',
          minHeight: '340px',
          position: 'relative',
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '300px',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '13px',
              fontFamily: MONO,
            }}>
              <div style={{
                width: '28px', height: '28px',
                border: '2px solid rgba(255,255,255,0.1)',
                borderTopColor: accent,
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                marginRight: '12px',
              }} />
              ისტორიის მოტანა...
            </div>
          ) : history.length === 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '300px',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '13px',
            }}>
              მონაცემები ვერ მოიძებნა ამ პერიოდისთვის
            </div>
          ) : (
            <LineChart
              data={history}
              accent={accent}
              hover={hover}
              onHover={setHover}
            />
          )}
        </div>

        {/* Stats footer */}
        {history.length > 1 && !loading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            marginTop: '20px',
          }}>
            {(() => {
              const rates = history.map(h => h.rate)
              const min = Math.min(...rates)
              const max = Math.max(...rates)
              const first = rates[0]
              const last  = rates[rates.length - 1]
              const changeAbs = last - first
              const changePct = (changeAbs / first) * 100
              const changePos = changeAbs >= 0
              return (
                <>
                  <Stat label="მინიმუმი" value={min.toFixed(4) + ' ₾'} />
                  <Stat label="მაქსიმუმი" value={max.toFixed(4) + ' ₾'} />
                  <Stat label="საშუალო" value={(rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(4) + ' ₾'} />
                  <Stat
                    label="ცვლილება"
                    value={(changePos ? '+' : '') + changeAbs.toFixed(4) + ' / ' + (changePos ? '+' : '') + changePct.toFixed(2) + '%'}
                    color={changePos ? 'rgba(74,222,128,0.9)' : 'rgba(248,113,113,0.9)'}
                  />
                </>
              )
            })()}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// Line chart — pure SVG
// ────────────────────────────────────────────────────────────────

function LineChart({
  data,
  accent,
  hover,
  onHover,
}: {
  data: HistoryPoint[]
  accent: string
  hover: number | null
  onHover: (i: number | null) => void
}) {
  const width   = 920
  const height  = 300
  const padL    = 56
  const padR    = 20
  const padT    = 20
  const padB    = 48
  const innerW  = width - padL - padR
  const innerH  = height - padT - padB

  const rates = data.map(d => d.rate)
  const minR  = Math.min(...rates)
  const maxR  = Math.max(...rates)
  const range = maxR - minR || 1
  // Add 10% padding so line doesn't touch edges
  const yMin = minR - range * 0.1
  const yMax = maxR + range * 0.1
  const ySpan = yMax - yMin

  const xFor = (i: number) => padL + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
  const yFor = (r: number) => padT + innerH - ((r - yMin) / ySpan) * innerH

  // Grid: 5 horizontal lines
  const yTicks = 5
  const yGrid = Array.from({ length: yTicks + 1 }, (_, i) => {
    const r = yMin + (ySpan * i) / yTicks
    return { r, y: yFor(r) }
  })

  // X labels: max ~8 labels evenly spaced
  const maxLabels = Math.min(data.length, 8)
  const step = Math.max(1, Math.floor(data.length / maxLabels))
  const xLabels: { i: number; x: number; label: string }[] = []
  for (let i = 0; i < data.length; i += step) {
    xLabels.push({ i, x: xFor(i), label: formatShortDate(data[i].date) })
  }
  // Ensure last one is included
  if (xLabels[xLabels.length - 1]?.i !== data.length - 1) {
    const lastI = data.length - 1
    xLabels.push({ i: lastI, x: xFor(lastI), label: formatShortDate(data[lastI].date) })
  }

  // Line path
  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(d.rate)}`).join(' ')
  // Fill area
  const fillPath = `${linePath} L ${xFor(data.length - 1)} ${padT + innerH} L ${xFor(0)} ${padT + innerH} Z`

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * width
    if (px < padL || px > padL + innerW) { onHover(null); return }
    const i = Math.round(((px - padL) / innerW) * (data.length - 1))
    if (i >= 0 && i < data.length) onHover(i)
  }

  const accentFade = accent.replace(/[\d.]+\)$/, '0.15)')
  const accentVeryFade = accent.replace(/[\d.]+\)$/, '0.03)')

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ display: 'block' }}
      onMouseMove={handleMove}
      onMouseLeave={() => onHover(null)}
    >
      <defs>
        <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accentFade} />
          <stop offset="100%" stopColor={accentVeryFade} />
        </linearGradient>
      </defs>

      {/* Horizontal grid */}
      {yGrid.map((g, i) => (
        <g key={i}>
          <line
            x1={padL}
            y1={g.y}
            x2={padL + innerW}
            y2={g.y}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
          <text
            x={padL - 10}
            y={g.y + 4}
            textAnchor="end"
            fontSize="10"
            fontFamily="'DM Mono', monospace"
            fill="rgba(255,255,255,0.3)"
          >
            {g.r.toFixed(3)}
          </text>
        </g>
      ))}

      {/* Fill area under line */}
      <path d={fillPath} fill="url(#chart-fill)" />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={accent}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Data points */}
      {data.map((d, i) => (
        <circle
          key={i}
          cx={xFor(i)}
          cy={yFor(d.rate)}
          r={hover === i ? 5 : 3}
          fill="#13131a"
          stroke={accent}
          strokeWidth="2"
          style={{ transition: 'r 0.15s' }}
        />
      ))}

      {/* X axis labels */}
      {xLabels.map((l, i) => (
        <text
          key={i}
          x={l.x}
          y={padT + innerH + 22}
          textAnchor="middle"
          fontSize="9"
          fontFamily="'DM Mono', monospace"
          fill="rgba(255,255,255,0.35)"
          transform={`rotate(-28 ${l.x} ${padT + innerH + 22})`}
        >
          {l.label}
        </text>
      ))}

      {/* Hover tooltip */}
      {hover !== null && data[hover] && (
        <g>
          <line
            x1={xFor(hover)}
            y1={padT}
            x2={xFor(hover)}
            y2={padT + innerH}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          {(() => {
            const tx = xFor(hover)
            const ty = yFor(data[hover].rate)
            const boxW = 110
            const boxH = 44
            const boxX = tx + 12 + boxW > padL + innerW ? tx - boxW - 12 : tx + 12
            const boxY = Math.max(padT, ty - boxH / 2)
            return (
              <>
                <rect
                  x={boxX}
                  y={boxY}
                  width={boxW}
                  height={boxH}
                  rx="6"
                  fill="#0a0a10"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="1"
                />
                <text
                  x={boxX + 10}
                  y={boxY + 18}
                  fontSize="10"
                  fontFamily="'DM Mono', monospace"
                  fill="rgba(255,255,255,0.45)"
                >
                  {formatShortDate(data[hover].date)}
                </text>
                <text
                  x={boxX + 10}
                  y={boxY + 34}
                  fontSize="13"
                  fontFamily="'Instrument Serif', Georgia, serif"
                  fill="#fff"
                  fontWeight="500"
                >
                  {data[hover].rate.toFixed(4)} ₾
                </text>
              </>
            )
          })()}
        </g>
      )}
    </svg>
  )
}

// ────────────────────────────────────────────────────────────────
// Small bits
// ────────────────────────────────────────────────────────────────

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      padding: '12px 14px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '8px',
    }}>
      <div style={{
        fontFamily: MONO,
        fontSize: '9px',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.35)',
        marginBottom: '6px',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '13px',
        fontFamily: MONO,
        color: color || '#fff',
        fontWeight: 500,
      }}>
        {value}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// Shared styles
// ────────────────────────────────────────────────────────────────

const MONO = "'DM Mono', 'Courier New', monospace"
const SERIF = "'Instrument Serif', Georgia, serif"
const SANS = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

const mutedLabel: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: '9px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.35)',
}

const ctrlInput: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: '#fff',
  padding: '8px 12px',
  borderRadius: '6px',
  fontSize: '13px',
  fontFamily: MONO,
  colorScheme: 'dark',
  cursor: 'pointer',
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
  gap: '14px',
}
