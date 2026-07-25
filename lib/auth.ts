import { cookies } from 'next/headers'
import { createHmac } from 'crypto'

export const COOKIE_NAME = 'gg_admin_session'
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function getSecret(): string {
  return process.env.ADMIN_SECRET || 'change-me-please-set-ADMIN_SECRET'
}

function signToken(password: string): string {
  return createHmac('sha256', getSecret()).update(password).digest('hex')
}

export function validateCredentials(username: string, pass: string): boolean {
  const expectedU = process.env.ADMIN_USERNAME || 'wherk'
  const expectedP = process.env.ADMIN_PASSWORD || 'Abbyrules'
  return username === expectedU && pass === expectedP
}

export function createSessionToken(password: string): string {
  return signToken(password)
}

export function isValidToken(token: string): boolean {
  const expectedP = process.env.ADMIN_PASSWORD || 'Abbyrules'
  const expected = signToken(expectedP)
  return token === expected
}

export async function getAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get(COOKIE_NAME)
    if (!session?.value) return false
    return isValidToken(session.value)
  } catch {
    return false
  }
}
