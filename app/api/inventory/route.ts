import { NextResponse } from 'next/server'
import { getAllInventory } from '@/lib/inventory'
import { products } from '@/lib/products'

export const dynamic = 'force-dynamic'

export async function GET() {
  const productIds = products.map(p => p.id)
  const inventory = await getAllInventory(productIds)
  return NextResponse.json(inventory)
}
