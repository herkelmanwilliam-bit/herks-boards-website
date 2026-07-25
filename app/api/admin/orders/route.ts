import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getOpenOrders, getClosedOrders, saveOrder, updateOrder, Order } from '@/lib/orders'

export async function GET(req: Request) {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? 'open'
  const grouped = searchParams.get('grouped') === 'true'

  const orders = status === 'closed' ? await getClosedOrders() : await getOpenOrders()

  if (grouped) {
    const map = new Map<string, any>()
    for (const order of orders) {
      const key = order.customerEmail.toLowerCase()
      if (!map.has(key)) {
        map.set(key, {
          email: order.customerEmail,
          name: order.customerName,
          orderCount: 0,
          lifetimeValue: 0,
          firstOrderAt: order.createdAt,
          lastOrderAt: order.createdAt,
          orders: [],
        })
      }
      const profile = map.get(key)!
      profile.orderCount++
      profile.lifetimeValue += order.total
      if (order.createdAt < profile.firstOrderAt) profile.firstOrderAt = order.createdAt
      if (order.createdAt > profile.lastOrderAt) {
        profile.lastOrderAt = order.createdAt
        profile.name = order.customerName
      }
      profile.orders.push(order)
    }
    const customers = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
    return NextResponse.json({ customers })
  }

  return NextResponse.json({ orders })
}

export async function POST(req: Request) {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { customerName, customerEmail, address, internalNotes, items, total, stripeSessionId, createdAt, status } = body

  if (!customerName || !customerEmail || !items || total === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const id = stripeSessionId || `manual_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  const order = await saveOrder({
    id,
    createdAt: createdAt || Date.now(),
    customerName,
    customerEmail,
    address: address || '',
    internalNotes: internalNotes || '',
    items,
    total,
    stripeSessionId: id,
    status: 'new'
  })

  if (status === 'shipped' || status === 'cancelled') {
    await updateOrder(id, { status })
  }

  return NextResponse.json({ ok: true, order })
}
