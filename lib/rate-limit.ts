/**
 * Simple fixed-window rate limiter.
 *
 * Uses an in-memory Map suitable for a single Vercel Fluid Compute instance.
 * For multi-instance production, swap the `store` with Upstash Redis
 * (`@upstash/ratelimit` + `@upstash/redis`) — the consumer API stays the same.
 */

import { NextResponse } from 'next/server'

type Bucket = { count: number; resetAt: number }

const store = new Map<string, Bucket>()

// Janitor — evict stale buckets so the Map does not grow unbounded.
const EVICT_EVERY_MS = 60_000
let lastEvict = 0
function evict(now: number) {
  if (now - lastEvict < EVICT_EVERY_MS) return
  lastEvict = now
  for (const [k, v] of store) {
    if (v.resetAt <= now) store.delete(k)
  }
}

export type RateLimitResult = {
  ok: boolean
  remaining: number
  resetAt: number
  limit: number
}

export function rateLimit(opts: {
  key: string
  limit: number
  windowMs: number
}): RateLimitResult {
  const now = Date.now()
  evict(now)

  const bucket = store.get(opts.key)
  if (!bucket || bucket.resetAt <= now) {
    const fresh = { count: 1, resetAt: now + opts.windowMs }
    store.set(opts.key, fresh)
    return { ok: true, remaining: opts.limit - 1, resetAt: fresh.resetAt, limit: opts.limit }
  }

  bucket.count += 1
  const ok = bucket.count <= opts.limit
  return {
    ok,
    remaining: Math.max(0, opts.limit - bucket.count),
    resetAt: bucket.resetAt,
    limit: opts.limit,
  }
}

/** Best-effort client identifier: authenticated user id when available, else IP. */
export function clientKey(req: Request, userId?: string | null): string {
  if (userId) return `u:${userId}`
  const fwd = req.headers.get('x-forwarded-for')
  const ip = fwd?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'anon'
  return `ip:${ip}`
}

/** Build a standard 429 response with rate-limit headers. */
export function tooManyRequests(result: RateLimitResult) {
  const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))
  return NextResponse.json(
    { error: 'Too many requests. Please try again shortly.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
      },
    },
  )
}
