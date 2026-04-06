/**
 * Shared HTTP helpers for API routes:
 *  - JSON body parsing with Zod
 *  - Uniform error + validation responses
 *  - Sentry capture + structured logging of failures
 */

import { NextResponse } from 'next/server'
import { ZodError, type ZodTypeAny, type z } from 'zod'
import { logger, serializeError } from './logger'

export class HttpError extends Error {
  status: number
  expose: boolean
  constructor(status: number, message: string, expose = true) {
    super(message)
    this.status = status
    this.expose = expose
  }
}

export async function parseJson<S extends ZodTypeAny>(
  request: Request,
  schema: S,
): Promise<z.infer<S>> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    throw new HttpError(400, 'არასწორი მოთხოვნა')
  }
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    const field = issue?.path.join('.') || 'body'
    throw new HttpError(400, `ვალიდაცია ვერ გაიარა: ${field} — ${issue?.message ?? 'არასწორი'}`)
  }
  return parsed.data
}

export function errorResponse(
  err: unknown,
  ctx: { route: string; userId?: string | null },
) {
  // Validation / known domain errors → 4xx, no Sentry noise.
  if (err instanceof HttpError) {
    logger.warn('api.client_error', {
      route: ctx.route,
      userId: ctx.userId ?? null,
      status: err.status,
      msg: err.message,
    })
    return NextResponse.json(
      { error: err.expose ? err.message : 'მოთხოვნა ვერ შესრულდა' },
      { status: err.status },
    )
  }

  if (err instanceof ZodError) {
    const issue = err.issues[0]
    logger.warn('api.validation_error', { route: ctx.route, issue })
    return NextResponse.json(
      { error: `ვალიდაცია ვერ გაიარა: ${issue?.path.join('.') || 'body'}` },
      { status: 400 },
    )
  }

  // Anything else is a real server fault — log + report.
  logger.error('api.server_error', {
    route: ctx.route,
    userId: ctx.userId ?? null,
    err: serializeError(err),
  })

  return NextResponse.json({ error: 'სერვერზე შეცდომა' }, { status: 500 })
}
