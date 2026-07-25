// lib/geocode.ts
// Address -> {lat,lng} geocoding with durable caching in Upstash Redis.
//
// Default provider: OpenStreetMap Nominatim (free, no key). Usage policy:
//   - max 1 request/second, valid User-Agent, cache results (we do).
// If GOOGLE_MAPS_API_KEY is set, we use Google Geocoding instead (higher
// accuracy + throughput); otherwise we fall back to Nominatim.
//
// Cached results are keyed by normalized address and never expire (addresses
// don't move). Failed lookups are cached briefly to avoid hammering on bad data.

import { Redis } from '@upstash/redis'

export interface GeoResult {
  lat: number
  lng: number
}

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

function normalizeAddress(addr: string): string {
  return addr.trim().replace(/\s+/g, ' ').toLowerCase()
}

const CACHE_KEY = (addr: string) => `geo:${normalizeAddress(addr)}`
const NEG_TTL_SECONDS = 60 * 60 * 24 // re-try failed geocodes after a day

async function readCache(redis: Redis | null, addr: string): Promise<GeoResult | 'miss' | 'negative'> {
  if (!redis) return 'miss'
  const raw = await redis.get<string>(CACHE_KEY(addr))
  if (raw == null) return 'miss'
  const val = typeof raw === 'string' ? JSON.parse(raw) : raw
  if (val && val.failed) return 'negative'
  if (val && typeof val.lat === 'number' && typeof val.lng === 'number') {
    return { lat: val.lat, lng: val.lng }
  }
  return 'miss'
}

async function writeCache(redis: Redis | null, addr: string, result: GeoResult | null): Promise<void> {
  if (!redis) return
  if (result) {
    await redis.set(CACHE_KEY(addr), JSON.stringify(result))
  } else {
    await redis.set(CACHE_KEY(addr), JSON.stringify({ failed: true }), { ex: NEG_TTL_SECONDS })
  }
}

async function geocodeNominatim(addr: string): Promise<GeoResult | null> {
  const url =
    'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=' +
    encodeURIComponent(addr)
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'GGFarmsDeliveryRouter/1.0 (ggfarmsmn.com)',
      'Accept-Language': 'en-US',
    },
  })
  if (!res.ok) return null
  const data = (await res.json()) as Array<{ lat: string; lon: string }>
  if (!Array.isArray(data) || data.length === 0) return null
  const lat = parseFloat(data[0].lat)
  const lng = parseFloat(data[0].lon)
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null
  return { lat, lng }
}

async function geocodeGoogle(addr: string, key: string): Promise<GeoResult | null> {
  const url =
    'https://maps.googleapis.com/maps/api/geocode/json?address=' +
    encodeURIComponent(addr) +
    '&key=' +
    key
  const res = await fetch(url)
  if (!res.ok) return null
  const data = (await res.json()) as {
    status: string
    results: Array<{ geometry: { location: { lat: number; lng: number } } }>
  }
  if (data.status !== 'OK' || !data.results?.length) return null
  const loc = data.results[0].geometry.location
  return { lat: loc.lat, lng: loc.lng }
}

/** Small delay helper for Nominatim rate limit. */
function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * Geocode a single address (cache-first). Returns null if it cannot be resolved.
 */
export async function geocodeAddress(addr: string): Promise<GeoResult | null> {
  if (!addr || !addr.trim()) return null
  const redis = getRedis()
  const cached = await readCache(redis, addr)
  if (cached === 'negative') return null
  if (cached !== 'miss') return cached

  const googleKey = process.env.GOOGLE_MAPS_API_KEY
  let result: GeoResult | null = null
  try {
    result = googleKey
      ? await geocodeGoogle(addr, googleKey)
      : await geocodeNominatim(addr)
  } catch {
    result = null
  }
  await writeCache(redis, addr, result)
  return result
}

/**
 * Geocode many addresses. Uncached lookups via Nominatim are throttled to
 * ~1/sec per its usage policy; Google lookups can run without throttle.
 * Returns a map keyed by the ORIGINAL address string.
 */
export async function geocodeMany(addresses: string[]): Promise<Map<string, GeoResult | null>> {
  const redis = getRedis()
  const out = new Map<string, GeoResult | null>()
  const usingGoogle = Boolean(process.env.GOOGLE_MAPS_API_KEY)

  // De-duplicate while preserving mapping back to originals.
  const seen: Record<string, true> = {}
  const unique: string[] = []
  for (const a of addresses) {
    if (!seen[a]) {
      seen[a] = true
      unique.push(a)
    }
  }

  for (const addr of unique) {
    const cached = await readCache(redis, addr)
    if (cached === 'negative') {
      out.set(addr, null)
      continue
    }
    if (cached !== 'miss') {
      out.set(addr, cached)
      continue
    }
    // Not cached: fetch (throttle Nominatim).
    const r = await geocodeAddress(addr)
    out.set(addr, r)
    if (!usingGoogle) await sleep(1100)
  }

  return out
}
