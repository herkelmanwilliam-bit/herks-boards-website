'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ChevronDown, ChevronUp, Package, Truck, MapPin, Mail,
  DollarSign, Clock, AlertCircle, CheckCircle, X, RefreshCw, FileText
} from 'lucide-react'

type OrderStatus = 'new' | 'preparing' | 'shipped' | 'cancelled'

interface OrderItem { name: string; quantity: number; unitAmount: number }
interface Order {
  id: string; createdAt: number; status: OrderStatus
  customerName: string; customerEmail: string
  address: string; internalNotes: string
  items: OrderItem[]; total: number; stripeSessionId: string
  trackingNumber?: string
}
interface CustomerProfile {
  email: string; name: string
  orderCount: number; lifetimeValue: number
  firstOrderAt: number; lastOrderAt: number; orders: Order[]
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  preparing: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
}
const STATUS_LABELS: Record<OrderStatus, string> = {
  new: '📥 New', preparing: '🪚 Building', shipped: '📦 Shipped', cancelled: '❌ Cancelled',
}

function fmt(cents: number) { return `$${(cents / 100).toFixed(2)}` }
function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function OpenOrdersPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState<string | null>(null)
  const [savedMsg, setSavedMsg] = useState<string | null>(null)
  const [cancelModal, setCancelModal] = useState<{ orderId: string; reason: string } | null>(null)
  const [localOrders, setLocalOrders] = useState<Record<string, Partial<Order>>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/orders?status=open&grouped=true')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setCustomers(data.customers ?? [])
    } catch (e: any) {
      setError(e.message)
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

  function patchLocal(orderId: string, field: string, value: string) {
    setLocalOrders(prev => ({ ...prev, [orderId]: { ...prev[orderId], [field]: value } }))
  }

  async function saveOrder(order: Order) {
    const patch = localOrders[order.id] ?? {}
    if (!Object.keys(patch).length) return
    setSaving(order.id)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error('Save failed')
      setLocalOrders(prev => { const n = { ...prev }; delete n[order.id]; return n })
      setSavedMsg(order.id)
      setTimeout(() => setSavedMsg(null), 2000)
      await load()
    } catch (e: any) {
      alert('Save failed: ' + e.message)
    } finally {
      setSaving(null)
    }
  }

  async function closeShipped(orderId: string) {
    setSaving(orderId)
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'shipped' }),
    })
    setSaving(null)
    await load()
  }

  async function confirmCancel() {
    if (!cancelModal) return
    setSaving(cancelModal.orderId)
    const existing = customers.flatMap(c => c.orders).find(o => o.id === cancelModal.orderId)?.internalNotes || ''
    await fetch(`/api/admin/orders/${cancelModal.orderId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        status: 'cancelled', 
        internalNotes: existing + `\n[CANCELLED: ${cancelModal.reason}]` 
      }),
    })
    setCancelModal(null)
    setSaving(null)
    await load()
  }

  function printPackingSlip(order: Order, customerName: string, customerEmail: string) {
    const dateStr = fmtDate(order.createdAt)
    const itemRows = order.items.map(item => `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;">${item.name}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${fmt(item.unitAmount)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;font-weight:600;">${fmt(item.unitAmount * item.quantity)}</td>
      </tr>`).join('')
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Packing Slip — ${customerName}</title>
  <meta charset="utf-8" />
  <style>
    @page { size: 4in 6in; margin: 0.3in; }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: Arial, sans-serif; }
    body { background: white; color: #1C1C1C; font-size: 11pt; }
    .header { text-align: center; border-bottom: 2px solid #b45309; padding-bottom: 8px; margin-bottom: 10px; }
    .logo { font-size: 18pt; font-weight: 900; color: #1C1C1C; letter-spacing: -0.5px; }
    .logo span { color: #b45309; }
    .customer { margin-bottom: 10px; padding: 8px; background: #f9fafb; border-radius: 6px; }
    .customer .name { font-size: 14pt; font-weight: 800; }
    .customer .meta { font-size: 9pt; color: #555; margin-top: 3px; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0; }
    thead th { background: #1C1C1C; color: #b45309; padding: 5px 8px; font-size: 9pt; text-align: left; }
    thead th:nth-child(2), thead th:nth-child(3), thead th:nth-child(4) { text-align: center; }
    thead th:nth-child(3), thead th:nth-child(4) { text-align: right; }
    tbody tr:nth-child(even) td { background: #fafafa; }
    .total-row { background: #f9fafb !important; }
    .total-row td { font-weight: 800; font-size: 13pt; padding: 8px; border-top: 2px solid #b45309; }
    .footer { margin-top: 10px; text-align: center; font-size: 8pt; color: #aaa; border-top: 1px solid #eee; padding-top: 6px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Herk's <span>Boards</span></div>
    <div style="font-size:8pt;color:#888;">Iowa, USA</div>
  </div>
  <div class="customer">
    <div class="name">${customerName}</div>
    <div class="meta">${customerEmail}</div>
    <div class="meta">${dateStr}</div>
  </div>
  <div style="margin: 6px 0; font-size: 10pt; font-weight: 700; padding: 3px 10px; background: #1C1C1C; color: white; border-radius: 4px;">
    Ship to: ${order.address}
  </div>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Each</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
      <tr class="total-row">
        <td colspan="3" style="text-align:right;padding:8px;">ORDER TOTAL</td>
        <td style="text-align:right;padding:8px;">${fmt(order.total)}</td>
      </tr>
    </tbody>
  </table>
  <div style="font-size: 8pt; color: #aaa; margin-top: 4px;">Order: ${order.id.slice(0, 24)}...</div>
  <div style="margin-top:14px;text-align:center;font-size:13pt;font-weight:900;color:#1C1C1C;line-height:1.6;">
    Thank you for your order!
  </div>
  <div class="footer">herksboards.com</div>
</body>
</html>`
    const w = window.open('', '_blank', 'width=480,height=680')
    if (!w) return
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => { w.print() }, 400)
  }

  const totalOpen = customers.reduce((s, c) => s + c.orders.length, 0)
  const totalValue = customers.reduce((s, c) => s + c.orders.reduce((o, r) => o + r.total, 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1C1C1C] border-b border-amber-900/20 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-amber-500 hover:text-amber-400 text-sm">← Admin</Link>
            <h1 className="text-white font-bold text-xl">📥 Open Orders</h1>
            <span className="bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalOpen}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-amber-500 font-bold text-lg">{fmt(totalValue)}</div>
              <div className="text-white/40 text-xs">total open value</div>
            </div>
            <button onClick={load} className="text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link href="/admin/orders/closed" className="bg-amber-500/20 text-amber-500 border border-amber-500/30 px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-500/30 transition-colors">
              View History →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading && <div className="text-center py-20 text-[#1C1C1C]/40">Loading orders...</div>}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />{error}
          </div>
        )}
        {!loading && customers.length === 0 && (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-[#1C1C1C]/20 mx-auto mb-4" />
            <p className="text-[#1C1C1C]/40 text-lg">No open orders right now.</p>
          </div>
        )}

        <div className="space-y-4">
          {customers.map(customer => (
            <div key={customer.email} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleCustomer(customer.email)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-[#1C1C1C] text-lg">{customer.name}</div>
                    <div className="flex items-center gap-3 text-sm text-[#1C1C1C]/50 mt-0.5">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{customer.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-[#1C1C1C]">{fmt(customer.lifetimeValue)} lifetime</div>
                    <div className="text-xs text-[#1C1C1C]/40">{customer.orderCount} total order{customer.orderCount !== 1 ? 's' : ''}</div>
                  </div>
                  <div className="bg-amber-100 text-amber-800 text-sm font-bold px-3 py-1 rounded-full border border-amber-200">
                    {customer.orders.length} open
                  </div>
                  {expanded.has(customer.email)
                    ? <ChevronUp className="w-5 h-5 text-[#1C1C1C]/40" />
                    : <ChevronDown className="w-5 h-5 text-[#1C1C1C]/40" />
                  }
                </div>
              </button>

              {expanded.has(customer.email) && (
                <div className="border-t border-gray-100">
                  <div className="px-6 py-3 bg-gray-50 flex flex-wrap gap-6 text-sm">
                    <span className="flex items-center gap-1.5 text-[#1C1C1C]/60">
                      <DollarSign className="w-3.5 h-3.5" />Lifetime: <strong className="text-[#1C1C1C]">{fmt(customer.lifetimeValue)}</strong>
                    </span>
                    <span className="flex items-center gap-1.5 text-[#1C1C1C]/60">
                      <Clock className="w-3.5 h-3.5" />First: <strong className="text-[#1C1C1C]">{fmtDate(customer.firstOrderAt)}</strong>
                    </span>
                    <span className="flex items-center gap-1.5 text-[#1C1C1C]/60">
                      <Package className="w-3.5 h-3.5" />Last: <strong className="text-[#1C1C1C]">{fmtDate(customer.lastOrderAt)}</strong>
                    </span>
                  </div>

                  {customer.orders.map((order, idx) => {
                    const local = localOrders[order.id] ?? {}
                    const currentStatus = (local.status ?? order.status) as OrderStatus
                    const isClosed = ['shipped', 'cancelled'].includes(currentStatus)
                    const isDirty = Object.keys(local).length > 0
                    return (
                      <div key={order.id} className={`px-6 py-5 ${idx < customer.orders.length - 1 ? 'border-b border-gray-100' : ''}`}>
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[currentStatus]}`}>
                                {STATUS_LABELS[currentStatus]}
                              </span>
                              <span className="text-xs text-[#1C1C1C]/40 font-mono">{order.id.slice(0, 18)}...</span>
                              <span className="text-xs text-[#1C1C1C]/40">{fmtDate(order.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-sm text-[#1C1C1C]/60">
                              <Truck className="w-3.5 h-3.5" />
                              <span>Ship to: {order.address}</span>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            <div className="text-xl font-bold text-amber-700">{fmt(order.total)}</div>
                            <button
                              onClick={() => printPackingSlip(order, customer.name, customer.email)}
                              className="bg-[#1C1C1C] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#333] transition-colors flex items-center gap-1"
                            >
                              🖨️ Packing Slip
                            </button>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Items Ordered</div>
                          <div className="space-y-2">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex items-center justify-between gap-2">
                                <span className="text-sm text-[#1C1C1C]">
                                  <span className="font-bold text-amber-700">{item.quantity}x</span> {item.name}
                                </span>
                                <span className="text-sm text-[#1C1C1C]/60 tabular-nums">
                                  {fmt(item.unitAmount * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3 mb-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#1C1C1C]/50 uppercase tracking-wide mb-1">Status</label>
                            <select
                              value={currentStatus}
                              onChange={e => patchLocal(order.id, 'status', e.target.value)}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-amber-500"
                            >
                              {(['new', 'preparing', 'shipped', 'cancelled'] as OrderStatus[]).map(s => (
                                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#1C1C1C]/50 uppercase tracking-wide mb-1">Tracking Number</label>
                            <input 
                              type="text"
                              value={local.trackingNumber ?? order.trackingNumber ?? ''}
                              onChange={e => patchLocal(order.id, 'trackingNumber', e.target.value)}
                              placeholder="e.g. 1Z9999999999999999"
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-xs font-semibold text-[#1C1C1C]/50 uppercase tracking-wide mb-1">
                            <FileText className="w-3 h-3 inline mr-1" />Internal Notes
                          </label>
                          <textarea
                            rows={2}
                            value={local.internalNotes ?? order.internalNotes ?? ''}
                            onChange={e => patchLocal(order.id, 'internalNotes', e.target.value)}
                            placeholder="Wood selection, dimensions, timeline..."
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-amber-500 resize-none"
                          />
                        </div>

                        {isDirty && (
                          <div className="mb-3 flex items-center gap-2">
                            <button
                              onClick={() => saveOrder(order)}
                              disabled={saving === order.id}
                              className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-700 disabled:opacity-60 transition-colors"
                            >
                              {saving === order.id ? 'Saving...' : '💾 Save Changes'}
                            </button>
                            {savedMsg === order.id && (
                              <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                <CheckCircle className="w-4 h-4" />Saved!
                              </span>
                            )}
                          </div>
                        )}

                        {!isClosed && (
                          <div className="border-t border-gray-100 pt-4 mt-2">
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Close Order</div>
                            <div className="flex flex-wrap gap-2 items-center">
                              <button
                                onClick={() => closeShipped(order.id)}
                                disabled={saving === order.id}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-60 transition-colors flex items-center gap-1"
                              >
                                <Truck className="w-4 h-4" /> Mark Shipped
                              </button>
                              <button
                                onClick={() => setCancelModal({ orderId: order.id, reason: '' })}
                                className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
                              >
                                <X className="w-3.5 h-3.5 inline mr-1" />Cancel
                              </button>
                              <a
                                href={`https://dashboard.stripe.com/payments/${order.stripeSessionId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-amber-600 hover:text-amber-800 transition-colors ml-auto font-semibold"
                              >
                                View in Stripe →
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-[#1C1C1C] mb-3">❌ Cancel Order</h3>
            <p className="text-[#1C1C1C]/60 text-sm mb-4">This will move the order to history as Cancelled. Reason (optional):</p>
            <textarea
              rows={3}
              value={cancelModal.reason}
              onChange={e => setCancelModal({ ...cancelModal, reason: e.target.value })}
              placeholder="e.g. Customer request"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setCancelModal(null)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                Keep Order
              </button>
              <button onClick={confirmCancel} disabled={saving !== null} className="flex-1 bg-red-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-red-700 disabled:opacity-60 transition-colors">
                {saving ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
