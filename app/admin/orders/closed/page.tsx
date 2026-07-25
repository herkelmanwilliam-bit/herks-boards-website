'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Package, Truck, MapPin, Mail, DollarSign, Clock, CheckCircle, X, RefreshCw, ArchiveX } from 'lucide-react'

type OrderStatus = 'new' | 'preparing' | 'shipped' | 'cancelled'

interface OrderItem { name: string; quantity: number; unitAmount: number }
interface Order {
  id: string; createdAt: number; shippedAt?: number; cancelledAt?: number
  status: OrderStatus; customerName: string; customerEmail: string
  address: string; internalNotes: string; trackingNumber?: string
  items: OrderItem[]; total: number; stripeSessionId: string
}
interface CustomerProfile {
  email: string; name: string
  orderCount: number; lifetimeValue: number
  firstOrderAt: number; lastOrderAt: number; orders: Order[]
}

function fmt(cents: number) { return `$${(cents / 100).toFixed(2)}` }
function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function ClosedOrdersPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'shipped' | 'cancelled'>('all')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/orders?status=closed&grouped=true')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setCustomers(data.customers ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function toggleCustomer(email: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(email) ? next.delete(email) : next.add(email)
      return next
    })
  }

  const filteredCustomers = customers
    .map(c => ({
      ...c,
      orders: c.orders
        .filter(o => filter === 'all' || o.status === filter)
        .sort((a, b) => {
          const t1 = a.shippedAt || a.cancelledAt || a.createdAt
          const t2 = b.shippedAt || b.cancelledAt || b.createdAt
          return t2 - t1
        }),
    }))
    .filter(c => {
      if (c.orders.length === 0) return false
      if (!search) return true
      const q = search.toLowerCase()
      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const totalClosed = filteredCustomers.reduce((s, c) => s + c.orders.length, 0)
  const totalRevenue = filteredCustomers.reduce((s, c) => s + c.orders.filter(o => o.status === 'shipped').reduce((o, r) => o + r.total, 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1C1C1C] border-b border-amber-900/20 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <Link href="/admin/orders" className="text-amber-500 hover:text-amber-400 text-sm">← Open Orders</Link>
            <h1 className="text-white font-bold text-xl">📦 Closed Orders</h1>
            <span className="bg-white/10 text-white/60 text-xs font-bold px-2 py-0.5 rounded-full">{totalClosed}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-amber-500 font-bold text-lg">{fmt(totalRevenue)}</div>
              <div className="text-white/40 text-xs">shipped revenue</div>
            </div>
            <button onClick={load} className="text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-6 pb-2 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search customer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-amber-500 w-48 shadow-sm"
        />
        <div className="flex gap-2">
          {(['all', 'shipped', 'cancelled'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f ? 'bg-amber-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:text-gray-800'}`}
            >
              {f === 'all' ? 'All' : f === 'shipped' ? '🚚 Shipped' : '❌ Cancelled'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-4">
        {loading && <div className="text-center py-20 text-gray-400">Loading...</div>}

        {!loading && filteredCustomers.length === 0 && (
          <div className="text-center py-20">
            <ArchiveX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No closed orders found.</p>
          </div>
        )}

        <div className="space-y-4">
          {filteredCustomers.map(customer => (
            <div key={customer.email} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleCustomer(customer.email)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg flex-shrink-0">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-[#1C1C1C] text-lg">{customer.name}</div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{customer.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-[#1C1C1C]">
                      {fmt(customer.orders.filter(o => o.status === 'shipped').reduce((s, o) => s + o.total, 0))} shipped
                    </div>
                    <div className="text-xs text-gray-400">{customer.orders.length} order{customer.orders.length !== 1 ? 's' : ''}</div>
                  </div>
                  {expanded.has(customer.email)
                    ? <ChevronUp className="w-5 h-5 text-gray-400" />
                    : <ChevronDown className="w-5 h-5 text-gray-400" />
                  }
                </div>
              </button>

              {expanded.has(customer.email) && (
                <div className="border-t border-gray-100">
                  <div className="px-6 py-3 bg-gray-50 flex flex-wrap gap-6 text-sm border-b border-gray-100">
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <DollarSign className="w-3.5 h-3.5" />
                      Total orders: <strong className="text-[#1C1C1C]">{customer.orderCount}</strong>
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <Clock className="w-3.5 h-3.5" />
                      First order: <strong className="text-[#1C1C1C]">{fmtDate(customer.firstOrderAt)}</strong>
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <Clock className="w-3.5 h-3.5" />
                      Last order: <strong className="text-[#1C1C1C]">{fmtDate(customer.lastOrderAt)}</strong>
                    </span>
                  </div>

                  {customer.orders.map((order, idx) => (
                    <div key={order.id} className={`px-6 py-5 ${idx < customer.orders.length - 1 ? 'border-b border-gray-100' : ''}`}>
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            {order.status === 'shipped'
                              ? <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-800"><Truck className="w-3 h-3" />Shipped</span>
                              : <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700"><X className="w-3 h-3" />Cancelled</span>
                            }
                            <span className="text-xs text-gray-400 font-mono">{order.id.slice(0, 18)}...</span>
                          </div>
                          <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                            <span>Ordered: {fmtDate(order.createdAt)}</span>
                            {order.status === 'shipped' && order.shippedAt && <span>Shipped: {fmtDate(order.shippedAt)}</span>}
                            {order.status === 'cancelled' && order.cancelledAt && <span>Cancelled: {fmtDate(order.cancelledAt)}</span>}
                            {order.address && (
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{order.address}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-600">{fmt(order.total)}</div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3 mb-3 border border-gray-100">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Items</div>
                        <div className="space-y-1">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-[#1C1C1C]"><span className="font-bold text-amber-700">{item.quantity}x</span> {item.name}</span>
                              <span className="text-gray-500 tabular-nums">{fmt(item.unitAmount * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {(order.internalNotes || order.trackingNumber) && (
                        <div className="mb-3 space-y-2">
                          {order.trackingNumber && (
                            <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2 text-xs text-green-800">
                              <span className="font-semibold">Tracking Number:</span> {order.trackingNumber}
                            </div>
                          )}
                          {order.internalNotes && (
                            <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-700">
                              <span className="font-semibold">Internal notes:</span> {order.internalNotes}
                            </div>
                          )}
                        </div>
                      )}

                      <a
                        href={`https://dashboard.stripe.com/payments/${order.stripeSessionId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-amber-600 hover:text-amber-800 font-medium transition-colors"
                      >
                        View in Stripe →
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
