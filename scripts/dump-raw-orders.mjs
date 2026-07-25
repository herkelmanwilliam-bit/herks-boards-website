// scripts/dump-raw-orders.mjs
// LOCAL DIAGNOSTIC ONLY. Prints the raw stored fields for closed delivery
// orders so we can see exactly what the checkout captured (address, city,
// state, zip, and any separate fields). Runs only on Scott's machine against
// his own DB. Output stays local in this terminal.

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
const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
async function redis(cmd){const r=await fetch(URL_,{method:'POST',headers:{Authorization:`Bearer ${TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify(cmd)});return (await r.json()).result}

const ids=await redis(['ZRANGE','orders:closed',0,-1])
const orders=[]
for(const id of ids){const raw=await redis(['GET','order:'+id]);if(raw)orders.push(typeof raw==='string'?JSON.parse(raw):raw)}
const deliveries=orders.filter(o=>(o.fulfillment==='delivery'||o.fulfillment==='woodland-cove')&&o.status!=='cancelled')

console.log('=== RAW ORDER FIELDS (local only) ===\n')
console.log('Total closed:', orders.length, '| delivery-type:', deliveries.length, '\n')

// Show ALL top-level keys present on the first order so we see the schema.
if (orders[0]) {
  console.log('Top-level keys on a sample order:')
  console.log('  ' + Object.keys(orders[0]).sort().join(', '))
  console.log('')
}

let i=0
for(const o of deliveries){
  i++
  console.log(`--- Order #${i} (fulfillment=${o.fulfillment}) ---`)
  console.log('  address     :', JSON.stringify(o.address))
  // print any other location-ish fields if they exist
  for (const key of ['city','state','zip','zipcode','postalCode','addressLine2','line2','deliveryAddress','shippingAddress','notes']) {
    if (o[key] !== undefined) console.log(`  ${key.padEnd(12)}:`, JSON.stringify(o[key]))
  }
  console.log('')
}
