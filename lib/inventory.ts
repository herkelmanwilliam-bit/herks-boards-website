import { Redis } from '@upstash/redis'

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

export interface InventoryItem {
  qty: number       // -1 = unlimited/always in stock, 0 = sold out, N = N remaining
  published: boolean // false = hidden from shop
  price?: number    // optional price override; if absent, uses products.ts default
}

const KEY = (id: string) => `inv:${id}`

export async function getInventory(productId: string): Promise<InventoryItem> {
  const redis = getRedis()
  if (!redis) return { qty: -1, published: true }
  try {
    const item = await redis.get<InventoryItem>(KEY(productId))
    return item ?? { qty: -1, published: true }
  } catch {
    return { qty: -1, published: true }
  }
}

export async function getAllInventory(productIds: string[]): Promise<Record<string, InventoryItem>> {
  const redis = getRedis()
  if (!redis) {
    return Object.fromEntries(productIds.map(id => [id, { qty: -1, published: true }]))
  }
  try {
    const entries = await Promise.all(
      productIds.map(async (id) => {
        const inv = await getInventory(id)
        return [id, inv] as [string, InventoryItem]
      })
    )
    return Object.fromEntries(entries)
  } catch {
    return Object.fromEntries(productIds.map(id => [id, { qty: -1, published: true }]))
  }
}

export async function setInventory(productId: string, item: InventoryItem): Promise<void> {
  const redis = getRedis()
  if (!redis) throw new Error('Redis not configured — set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN')
  await redis.set(KEY(productId), item)
}

export async function batchSetInventory(updates: Record<string, InventoryItem>): Promise<void> {
  await Promise.all(
    Object.entries(updates).map(([id, item]) => setInventory(id, item))
  )
}

export async function decrementInventory(productId: string, qty: number): Promise<void> {
  const current = await getInventory(productId)
  if (current.qty === -1) return // unlimited — no decrement needed
  const newQty = Math.max(0, current.qty - qty)
  await setInventory(productId, { ...current, qty: newQty })
}

export function isInStock(item: InventoryItem): boolean {
  return item.published && (item.qty === -1 || item.qty > 0)
}
