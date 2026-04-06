/**
 * Structured JSON logger.
 * Vercel + most log aggregators parse stdout JSON automatically.
 * Errors are mirrored into Sentry when the SDK is loaded.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

type LogFields = Record<string, unknown>

function emit(level: LogLevel, msg: string, fields: LogFields = {}) {
  const line = {
    level,
    time: new Date().toISOString(),
    msg,
    ...fields,
  }
  const out = JSON.stringify(line)
  if (level === 'error') console.error(out)
  else if (level === 'warn') console.warn(out)
  else console.log(out)
}

export const logger = {
  debug: (msg: string, fields?: LogFields) => emit('debug', msg, fields),
  info: (msg: string, fields?: LogFields) => emit('info', msg, fields),
  warn: (msg: string, fields?: LogFields) => emit('warn', msg, fields),
  error: (msg: string, fields?: LogFields) => emit('error', msg, fields),

  /** Attach a permanent context to all subsequent logs on the returned child. */
  child(base: LogFields) {
    return {
      debug: (msg: string, f?: LogFields) => emit('debug', msg, { ...base, ...f }),
      info: (msg: string, f?: LogFields) => emit('info', msg, { ...base, ...f }),
      warn: (msg: string, f?: LogFields) => emit('warn', msg, { ...base, ...f }),
      error: (msg: string, f?: LogFields) => emit('error', msg, { ...base, ...f }),
    }
  },
}

/** Serialize an unknown thrown value into something safe for structured logs. */
export function serializeError(e: unknown) {
  if (e instanceof Error) {
    return { name: e.name, message: e.message, stack: e.stack }
  }
  return { message: String(e) }
}
