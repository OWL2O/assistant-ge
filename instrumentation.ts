// Next.js `instrumentation` hook — called once per runtime startup.
// We defer-import the Sentry config files so the edge bundle never
// pulls in the Node.js SDK.

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

// Re-export Sentry's request error hook so Next.js 15+ can pipe
// unhandled server errors straight into Sentry.
export { captureRequestError as onRequestError } from '@sentry/nextjs'
