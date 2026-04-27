import { randomBytes } from "crypto"

export function generateToken(): string {
  return randomBytes(32).toString("hex")
}

export const TOKEN_TTL = {
  VERIFY_EMAIL_MS: 24 * 60 * 60 * 1000,
  PASSWORD_RESET_MS: 60 * 60 * 1000,
} as const

export function expiryDate(ttlMs: number): Date {
  return new Date(Date.now() + ttlMs)
}
