import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getAllInventory, setInventory, batchSetInventory, InventoryItem } from '@/lib/inventory'
import { products } from '@/lib/products'

async function checkAuth() {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return null
}

// GET — fetch all inventory for the admin panel
export async function GET() {
  const authError = await checkAuth()
  if (authError) return authError

  const productIds = products.map(p => p.id)
  const inventory = await getAllInventory(productIds)
  return NextResponse.json(inventory)
}

// POST — update a single product's inventory
export async function POST(req: Request) {
  const authError = await checkAuth()
  if (authError) return authError

  const { productId, qty, published, price, image, description } = await req.json()
  if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 })

  const item: InventoryItem = {
    qty: qty !== undefined ? Number(qty) : -1,
    published: published !== undefined ? Boolean(published) : true,
    ...(price !== undefined && !isNaN(Number(price)) ? { price: Number(price) } : {}),
    ...(image !== undefined ? { image } : {}),
    ...(description !== undefined ? { description } : {}),
  }

  await setInventory(productId, item)
  return NextResponse.json({ ok: true, productId, inventory: item })
}

// PUT — batch update all inventory at once
export async function PUT(req: Request) {
  const authError = await checkAuth()
  if (authError) return authError

  const updates: Record<string, InventoryItem> = await req.json()
  await batchSetInventory(updates)
  return NextResponse.json({ ok: true, updated: Object.keys(updates).length })
}
