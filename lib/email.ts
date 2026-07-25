import { Resend } from 'resend'

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')
  return new Resend(key)
}

const NOTIFY_EMAILS = ['sherkelman@gmail.com'] // Update this to his actual email later

interface OrderItem {
  name: string
  quantity: number
  unitAmount: number
}

interface OrderNotificationParams {
  customerName: string
  customerEmail: string
  address: string
  items: OrderItem[]
  total: number
  stripeSessionId: string
}

export async function sendOrderNotification(params: OrderNotificationParams) {
  const {
    customerName,
    customerEmail,
    address,
    items,
    total,
    stripeSessionId,
  } = params

  const itemRows = items
    .map(
      item =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">$${(item.unitAmount / 100).toFixed(2)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">$${((item.unitAmount * item.quantity) / 100).toFixed(2)}</td>
        </tr>`
    )
    .join('')

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    
    <div style="background:#1C1C1C;padding:24px 32px;display:flex;align-items:center;">
      <div>
        <div style="color:#b45309;font-size:22px;font-weight:bold;">Herk's Boards</div>
        <div style="color:#aaa;font-size:13px;margin-top:4px;">New Order Received</div>
      </div>
    </div>

    <div style="padding:28px 32px;">
      <div style="margin-bottom:24px;">
        <span style="background:#b45309;color:#fff;font-weight:bold;padding:6px 14px;border-radius:20px;font-size:14px;">Shipment Required</span>
        <span style="margin-left:12px;color:#888;font-size:13px;">Order: ${stripeSessionId.slice(-8).toUpperCase()}</span>
      </div>

      <div style="background:#f9f9f9;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <div style="font-size:15px;font-weight:bold;color:#1C1C1C;margin-bottom:12px;">Customer</div>
        <table style="width:100%;font-size:14px;color:#444;border-collapse:collapse;">
          <tr><td style="padding:4px 0;width:100px;color:#888;">Name</td><td style="padding:4px 0;font-weight:bold;">${customerName}</td></tr>
          <tr><td style="padding:4px 0;color:#888;">Email</td><td style="padding:4px 0;">${customerEmail}</td></tr>
          <tr><td style="padding:4px 0;color:#888;">Ship To</td><td style="padding:4px 0;">${address}</td></tr>
        </table>
      </div>

      <div style="margin-bottom:24px;">
        <div style="font-size:15px;font-weight:bold;color:#1C1C1C;margin-bottom:12px;">Order Items</div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="text-align:left;padding:8px 12px;color:#666;font-weight:600;">Item</th>
              <th style="text-align:center;padding:8px 12px;color:#666;font-weight:600;">Qty</th>
              <th style="text-align:right;padding:8px 12px;color:#666;font-weight:600;">Each</th>
              <th style="text-align:right;padding:8px 12px;color:#666;font-weight:600;">Total</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding:12px;text-align:right;font-weight:bold;font-size:15px;color:#1C1C1C;">Order Total</td>
              <td style="padding:12px;text-align:right;font-weight:bold;font-size:15px;color:#b45309;">$${(total / 100).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style="text-align:center;padding-top:8px;border-top:1px solid #eee;">
        <a href="https://dashboard.stripe.com/payments" style="color:#b45309;font-size:13px;text-decoration:none;">View in Stripe Dashboard →</a>
      </div>
    </div>
  </div>
</body>
</html>
`

  const subject = `New Herk's Boards Order — ${customerName}`
  const resend = getResend()
  const { data, error } = await resend.emails.send({
    from: 'Herk\'s Boards Orders <orders@herksboards.com>', // Needs verified domain
    to: NOTIFY_EMAILS,
    subject,
    html,
  })

  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`)
  return data
}

export async function sendCustomerConfirmation(params: OrderNotificationParams) {
  const { customerName, customerEmail, address, items, total, stripeSessionId } = params
  if (!customerEmail) return

  const itemRows = items
    .map(
      item =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">$${(item.unitAmount / 100).toFixed(2)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">$${((item.unitAmount * item.quantity) / 100).toFixed(2)}</td>
        </tr>`
    )
    .join('')

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:#1C1C1C;padding:24px 32px;">
      <div style="color:#b45309;font-size:22px;font-weight:bold;">Herk's Boards</div>
      <div style="color:#aaa;font-size:13px;margin-top:4px;">Order Confirmation</div>
    </div>
    <div style="padding:28px 32px;">
      <h2 style="font-size:20px;color:#1C1C1C;margin:0 0 8px 0;">Thank you, ${customerName}!</h2>
      <p style="font-size:15px;color:#555;margin:0 0 24px 0;">We've received your order and are preparing your handcrafted items.</p>
      
      <div style="background:#f9f9f9;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <p style="font-size:14px;color:#444;margin:0;">Your order will be shipped to <strong>${address}</strong>. You will receive a tracking number once it ships.</p>
      </div>

      <div style="margin-bottom:24px;">
        <div style="font-size:15px;font-weight:bold;color:#1C1C1C;margin-bottom:12px;">Your Order</div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="text-align:left;padding:8px 12px;color:#666;font-weight:600;">Item</th>
              <th style="text-align:center;padding:8px 12px;color:#666;font-weight:600;">Qty</th>
              <th style="text-align:right;padding:8px 12px;color:#666;font-weight:600;">Each</th>
              <th style="text-align:right;padding:8px 12px;color:#666;font-weight:600;">Total</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding:12px;text-align:right;font-weight:bold;font-size:15px;color:#1C1C1C;">Order Total</td>
              <td style="padding:12px;text-align:right;font-weight:bold;font-size:15px;color:#b45309;">$${(total / 100).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin-bottom:8px;">
        <p style="font-size:14px;color:#555;margin:0;">Questions about your order? Reply to this email or contact us at <a href="mailto:info@herksboards.com" style="color:#b45309;">info@herksboards.com</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`

  const subject = `Your Herk's Boards order is confirmed — #${stripeSessionId.slice(-8).toUpperCase()}`
  const resend = getResend()
  const { data, error } = await resend.emails.send({
    from: 'Herk\'s Boards <orders@herksboards.com>',
    to: [customerEmail],
    subject,
    html,
  })

  if (error) throw new Error(`Resend customer email error: ${JSON.stringify(error)}`)
  return data
}
