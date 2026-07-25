import { NextResponse } from 'next/server'
import { getOpenOrders } from '@/lib/orders'

export async function GET() {
  try {
    const orders = await getOpenOrders()

    // Aggregate items across all open orders
    const itemsMap = new Map<string, { qty: number; orders: any[] }>()
    let totalItems = 0

    for (const order of orders) {
      // Exclude shipped/cancelled 
      if (order.status === 'shipped' || order.status === 'cancelled') continue

      for (const item of order.items) {
        if (!itemsMap.has(item.name)) {
          itemsMap.set(item.name, { qty: 0, orders: [] })
        }
        const state = itemsMap.get(item.name)!
        state.qty += item.quantity
        state.orders.push({
          orderId: order.id,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          qty: item.quantity,
          address: order.address,
          notes: order.notes,
          createdAt: order.createdAt
        })
        totalItems += item.quantity
      }
    }

    const itemMapList = Array.from(itemsMap.entries()).map(([name, data]) => ({
      name,
      qty: data.qty,
      orders: data.orders
    })).sort((a, b) => b.qty - a.qty)

    return NextResponse.json({
      totalOrders: orders.filter(o => o.status !== 'shipped' && o.status !== 'cancelled').length,
      totalItems,
      itemMap: itemMapList,
      generatedAt: Date.now()
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to generate build queue' }, { status: 500 })
  }
}
