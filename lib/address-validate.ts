// lib/address-validate.ts
// Server-side address validation via Google Address Validation API.
// Schema per https://developers.google.com/maps/documentation/address-validation
//
// Returns a normalized verdict our checkout UI can act on:
//   - status "verified": accept as-is
//   - status "corrected": Google suggests a standardized form (show "Did you mean?")
//   - status "unconfirmed": couldn't fully validate -> warn-and-allow + needsReview
//   - status "error": API/network problem -> warn-and-allow + needsReview (never block a sale)

export interface AddressInput {
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
}

export interface AddressValidationResult {
  status: 'verified' | 'corrected' | 'unconfirmed' | 'error'
  // The canonical single-line address to store (formatted by Google when available).
  formattedAddress: string
  // Suggested corrected address when status === 'corrected'.
  suggestion?: string
  lat?: number
  lng?: number
  // True when the order should be flagged for manual review in admin.
  needsReview: boolean
  // Raw signals for logging/debugging.
  possibleNextAction?: string
  validationGranularity?: string
  reason?: string
}

function inputToSingleLine(a: AddressInput): string {
  const line = [a.line1, a.line2].filter(Boolean).join(' ')
  return [line, a.city, a.state, a.zip].filter(Boolean).join(', ')
}

export async function validateAddress(input: AddressInput): Promise<AddressValidationResult> {
  const key = process.env.GOOGLE_MAPS_API_KEY
  const fallbackLine = inputToSingleLine(input)

  // No key configured: don't block checkout — warn-and-allow.
  if (!key) {
    return { status: 'error', formattedAddress: fallbackLine, needsReview: true, reason: 'no-api-key' }
  }

  const addressLines = [input.line1, input.line2].filter(Boolean) as string[]

  try {
    const res = await fetch(
      'https://addressvalidation.googleapis.com/v1:validateAddress?key=' + encodeURIComponent(key),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: {
            regionCode: 'US',
            addressLines,
            locality: input.city,
            administrativeArea: input.state,
            postalCode: input.zip,
          },
          enableUspsCass: true,
        }),
      }
    )

    if (!res.ok) {
      return { status: 'error', formattedAddress: fallbackLine, needsReview: true, reason: 'http-' + res.status }
    }

    const data = await res.json() as {
      result?: {
        verdict?: {
          possibleNextAction?: string
          addressComplete?: boolean
          validationGranularity?: string
          hasUnconfirmedComponents?: boolean
          hasInferredComponents?: boolean
          hasReplacedComponents?: boolean
        }
        address?: { formattedAddress?: string }
        geocode?: { location?: { latitude?: number; longitude?: number } }
      }
    }

    const r = data.result
    const verdict = r?.verdict ?? {}
    const formatted = r?.address?.formattedAddress || fallbackLine
    const loc = r?.geocode?.location
    const lat = typeof loc?.latitude === 'number' ? loc.latitude : undefined
    const lng = typeof loc?.longitude === 'number' ? loc.longitude : undefined
    const action = verdict.possibleNextAction

    // ACCEPT = clean, deliverable address.
    if (action === 'ACCEPT' && verdict.addressComplete) {
      return {
        status: 'verified',
        formattedAddress: formatted,
        lat, lng,
        needsReview: false,
        possibleNextAction: action,
        validationGranularity: verdict.validationGranularity,
      }
    }

    // FIX / CONFIRM / CONFIRM_ADD_SUBPREMISES = Google has a better/standardized
    // version — surface it as a suggestion for the customer to confirm.
    if (action === 'FIX' || action === 'CONFIRM' || action === 'CONFIRM_ADD_SUBPREMISES') {
      const changed = formatted && formatted.toLowerCase() !== fallbackLine.toLowerCase()
      return {
        status: changed ? 'corrected' : 'unconfirmed',
        formattedAddress: formatted,
        suggestion: changed ? formatted : undefined,
        lat, lng,
        // Unconfirmed (no clear suggestion) => flag for review. A confirmed
        // correction the customer accepts is not flagged.
        needsReview: !changed,
        possibleNextAction: action,
        validationGranularity: verdict.validationGranularity,
      }
    }

    // Anything else: couldn't confidently validate — warn-and-allow + review.
    return {
      status: 'unconfirmed',
      formattedAddress: formatted,
      lat, lng,
      needsReview: true,
      possibleNextAction: action,
      validationGranularity: verdict.validationGranularity,
    }
  } catch (e) {
    return { status: 'error', formattedAddress: fallbackLine, needsReview: true, reason: 'exception' }
  }
}
