import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getAllInventory, setInventory, batchSetInventory, InventoryItem, deleteDynamicProduct } from '@/lib/inventory'
import { products } from '@/lib/products'

export const dynamic = 'force-dynamic'

async function checkAuth() {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET() {
  const authError = await checkAuth()
  if (authError) return authError

  const productIds = products.map(p => p.id)
  const inventory = await getAllInventory(productIds)
  return NextResponse.json(inventory)
}

export async function POST(req: Request) {
  const authError = await checkAuth()
  if (authError) return authError

  const { productId, qty, published, price, image, description, name, category, isDynamic } = await req.json()
  if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 })

  const item: InventoryItem = {
    qty: qty !== undefined ? Number(qty) : -1,
    published: published !== undefined ? Boolean(published) : true,
    ...(price !== undefined && !isNaN(Number(price)) ? { price: Number(price) } : {}),
    ...(image !== undefined ? { image } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(name !== undefined ? { name } : {}),
    ...(category !== undefined ? { category } : {}),
    ...(isDynamic !== undefined ? { isDynamic } : {}),
  }

  await setInventory(productId, item)
  return NextResponse.json({ ok: true, productId, inventory: item })
}

export async function DELETE(req: Request) {
  const authError = await checkAuth()
  if (authError) return authError
  
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await deleteDynamicProduct(id)
  return NextResponse.json({ ok: true })
}
