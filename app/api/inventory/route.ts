import { NextResponse } from 'next/server'
import { getAllInventory } from '@/lib/inventory'
import { products } from '@/lib/products'

// Public endpoint — shop page reads live stock on load
export async function GET() {
  const productIds = products.map(p => p.id)
  const inventory = await getAllInventory(productIds)
  return NextResponse.json(inventory)
}
