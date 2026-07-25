import { NextResponse } from 'next/server'
import { validateCredentials, createSessionToken, COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/auth'

export async function POST(req: Request) {
  const { username, password } = await req.json()

  if (!validateCredentials(username, password)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = createSessionToken(password)
  const res = NextResponse.json({ ok: true })

  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })

  return res
}
