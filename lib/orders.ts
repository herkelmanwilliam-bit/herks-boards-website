import { Redis } from '@upstash/redis'

function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (!url || !token) throw new Error('Redis not configured')
  return new Redis({ url, token })
}

export type OrderStatus = 'new' | 'preparing' | 'shipped' | 'cancelled'

export interface OrderItem {
  name: string
  quantity: number
  unitAmount: number // cents
}

export interface Order {
  id: string
  createdAt: number
  status: OrderStatus
  customerName: string
  customerEmail: string
  address: string
  notes?: string
  internalNotes: string
  items: OrderItem[]
  total: number // cents
  stripeSessionId: string
  shippedAt?: number
  cancelledAt?: number
  trackingNumber?: string
}

const ORDER_KEY = (id: string) => `order:${id}`
const OPEN_SET = 'orders:open'
const CLOSED_SET = 'orders:closed'

export async function saveOrder(order: Order): Promise<Order> {
  const redis = getRedis()
  await redis.set(ORDER_KEY(order.id), JSON.stringify(order))
  await redis.zadd(OPEN_SET, { score: order.createdAt, member: order.id })
  return order
}

export async function getOrder(id: string): Promise<Order | null> {
  const redis = getRedis()
  const raw = await redis.get<string>(ORDER_KEY(id))
  if (!raw) return null
  return typeof raw === 'string' ? JSON.parse(raw) : raw as Order
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
  const redis = getRedis()
  const order = await getOrder(id)
  if (!order) return null

  const wasOpen = !['shipped', 'cancelled'].includes(order.status)
  const updated: Order = { ...order, ...updates }
  const isNowClosed = ['shipped', 'cancelled'].includes(updated.status)

  await redis.set(ORDER_KEY(id), JSON.stringify(updated))

  if (wasOpen && isNowClosed) {
    const closedAt = Date.now()
    if (updated.status === 'shipped') updated.shippedAt = closedAt
    if (updated.status === 'cancelled') updated.cancelledAt = closedAt
    await redis.set(ORDER_KEY(id), JSON.stringify(updated))
    await redis.zrem(OPEN_SET, id)
    await redis.zadd(CLOSED_SET, { score: closedAt, member: id })
  } else if (!wasOpen && !isNowClosed) {
    await redis.zrem(CLOSED_SET, id)
    await redis.zadd(OPEN_SET, { score: updated.createdAt, member: id })
  }

  return updated
}

export async function getOpenOrders(): Promise<Order[]> {
  return getOrdersFromSet(OPEN_SET, 'desc')
}

export async function getClosedOrders(): Promise<Order[]> {
  return getOrdersFromSet(CLOSED_SET, 'desc')
}

async function getOrdersFromSet(setKey: string, dir: 'asc' | 'desc'): Promise<Order[]> {
  const redis = getRedis()
  let ids: string[]
  if (dir === 'desc') {
    ids = await redis.zrange(setKey, 0, -1, { rev: true })
  } else {
    ids = await redis.zrange(setKey, 0, -1)
  }
  if (!ids.length) return []

  const pipeline = redis.pipeline()
  for (const id of ids) pipeline.get(ORDER_KEY(id))
  const results = await pipeline.exec()

  return results
    .map((r: any) => {
      if (!r) return null
      return typeof r === 'string' ? JSON.parse(r) : r
    })
    .filter(Boolean) as Order[]
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
