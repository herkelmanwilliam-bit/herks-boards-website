import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { decrementInventory } from '@/lib/inventory'
import { sendOrderNotification, sendCustomerConfirmation } from '@/lib/email'
import { saveOrder } from '@/lib/orders'
import { Redis } from '@upstash/redis'

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

async function isAlreadyProcessed(eventId: string): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return false
  const key = `processed_event:${eventId}`
  const exists = await redis.exists(key)
  return exists === 1
}

async function markAsProcessed(eventId: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  const key = `processed_event:${eventId}`
  await redis.set(key, '1', { ex: 60 * 60 * 24 * 30 })
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    if (await isAlreadyProcessed(event.id)) {
      return NextResponse.json({ received: true, skipped: true })
    }
    await markAsProcessed(event.id)

    const session = event.data.object as Stripe.Checkout.Session
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items', 'line_items.data.price.product'],
    })

    const lineItems = fullSession.line_items?.data ?? []
    const shipping = fullSession.shipping_details?.address

    const formattedAddress = shipping 
      ? `${shipping.line1}${shipping.line2 ? ' ' + shipping.line2 : ''}, ${shipping.city}, ${shipping.state} ${shipping.postal_code}`
      : 'No shipping address provided'

    for (const item of lineItems) {
      const priceObj = item.price as any
      const productId = priceObj?.product_data?.metadata?.productId ?? priceObj?.product?.metadata?.productId
      if (productId && item.quantity) {
        await decrementInventory(productId, item.quantity)
      }
    }

    const emailItems = lineItems.map(item => ({
      name: item.description ?? 'Item',
      quantity: item.quantity ?? 1,
      unitAmount: item.price?.unit_amount ?? 0,
    }))

    const orderData = {
      customerName: fullSession.customer_details?.name ?? 'Customer',
      customerEmail: fullSession.customer_details?.email ?? '',
      address: formattedAddress,
      items: emailItems,
      total: fullSession.amount_total ?? 0,
      stripeSessionId: session.id,
    }

    try { await sendOrderNotification(orderData) } catch (err) { console.error('Notify error', err) }
    try { await sendCustomerConfirmation(orderData) } catch (err) { console.error('Confirm error', err) }
    
    try {
      await saveOrder({
        id: session.id,
        createdAt: Date.now(),
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        address: orderData.address,
        items: orderData.items,
        total: orderData.total,
        stripeSessionId: session.id,
        status: 'new',
        internalNotes: ''
      })
    } catch (orderErr) {
      console.error('Order save to Redis failed:', orderErr)
    }
  }

  return NextResponse.json({ received: true })
}
