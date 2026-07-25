// scripts/test-real-orders.mjs
// Pulls REAL closed delivery orders from Upstash Redis, geocodes the addresses,
// runs the route optimizer, and prints a PII-REDACTED report.
//
// PRIVACY: This script NEVER prints customer names, addresses, emails, or phones.
// It prints only stop indices, per-stop distance, total miles, and crossings.
//
// Requires env: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
//   (read from .env.local or the shell environment)
//
// Run: node scripts/test-real-orders.mjs

import { readFileSync } from 'node:fs'

// ── Load .env.local if present ──
try {
  const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  for (const line of env.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const k = t.slice(0, eq).trim()
    let v = t.slice(eq + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (!process.env[k]) process.env[k] = v
  }
} catch { /* no .env.local */ }

const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
if (!URL_ || !TOKEN) {
  console.error('❌ Missing UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN. Add them to .env.local.')
  process.exit(2)
}

// ── Minimal Upstash REST client ──
async function redis(cmd) {
  const res = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  })
  if (!res.ok) throw new Error('Redis HTTP ' + res.status)
  const j = await res.json()
  return j.result
}

// ── Optimizer (mirror of lib/route-optimizer.ts) ──
const FARM = { lat: 44.9986, lng: -93.6558 }
const R = 3958.7613
const toRad = d => (d * Math.PI) / 180
function haversine(a, b) {
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}
function matrixOf(pts){const n=pts.length,m=Array.from({length:n},()=>new Array(n).fill(0));for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const d=haversine(pts[i],pts[j]);m[i][j]=d;m[j][i]=d}return m}
function tourDist(o,m,dep=0){if(!o.length)return 0;let t=m[dep][o[0]];for(let i=0;i<o.length-1;i++)t+=m[o[i]][o[i+1]];return t+m[o[o.length-1]][dep]}
function nn(m,cnt,dep=0){const vis=new Array(cnt+1).fill(false),ord=[];let cur=dep;for(let s=0;s<cnt;s++){let b=-1,bd=Infinity;for(let c=1;c<=cnt;c++){if(vis[c])continue;const d=m[cur][c];if(d<bd){bd=d;b=c}}ord.push(b);vis[b]=true;cur=b}return ord}
function twoOpt(o,m,dep=0){const r=o.slice(),n=r.length;if(n<3)return r;const at=i=>(i<0||i>=n?dep:r[i]),d=(a,b)=>m[at(a)][at(b)];let imp=true,g=0;while(imp&&g<1000){imp=false;g++;for(let i=0;i<n-1;i++)for(let k=i+1;k<n;k++){if(d(i-1,k)+d(i,k+1)+1e-9<d(i-1,i)+d(k,k+1)){let lo=i,hi=k;while(lo<hi){const t=r[lo];r[lo]=r[hi];r[hi]=t;lo++;hi--}imp=true}}}return r}
function ccw(a,b,c){return (c.lng-a.lng)*(b.lat-a.lat)>(b.lng-a.lng)*(c.lat-a.lat)}
function cross(p1,p2,p3,p4){const s=(x,y)=>x.lat===y.lat&&x.lng===y.lng;if(s(p1,p3)||s(p1,p4)||s(p2,p3)||s(p2,p4))return false;return ccw(p1,p3,p4)!==ccw(p2,p3,p4)&&ccw(p1,p2,p3)!==ccw(p1,p2,p4)}
function crossings(pts){const e=[];for(let i=0;i<pts.length-1;i++)e.push([pts[i],pts[i+1]]);let c=0;for(let i=0;i<e.length;i++)for(let j=i+2;j<e.length;j++){if(i===0&&j===e.length-1)continue;if(cross(e[i][0],e[i][1],e[j][0],e[j][1]))c++}return c}

// ── Geocode (Nominatim, cached in Redis geo: keys, same as lib/geocode.ts) ──
function normAddr(a){return a.trim().replace(/\s+/g,' ').toLowerCase()}
async function geocode(addr){
  const key = 'geo:'+normAddr(addr)
  const cached = await redis(['GET', key])
  if (cached) { const v = typeof cached==='string'?JSON.parse(cached):cached; if(v&&!v.failed&&typeof v.lat==='number')return {lat:v.lat,lng:v.lng} }
  const res = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q='+encodeURIComponent(addr),
    { headers: { 'User-Agent':'GGFarmsDeliveryRouter/1.0 (ggfarmsmn.com)','Accept-Language':'en-US' } })
  if (!res.ok) return null
  const data = await res.json()
  if (!Array.isArray(data)||!data.length) { await redis(['SET',key,JSON.stringify({failed:true}),'EX','86400']); return null }
  const g = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  if (Number.isNaN(g.lat)||Number.isNaN(g.lng)) return null
  await redis(['SET', key, JSON.stringify(g)])
  return g
}
const sleep = ms => new Promise(r=>setTimeout(r,ms))

// ── Pull closed delivery orders ──
console.log('Pulling closed orders from Redis…')
const ids = await redis(['ZRANGE','orders:closed',0,-1])
console.log('  closed order ids:', Array.isArray(ids)?ids.length:0)
if (!ids || !ids.length) { console.log('No closed orders found.'); process.exit(0) }

const orders = []
for (const id of ids) {
  const raw = await redis(['GET', 'order:'+id])
  if (!raw) continue
  const o = typeof raw==='string'?JSON.parse(raw):raw
  orders.push(o)
}

const deliveries = orders.filter(o => (o.fulfillment==='delivery'||o.fulfillment==='woodland-cove') && o.status!=='cancelled' && o.address)
console.log('  delivery-type closed orders w/ address:', deliveries.length)
if (!deliveries.length) { console.log('No closed DELIVERY orders with addresses to test.'); process.exit(0) }

// ── Geocode each (throttled) ──
console.log('Geocoding addresses (throttled ~1/sec)…')
const pts = []
let ungeocoded = 0
for (const o of deliveries) {
  const g = await geocode(o.address)
  if (g) pts.push(g)
  else { ungeocoded++; }
  await sleep(1100)
}
console.log('  geocoded:', pts.length, '| failed:', ungeocoded)
if (pts.length < 2) { console.log('Not enough geocoded stops to optimize.'); process.exit(0) }

// ── Optimize ──
const points = [FARM, ...pts]
const m = matrixOf(points)
const cnt = pts.length
const naive = Array.from({length:cnt},(_,i)=>i+1)
const naiveMi = tourDist(naive, m)
const naivePts = [FARM, ...naive.map(i=>points[i]), FARM]
const opt = twoOpt(nn(m,cnt), m)
const optMi = tourDist(opt, m)
const optPts = [FARM, ...opt.map(i=>points[i]), FARM]

console.log('\n=== REAL CLOSED-ORDER ROUTE TEST (PII redacted) ===')
console.log('Stops:', cnt, '(farm start+end)')
console.log('NAIVE (order-received):  ', naiveMi.toFixed(2), 'mi |', crossings(naivePts), 'crossings')
console.log('OPTIMIZED (NN+2-opt):    ', optMi.toFixed(2), 'mi |', crossings(optPts), 'crossings')
const saved = naiveMi-optMi
console.log('SAVED:', saved.toFixed(2), 'mi (', ((saved/naiveMi)*100).toFixed(1)+'% shorter )')
console.log('Optimized visiting order (stop # in naive list):', opt.join(' -> '))
console.log(ungeocoded>0 ? `\n⚠️ ${ungeocoded} address(es) failed geocoding — verify those manually.` : '\n✅ All addresses geocoded.')
