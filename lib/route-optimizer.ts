// lib/route-optimizer.ts
// Self-contained delivery-route optimizer for GG Farms.
// No external API required: uses haversine (great-circle) distance +
// nearest-neighbor construction + 2-opt improvement to produce a route that
// starts and ends at the farm, minimizes total distance, and removes
// backtracking (path crossings).
//
// For a rural/suburban delivery spread this is ~95%+ of optimal and, most
// importantly, produces a sane stop order with no obvious back-and-forth.
// If a Google Routes API key is added later, swap the distance matrix for
// real driving distances — the solver below is agnostic to how the matrix
// is produced.

export interface GeoPoint {
  lat: number
  lng: number
}

export interface Waypoint extends GeoPoint {
  id: string
}

// GG Farms, 700 County Road 92, Maple Plain / Minnetrista, MN 55359
// Coordinates from the contact-page embed; used as the fixed depot.
export const FARM_POINT: GeoPoint = { lat: 44.9986, lng: -93.6558 }

const EARTH_RADIUS_MI = 3958.7613 // miles

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/** Great-circle distance in miles between two lat/lng points. */
export function haversineMiles(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.min(1, Math.sqrt(h)))
}

/**
 * Build a symmetric distance matrix for [depot, ...stops].
 * Index 0 is always the depot (farm).
 */
function buildMatrix(points: GeoPoint[]): number[][] {
  const n = points.length
  const m: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = haversineMiles(points[i], points[j])
      m[i][j] = d
      m[j][i] = d
    }
  }
  return m
}

/** Total distance of a closed tour depot->...->depot given an order of stop indices. */
function tourDistance(order: number[], matrix: number[][], depot = 0): number {
  if (order.length === 0) return 0
  let total = matrix[depot][order[0]]
  for (let i = 0; i < order.length - 1; i++) {
    total += matrix[order[i]][order[i + 1]]
  }
  total += matrix[order[order.length - 1]][depot]
  return total
}

/** Nearest-neighbor construction starting from the depot. */
function nearestNeighbor(matrix: number[][], stopCount: number, depot = 0): number[] {
  const visited: boolean[] = new Array(stopCount + 1).fill(false)
  const order: number[] = []
  let current = depot
  for (let step = 0; step < stopCount; step++) {
    let best = -1
    let bestDist = Infinity
    for (let candidate = 1; candidate <= stopCount; candidate++) {
      if (visited[candidate]) continue
      const d = matrix[current][candidate]
      if (d < bestDist) {
        bestDist = d
        best = candidate
      }
    }
    order.push(best)
    visited[best] = true
    current = best
  }
  return order
}

/**
 * 2-opt improvement: repeatedly reverse segments if doing so shortens the
 * closed tour. This is what eliminates crossings / backtracking. Runs until
 * no improving move is found or the iteration cap is hit.
 */
function twoOpt(order: number[], matrix: number[][], depot = 0): number[] {
  const route = order.slice()
  const n = route.length
  if (n < 3) return route

  // Helper: distance between two "nodes" where -1 sentinel = depot.
  const nodeAt = (idx: number): number => (idx < 0 || idx >= n ? depot : route[idx])
  const dist = (aIdx: number, bIdx: number): number =>
    matrix[nodeAt(aIdx)][nodeAt(bIdx)]

  let improved = true
  let guard = 0
  const maxIterations = 1000
  while (improved && guard < maxIterations) {
    improved = false
    guard++
    for (let i = 0; i < n - 1; i++) {
      for (let k = i + 1; k < n; k++) {
        // Edges being removed: (i-1, i) and (k, k+1)
        // Edges being added:   (i-1, k) and (i, k+1)
        const before = dist(i - 1, i) + dist(k, k + 1)
        const after = dist(i - 1, k) + dist(i, k + 1)
        if (after + 1e-9 < before) {
          // reverse segment [i..k]
          let lo = i
          let hi = k
          while (lo < hi) {
            const tmp = route[lo]
            route[lo] = route[hi]
            route[hi] = tmp
            lo++
            hi--
          }
          improved = true
        }
      }
    }
  }
  return route
}

export interface OptimizeResult {
  /** Stop ids in optimized visiting order (depot excluded). */
  orderedIds: string[]
  /** Total optimized closed-tour distance in miles (farm -> stops -> farm). */
  totalMiles: number
  /** Straight naive order distance in miles, for comparison. */
  naiveMiles: number
  /** Ids that had no coordinates and were appended at the end unoptimized. */
  ungeocodedIds: string[]
}

/**
 * Optimize a set of delivery stops.
 * - Stops with coordinates are optimized (NN + 2-opt) as a closed tour from the farm.
 * - Stops without coordinates (geocode failures) are appended at the end in their
 *   original order so nothing is silently dropped.
 */
export function optimizeRoute(
  stops: Array<{ id: string; lat?: number | null; lng?: number | null }>,
  depot: GeoPoint = FARM_POINT
): OptimizeResult {
  const geocoded = stops.filter(
    (s): s is { id: string; lat: number; lng: number } =>
      typeof s.lat === 'number' && typeof s.lng === 'number'
  )
  const ungeocoded = stops.filter(
    (s) => !(typeof s.lat === 'number' && typeof s.lng === 'number')
  )

  if (geocoded.length === 0) {
    return {
      orderedIds: stops.map((s) => s.id),
      totalMiles: 0,
      naiveMiles: 0,
      ungeocodedIds: ungeocoded.map((s) => s.id),
    }
  }

  const points: GeoPoint[] = [depot, ...geocoded.map((s) => ({ lat: s.lat, lng: s.lng }))]
  const matrix = buildMatrix(points)
  const stopCount = geocoded.length

  // Naive order = input order (indices 1..stopCount).
  const naiveOrder = Array.from({ length: stopCount }, (_, i) => i + 1)
  const naiveMiles = tourDistance(naiveOrder, matrix)

  // Construct + improve.
  const nn = nearestNeighbor(matrix, stopCount)
  const optimized = twoOpt(nn, matrix)
  const totalMiles = tourDistance(optimized, matrix)

  // Map matrix indices (1-based over geocoded) back to ids.
  const orderedIds = optimized.map((idx) => geocoded[idx - 1].id)

  return {
    orderedIds: [...orderedIds, ...ungeocoded.map((s) => s.id)],
    totalMiles,
    naiveMiles,
    ungeocodedIds: ungeocoded.map((s) => s.id),
  }
}
