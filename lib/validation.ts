import { z } from 'zod'

/**
 * Central Zod schemas for all API inputs.
 * Keep business-rule limits here so they stay in one place.
 */

export const LIMITS = {
  ORG_NAME_MAX: 50,
  ORG_NAME_MIN: 2,
  CREDIT_MAX: 100_000,
  CREDIT_MIN: 1,
  REQUEST_MESSAGE_MAX: 500,
  NOTE_MAX: 200,
} as const

// Strip control chars + trim, reject empty after trim
const cleanString = (max: number, min = 1) =>
  z
    .string()
    .transform((s) => s.replace(/[\u0000-\u001F\u007F]/g, '').trim())
    .pipe(z.string().min(min).max(max))

const uuid = z.string().uuid()

export const createOrgSchema = z.object({
  name: cleanString(LIMITS.ORG_NAME_MAX, LIMITS.ORG_NAME_MIN),
})

export const renameOrgSchema = z.object({
  orgId: uuid,
  name: cleanString(LIMITS.ORG_NAME_MAX, LIMITS.ORG_NAME_MIN),
})

export const createOrgRequestSchema = z.object({
  message: cleanString(LIMITS.REQUEST_MESSAGE_MAX, 0).optional().nullable(),
})

export const approveRequestSchema = z.object({
  requestId: uuid,
  action: z.enum(['approve', 'reject']),
})

export const grantCreditSchema = z.object({
  targetUserId: uuid,
  amount: z.coerce
    .number()
    .int()
    .min(LIMITS.CREDIT_MIN)
    .max(LIMITS.CREDIT_MAX),
  note: cleanString(LIMITS.NOTE_MAX, 0).optional().nullable(),
})

export const renewOrgSchema = z.object({
  orgId: uuid,
})

export type CreateOrgInput = z.infer<typeof createOrgSchema>
export type RenameOrgInput = z.infer<typeof renameOrgSchema>
export type CreateOrgRequestInput = z.infer<typeof createOrgRequestSchema>
export type ApproveRequestInput = z.infer<typeof approveRequestSchema>
export type GrantCreditInput = z.infer<typeof grantCreditSchema>
export type RenewOrgInput = z.infer<typeof renewOrgSchema>
