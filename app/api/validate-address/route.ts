import { NextResponse } from 'next/server'
import { validateAddress, type AddressInput } from '@/lib/address-validate'

// Public endpoint used by checkout to validate a customer address before payment.
// The Google API key stays server-side; the browser only sees the verdict.
export async function POST(req: Request) {
  let body: Partial<AddressInput>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ status: 'error', needsReview: true, reason: 'bad-json' }, { status: 400 })
  }

  const line1 = (body.line1 || '').trim()
  const city = (body.city || '').trim()
  const state = (body.state || '').trim()
  const zip = (body.zip || '').trim()

  if (!line1 || !city || !state || !zip) {
    return NextResponse.json(
      { status: 'error', needsReview: true, reason: 'missing-fields' },
      { status: 400 }
    )
  }

  const result = await validateAddress({
    line1,
    line2: (body.line2 || '').trim(),
    city,
    state,
    zip,
  })

  return NextResponse.json(result)
}
