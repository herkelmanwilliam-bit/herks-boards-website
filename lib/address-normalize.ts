// lib/address-normalize.ts
// Normalizes stored order addresses into full, geocodable strings.
//
// Why this exists: some fulfillment types capture only a street line (no
// city/state/zip) because the destination neighborhood is implied. A bare
// street line geocodes to random locations nationwide. We append the known
// city/state/zip based on fulfillment type so geocoding lands correctly.

export type Fulfillment = 'pickup' | 'delivery' | 'woodland-cove'

// Woodland Cove is a master-planned development in Minnetrista, MN 55331
// (west side of Lake Minnetonka, near Halstead Bay). Verified against public
// property listings + City of Minnetrista, July 2026.
const WOODLAND_COVE_SUFFIX = ', Minnetrista, MN 55331'

// Default local-delivery area suffix (used only if a delivery address clearly
// lacks a city/state — see hasCityState guard).
const LOCAL_DEFAULT_SUFFIX = ', Minnetrista, MN 55364'

/** Does the address already contain a US state abbreviation or a 5-digit zip? */
export function hasCityState(addr: string): boolean {
  if (!addr) return false
  const hasState = /,\s*[A-Za-z]{2}\b/.test(addr) || /\b(minnesota|MN)\b/i.test(addr)
  const hasZip = /\b\d{5}\b/.test(addr)
  return hasState || hasZip
}

/**
 * Return a geocodable address string for an order.
 * - woodland-cove: always anchor to the Woodland Cove neighborhood zip.
 * - delivery: only append a default suffix if the address is clearly missing
 *   city/state (so full addresses are left untouched).
 * - pickup: returned as-is (not routed).
 */
export function normalizeOrderAddress(address: string, fulfillment: Fulfillment): string {
  const addr = (address || '').trim()
  if (!addr) return addr

  if (fulfillment === 'woodland-cove') {
    // If somehow already fully qualified, don't double-append.
    if (/55331/.test(addr)) return addr
    return addr.replace(/[,\s]+$/, '') + WOODLAND_COVE_SUFFIX
  }

  if (fulfillment === 'delivery') {
    if (hasCityState(addr)) return addr
    return addr.replace(/[,\s]+$/, '') + LOCAL_DEFAULT_SUFFIX
  }

  return addr
}
