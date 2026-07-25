// scripts/verify-fix.mjs
// Re-runs the real closed-order route test WITH the woodland-cove address
// normalizer applied. Prints PII-redacted results + per-stop distance-from-farm
// so we can confirm all stops now land near Minnetrista (a few miles out).

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

// normalizer (mirror of lib/address-normalize.ts)
function hasCityState(a){return /,\s*[A-Za-z]{2}\b/.test(a)||/\b(minnesota|MN)\b/i.test(a)||/\b\d{5}\b/.test(a)}
function normalize(address, fulfillment){
  const addr=(address||'').trim(); if(!addr)return addr
  if(fulfillment==='woodland-cove'){ if(/55331/.test(addr))return addr; return addr.replace(/[,\s]+$/,'')+', Minnetrista, MN 55331' }
  if(fulfillment==='delivery'){ if(hasCityState(addr))return addr; return addr.replace(/[,\s]+$/,'')+', Minnetrista, MN 55364' }
  return addr
}

const FARM={lat:44.9986,lng:-93.6558}, R=3958.7613, toRad=d=>d*Math.PI/180
function hav(a,b){const dLat=toRad(b.lat-a.lat),dLng=toRad(b.lng-a.lng);const h=Math.sin(dLat/2)**2+Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2;return 2*R*Math.asin(Math.min(1,Math.sqrt(h)))}
function mtx(p){const n=p.length,m=Array.from({length:n},()=>new Array(n).fill(0));for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const d=hav(p[i],p[j]);m[i][j]=d;m[j][i]=d}return m}
function td(o,m,dep=0){if(!o.length)return 0;let t=m[dep][o[0]];for(let i=0;i<o.length-1;i++)t+=m[o[i]][o[i+1]];return t+m[o[o.length-1]][dep]}
function nn(m,c,dep=0){const v=new Array(c+1).fill(false),o=[];let cur=dep;for(let s=0;s<c;s++){let b=-1,bd=Infinity;for(let x=1;x<=c;x++){if(v[x])continue;const d=m[cur][x];if(d<bd){bd=d;b=x}}o.push(b);v[b]=true;cur=b}return o}
function two(o,m,dep=0){const r=o.slice(),n=r.length;if(n<3)return r;const at=i=>(i<0||i>=n?dep:r[i]),d=(a,b)=>m[at(a)][at(b)];let im=true,g=0;while(im&&g<1000){im=false;g++;for(let i=0;i<n-1;i++)for(let k=i+1;k<n;k++){if(d(i-1,k)+d(i,k+1)+1e-9<d(i-1,i)+d(k,k+1)){let lo=i,hi=k;while(lo<hi){const t=r[lo];r[lo]=r[hi];r[hi]=t;lo++;hi--}im=true}}}return r}
function ccw(a,b,c){return (c.lng-a.lng)*(b.lat-a.lat)>(b.lng-a.lng)*(c.lat-a.lat)}
function crs(p1,p2,p3,p4){const s=(x,y)=>x.lat===y.lat&&x.lng===y.lng;if(s(p1,p3)||s(p1,p4)||s(p2,p3)||s(p2,p4))return false;return ccw(p1,p3,p4)!==ccw(p2,p3,p4)&&ccw(p1,p2,p3)!==ccw(p1,p2,p4)}
function crossings(pts){const e=[];for(let i=0;i<pts.length-1;i++)e.push([pts[i],pts[i+1]]);let c=0;for(let i=0;i<e.length;i++)for(let j=i+2;j<e.length;j++){if(i===0&&j===e.length-1)continue;if(crs(e[i][0],e[i][1],e[j][0],e[j][1]))c++}return c}

function normAddr(a){return a.trim().replace(/\s+/g,' ').toLowerCase()}
const sleep=ms=>new Promise(r=>setTimeout(r,ms))
async function geocode(addr,forceFresh){
  const key='geo:'+normAddr(addr)
  if(!forceFresh){const c=await redis(['GET',key]);if(c){const v=typeof c==='string'?JSON.parse(c):c;if(v&&!v.failed&&typeof v.lat==='number')return {lat:v.lat,lng:v.lng}}}
  const res=await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q='+encodeURIComponent(addr),{headers:{'User-Agent':'GGFarmsDeliveryRouter/1.0 (ggfarmsmn.com)','Accept-Language':'en-US'}})
  if(!res.ok)return null
  const d=await res.json();if(!Array.isArray(d)||!d.length){await redis(['SET',key,JSON.stringify({failed:true}),'EX','86400']);return null}
  const g={lat:parseFloat(d[0].lat),lng:parseFloat(d[0].lon)}
  if(Number.isNaN(g.lat)||Number.isNaN(g.lng))return null
  await redis(['SET',key,JSON.stringify(g)])
  return g
}

const ids=await redis(['ZRANGE','orders:closed',0,-1])
const orders=[]
for(const id of ids){const raw=await redis(['GET','order:'+id]);if(raw)orders.push(typeof raw==='string'?JSON.parse(raw):raw)}
const deliveries=orders.filter(o=>(o.fulfillment==='delivery'||o.fulfillment==='woodland-cove')&&o.status!=='cancelled'&&o.address)

console.log('=== VERIFY FIX: normalized woodland-cove addresses (PII redacted) ===\n')
const pts=[]; let bad=0, i=0
for(const o of deliveries){
  i++
  const full=normalize(o.address,o.fulfillment)
  const g=await geocode(full, true) // force fresh (old cache has garbage coords)
  if(!g){console.log(`#${i}: GEOCODE FAILED`);bad++;continue}
  const dist=hav(FARM,g)
  const flag=dist>40?'  <-- ⚠️ still too far':''
  console.log(`#${i}: ${g.lat.toFixed(4)},${g.lng.toFixed(4)} | ${dist.toFixed(1)} mi from farm${flag}`)
  pts.push(g)
  await sleep(1100)
}

if(pts.length>=2){
  const P=[FARM,...pts], m=mtx(P), c=pts.length
  const naive=Array.from({length:c},(_,x)=>x+1)
  const nmi=td(naive,m), npts=[FARM,...naive.map(x=>P[x]),FARM]
  const opt=two(nn(m,c),m), omi=td(opt,m), opts=[FARM,...opt.map(x=>P[x]),FARM]
  console.log('\n--- ROUTE ---')
  console.log('NAIVE:     ',nmi.toFixed(2),'mi |',crossings(npts),'crossings')
  console.log('OPTIMIZED: ',omi.toFixed(2),'mi |',crossings(opts),'crossings')
  console.log('SAVED:     ',(nmi-omi).toFixed(2),'mi (',(((nmi-omi)/nmi)*100).toFixed(1)+'% )')
  console.log('Order:', opt.join(' -> '))
}
console.log(bad>0?`\n⚠️ ${bad} failed`:'\n✅ all geocoded')
