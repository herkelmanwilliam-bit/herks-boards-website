import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { sendOrderNotification, sendCustomerConfirmation } from '@/lib/email'

export async function POST() {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const orderData = {
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      address: '123 Test Street, Des Moines, IA',
      items: [
        { name: '8"x12" Cutting Board w/ Juice Groove', quantity: 2, unitAmount: 6000 },
        { name: 'Iowa State Plaque', quantity: 1, unitAmount: 4500 },
      ],
      total: 16500,
      stripeSessionId: 'cs_test_TESTORDER123456',
    }

    const result = await sendOrderNotification(orderData)
    
    // Test customer confirmation
    await sendCustomerConfirmation({
      ...orderData,
      customerEmail: 'Herkelmanwilliam@gmail.com', // Override to send the preview to him
      customerName: 'William Herkelman'
    })

    return NextResponse.json({ ok: true, message: 'Both test emails sent! Check Herkelmanwilliam@gmail.com for the customer confirmation preview.', data: result })
  } catch (err: any) {
    console.error('Test email error:', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
