import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getClosedOrders } from '@/lib/orders'

export async function GET(req: Request) {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') ?? 'all'

  const allClosed = await getClosedOrders()
  // For woodworking, revenue is typically booked when "shipped"
  const shipped = allClosed.filter(o => o.status === 'shipped')

  const now = Date.now()
  const cutoffs: Record<string, number> = {
    week: now - 7 * 24 * 60 * 60 * 1000,
    month: now - 30 * 24 * 60 * 60 * 1000,
    quarter: now - 91 * 24 * 60 * 60 * 1000,
    year: now - 365 * 24 * 60 * 60 * 1000,
    all: 0,
  }
  const cutoff = cutoffs[period] ?? 0
  const filtered = shipped.filter(o => (o.shippedAt ?? o.createdAt) >= cutoff)

  const totalRevenue = filtered.reduce((s, o) => s + o.total, 0)
  const orderCount = filtered.length
  const avgOrder = orderCount ? Math.round(totalRevenue / orderCount) : 0

  // Revenue by product
  const productMap: Record<string, { revenue: number; qty: number; orders: number }> = {}
  for (const order of filtered) {
    for (const item of order.items) {
      if (!productMap[item.name]) productMap[item.name] = { revenue: 0, qty: 0, orders: 0 }
      productMap[item.name].revenue += item.unitAmount * item.quantity
      productMap[item.name].qty += item.quantity
      productMap[item.name].orders++
    }
  }
  const byProduct = Object.entries(productMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)

  // Revenue by month (all time for trend chart)
  const monthMap: Record<string, number> = {}
  for (const order of shipped) {
    const ts = order.shippedAt ?? order.createdAt
    const d = new Date(ts)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthMap[key] = (monthMap[key] ?? 0) + order.total
  }
  const byMonth = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }))

  // Revenue by week (for filtered period)
  const weekMap: Record<string, number> = {}
  for (const order of filtered) {
    const ts = order.shippedAt ?? order.createdAt
    const d = new Date(ts)
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    const key = weekStart.toISOString().slice(0, 10)
    weekMap[key] = (weekMap[key] ?? 0) + order.total
  }
  const byWeek = Object.entries(weekMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, revenue]) => ({ week, revenue }))

  // Top customers
  const customerMap: Record<string, { name: string; revenue: number; orders: number }> = {}
  for (const order of filtered) {
    const key = order.customerEmail.toLowerCase()
    if (!customerMap[key]) customerMap[key] = { name: order.customerName, revenue: 0, orders: 0 }
    customerMap[key].revenue += order.total
    customerMap[key].orders++
  }
  const topCustomers = Object.values(customerMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  // Product category groupings for Woodworking
  const categories: Record<string, string[]> = {
    'Standard Cutting Boards': ['Cutting Board', '8"x12"', 'Juice Groove', 'Rubber Feet', 'Chamfered'],
    'Decorative Plaques': ['Plaque', 'State', 'Iowa'],
    'Custom Builds': ['Custom', 'Build'],
  }

  const byCategory: Record<string, { revenue: number; qty: number }> = {}
  for (const { name, revenue, qty } of byProduct) {
    let cat = 'Other Woodworking'
    for (const [catName, keywords] of Object.entries(categories)) {
      if (keywords.some(k => name.toLowerCase().includes(k.toLowerCase()))) {
        cat = catName
        break
      }
    }
    if (!byCategory[cat]) byCategory[cat] = { revenue: 0, qty: 0 }
    byCategory[cat].revenue += revenue
    byCategory[cat].qty += qty
  }

  return NextResponse.json({
    period, totalRevenue, orderCount, avgOrder,
    byProduct, byMonth, byWeek, topCustomers,
    byCategory: Object.entries(byCategory)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.revenue - a.revenue),
  })
}
