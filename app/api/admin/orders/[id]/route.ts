import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getOrder, updateOrder } from '@/lib/orders'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const order = await getOrder(params.id)
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ order })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const updates = await req.json()
  const order = await updateOrder(params.id, updates)
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ ok: true, order })
}
