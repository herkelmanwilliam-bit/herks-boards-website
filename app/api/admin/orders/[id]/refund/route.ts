import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getAdminSession } from '@/lib/auth'
import { getOrder, updateOrder } from '@/lib/orders'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const order = await getOrder(params.id)
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const { amountCents, reason, full } = await req.json()
  // amountCents: number (partial refund in cents), or full: true for 100%

  try {
    // Look up the Stripe PaymentIntent from the checkout session
    const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId)
    const paymentIntentId = session.payment_intent as string

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'No payment intent found for this order' }, { status: 400 })
    }

    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
      reason: 'requested_by_customer',
    }

    if (!full && amountCents) {
      refundParams.amount = amountCents // partial refund
    }
    // If full=true, omit amount → Stripe refunds 100%

    const refund = await stripe.refunds.create(refundParams)

    const refundedAmount = refund.amount // cents
    const isFullRefund = refundedAmount >= order.total

    // Update order notes + status
    const refundNote = `[REFUND ${new Date().toLocaleDateString()}] ${full || isFullRefund ? 'Full' : 'Partial'} refund of $${(refundedAmount / 100).toFixed(2)} — ${reason || 'No reason provided'}. Stripe refund ID: ${refund.id}`
    const existingNotes = order.internalNotes ? order.internalNotes + '\n' : ''

    await updateOrder(params.id, {
      internalNotes: existingNotes + refundNote,
      ...(isFullRefund ? { status: 'cancelled', cancelReason: reason || 'Refunded' } : {}),
    })

    return NextResponse.json({
      ok: true,
      refundId: refund.id,
      amountRefunded: refundedAmount,
      full: isFullRefund,
    })
  } catch (err: any) {
    console.error('Refund error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
