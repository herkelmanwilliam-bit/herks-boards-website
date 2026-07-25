import { Redis } from '@upstash/redis'

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

export interface InventoryItem {
  qty: number
  published: boolean
  price?: number
  image?: string
  description?: string
  name?: string
  category?: string
  isDynamic?: boolean
}

const KEY = (id: string) => `inv:${id}`
const DYNAMIC_SET = 'products:dynamic'

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

export async function getAllInventory(staticProductIds: string[] = []): Promise<Record<string, InventoryItem>> {
  const redis = getRedis()
  if (!redis) {
    return Object.fromEntries(staticProductIds.map(id => [id, { qty: -1, published: true }]))
  }
  try {
    const dynamicIds = await redis.smembers(DYNAMIC_SET) || []
    const allIds = Array.from(new Set([...staticProductIds, ...dynamicIds]))
    
    if (allIds.length === 0) return {}

    const pipeline = redis.pipeline()
    for (const id of allIds) {
      pipeline.get(KEY(id))
    }
    const results = await pipeline.exec()
    
    const entries = allIds.map((id, index) => {
      const inv = results[index] as InventoryItem | null
      return [id, inv ?? { qty: -1, published: true }]
    })
    return Object.fromEntries(entries)
  } catch (e) {
    console.error(e)
    return Object.fromEntries(staticProductIds.map(id => [id, { qty: -1, published: true }]))
  }
}

export async function setInventory(productId: string, item: InventoryItem): Promise<void> {
  const redis = getRedis()
  if (!redis) throw new Error('Redis not configured')
  await redis.set(KEY(productId), item)
  if (item.isDynamic) {
    await redis.sadd(DYNAMIC_SET, productId)
  }
}

export async function deleteDynamicProduct(productId: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  await redis.del(KEY(productId))
  await redis.srem(DYNAMIC_SET, productId)
}

export async function batchSetInventory(updates: Record<string, InventoryItem>): Promise<void> {
  await Promise.all(
    Object.entries(updates).map(([id, item]) => setInventory(id, item))
  )
}

export async function decrementInventory(productId: string, qty: number): Promise<void> {
  const current = await getInventory(productId)
  if (current.qty === -1) return
  const newQty = Math.max(0, current.qty - qty)
  await setInventory(productId, { ...current, qty: newQty })
}

export function isInStock(item: InventoryItem): boolean {
  return item.published && (item.qty === -1 || item.qty > 0)
}
