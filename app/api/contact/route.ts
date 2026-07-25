import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json()
    const key = process.env.RESEND_API_KEY
    if (!key) return NextResponse.json({ error: 'Email service not configured.' }, { status: 500 })

    const resend = new Resend(key)
    
    await resend.emails.send({
      from: 'Herk\'s Boards <orders@herksboards.com>',
      to: ['info@herksboards.com', 'sherkelman@gmail.com'],
      subject: `New Contact Form Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      reply_to: email
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
