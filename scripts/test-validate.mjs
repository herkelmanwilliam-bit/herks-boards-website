// scripts/test-validate.mjs
// Tests the Google Address Validation API end-to-end with a few cases:
//  1. A real, complete Woodland Cove address (should verify/ACCEPT)
//  2. A messy/misspelled address (should suggest a correction)
//  3. A bare street line (should be unconfirmed or corrected)
// Uses GOOGLE_MAPS_API_KEY from .env.local.

import { readFileSync } from 'node:fs'
try {
  const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  for (const line of env.split('\n')) {
    const t = line.trim(); if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('='); if (eq === -1) continue
    const k = t.slice(0, eq).trim(); let v = t.slice(eq + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (!process.env[k]) process.env[k] = v
  }
} catch {}
const KEY = process.env.GOOGLE_MAPS_API_KEY
if (!KEY) { console.error('No GOOGLE_MAPS_API_KEY'); process.exit(2) }

async function validate(addr) {
  const url = 'https://addressvalidation.googleapis.com/v1:validateAddress?key=' + encodeURIComponent(KEY)
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: { regionCode: 'US', addressLines: addr.lines, locality: addr.city, administrativeArea: addr.state, postalCode: addr.zip }, enableUspsCass: true }),
  })
  const data = await res.json()
  return data
}

const cases = [
  { label: 'Complete Woodland Cove', lines: ['3746 Woodland Cove Parkway'], city: 'Minnetrista', state: 'MN', zip: '55331' },
  { label: 'Misspelled street',       lines: ['3746 Woodland Cv Pkway'],     city: 'Minnetrista', state: 'MN', zip: '55331' },
  { label: 'Missing zip',             lines: ['4717 Foxglove Drive'],        city: 'Minnetrista', state: 'MN', zip: '' },
]

for (const c of cases) {
  const d = await validate(c)
  const v = d.result?.verdict ?? {}
  const f = d.result?.address?.formattedAddress ?? '(none)'
  console.log(`\n[${c.label}]`)
  console.log('  possibleNextAction:', v.possibleNextAction)
  console.log('  addressComplete   :', v.addressComplete)
  console.log('  validationGranular:', v.validationGranularity)
  console.log('  formattedAddress  :', f)
  if (d.error) console.log('  ERROR:', JSON.stringify(d.error))
}
