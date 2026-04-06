/**
 * Transactional email via Resend.
 *
 * Uses a direct fetch to the Resend REST API so we don't need to add the SDK.
 * All failures are swallowed + logged: an email failure should never break
 * the originating business transaction.
 */

import { logger, serializeError } from './logger'

const RESEND_URL = 'https://api.resend.com/emails'

function getConfig() {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM || 'ASSISTANT.ge <noreply@assistant.ge>'
  return { apiKey, from }
}

async function send(opts: { to: string; subject: string; html: string; text: string }) {
  const { apiKey, from } = getConfig()
  if (!apiKey) {
    logger.warn('email.skipped', { reason: 'RESEND_API_KEY missing', to: opts.to })
    return { ok: false, skipped: true as const }
  }

  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      }),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      logger.error('email.failed', { to: opts.to, status: res.status, body: body.slice(0, 500) })
      return { ok: false as const, status: res.status }
    }

    logger.info('email.sent', { to: opts.to, subject: opts.subject })
    return { ok: true as const }
  } catch (err) {
    logger.error('email.exception', { to: opts.to, err: serializeError(err) })
    return { ok: false as const, error: err }
  }
}

// ── Templates ────────────────────────────────────────────────

const shell = (title: string, body: string) => `<!doctype html>
<html><body style="font-family:-apple-system,system-ui,sans-serif;background:#0f0f12;color:#e8e8f0;padding:24px;margin:0">
  <div style="max-width:520px;margin:0 auto;background:#16161c;border:1px solid #2a2a38;border-radius:10px;padding:28px">
    <h1 style="font-family:serif;font-size:22px;margin:0 0 16px">${title}</h1>
    ${body}
    <hr style="border:none;border-top:1px solid #2a2a38;margin:24px 0">
    <p style="font-size:11px;color:#55556a;margin:0">ASSISTANT.ge — ავტომატური შეტყობინება</p>
  </div>
</body></html>`

export function sendRequestApprovedEmail(to: string, fullName: string | null) {
  const name = fullName || 'მომხმარებელო'
  return send({
    to,
    subject: 'თქვენი მოთხოვნა დამტკიცდა — ASSISTANT.ge',
    html: shell(
      'მოთხოვნა დამტკიცდა ✓',
      `<p>გამარჯობა ${name},</p>
       <p>თქვენს ანგარიშს დაემატა <strong>1 კრედიტი</strong>. ახლა შეგიძლიათ შექმნათ ახალი ორგანიზაცია პანელიდან.</p>
       <p><a href="https://assistant.ge/dashboard" style="color:#6c8eff">პანელის გახსნა →</a></p>`,
    ),
    text: `გამარჯობა ${name}, თქვენს ანგარიშს დაემატა 1 კრედიტი. https://assistant.ge/dashboard`,
  })
}

export function sendRequestRejectedEmail(to: string, fullName: string | null) {
  const name = fullName || 'მომხმარებელო'
  return send({
    to,
    subject: 'თქვენი მოთხოვნა უარყოფილია — ASSISTANT.ge',
    html: shell(
      'მოთხოვნა უარყოფილია',
      `<p>გამარჯობა ${name},</p>
       <p>სამწუხაროდ, თქვენი ბოლო მოთხოვნა ვერ დამტკიცდა. დეტალებისთვის დაგვიკავშირდით.</p>`,
    ),
    text: `გამარჯობა ${name}, სამწუხაროდ, თქვენი ბოლო მოთხოვნა ვერ დამტკიცდა.`,
  })
}

export function sendOrgRenewedEmail(to: string, fullName: string | null, orgName: string) {
  const name = fullName || 'მომხმარებელო'
  return send({
    to,
    subject: `${orgName} — ვადა გახანგრძლივდა`,
    html: shell(
      'ორგანიზაცია განახლდა ✓',
      `<p>გამარჯობა ${name},</p>
       <p>ორგანიზაცია <strong>${orgName}</strong> წარმატებით განახლდა კიდევ 365 დღით.</p>`,
    ),
    text: `${orgName} განახლდა 365 დღით.`,
  })
}
