import { NextResponse } from 'next/server'
import { getOpenOrders } from '@/lib/orders'

export async function GET() {
  try {
    const orders = await getOpenOrders()
    
    // For woodworking, any open order that isn't shipped/cancelled is part of fulfillment 
    // We could filter by "status === 'ready'" or similar if they use a strict flow,
    // but for now we'll show all open orders in the fulfillment queue.
    const fulfillmentOrders = orders
      .filter(o => o.status !== 'shipped' && o.status !== 'cancelled')
      .map(o => ({
        id: o.id,
        customerName: o.customerName,
        address: o.address,
        notes: o.notes,
        internalNotes: o.internalNotes,
        total: o.total,
        items: o.items,
        status: o.status,
        createdAt: o.createdAt
      }))
      .sort((a, b) => a.createdAt - b.createdAt) // Oldest first

    return NextResponse.json({ orders: fulfillmentOrders })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to load fulfillment queue' }, { status: 500 })
  }
}
