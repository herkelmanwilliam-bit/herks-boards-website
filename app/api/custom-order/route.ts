import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const { name, email, details, dimensions, woodType, juiceGroove, engravingText, budget } = await req.json()
    const key = process.env.RESEND_API_KEY
    if (!key) return NextResponse.json({ error: 'Email service not configured.' }, { status: 500 })

    const resend = new Resend(key)
    
    await resend.emails.send({
      from: 'Herk\'s Boards <orders@herksboards.com>',
      to: ['info@herksboards.com', 'sherkelman@gmail.com'],
      subject: `New Custom Build Request from ${name}`,
      text: `
Name: ${name}
Email: ${email}

--- BUILD DETAILS ---
Dimensions: ${dimensions || 'Not specified'}
Wood Type: ${woodType}
Juice Groove: ${juiceGroove ? 'Yes' : 'No'}
Engraving: ${engravingText || 'None'}
Budget: ${budget || 'Not specified'}

--- PROJECT DESCRIPTION ---
${details}
      `.trim(),
      replyTo: email
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
