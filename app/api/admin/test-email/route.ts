import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { sendOrderNotification, sendCustomerConfirmation } from '@/lib/email'

export async function POST() {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await sendOrderNotification({
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      phone: '612-555-0100',
      fulfillment: 'pickup',
      address: 'Farm Pickup — 700 County Road 92, Minnetrista MN',
      notes: 'This is a test order notification.',
      items: [
        { name: 'Cherry Tomatoes', quantity: 2, unitAmount: 500 },
        { name: 'Corinto Cucumbers', quantity: 3, unitAmount: 350 },
        { name: 'Farm Fresh Eggs — Dozen', quantity: 1, unitAmount: 700 },
      ],
      total: 2750,
      stripeSessionId: 'cs_test_TESTORDER123456',
    })
    // Also test customer confirmation — send to Scott's email so he can preview it
    await sendCustomerConfirmation({
      customerName: 'Scott Herkelman',
      customerEmail: 'sherkelman@gmail.com',
      phone: '612-555-0100',
      fulfillment: 'pickup',
      address: 'Farm Pickup — 700 County Road 92, Minnetrista MN',
      notes: 'This is a test order — checking customer confirmation email.',
      items: [
        { name: 'Cherry Tomatoes', quantity: 2, unitAmount: 500 },
        { name: 'Corinto Cucumbers', quantity: 3, unitAmount: 350 },
        { name: 'Farm Fresh Eggs — Dozen', quantity: 1, unitAmount: 700 },
      ],
      total: 2750,
      stripeSessionId: 'cs_test_TESTORDER123456',
    })

    return NextResponse.json({ ok: true, message: 'Both test emails sent! Check sherkelman@gmail.com for the customer confirmation preview.', data: result })
  } catch (err: any) {
    console.error('Test email error:', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
