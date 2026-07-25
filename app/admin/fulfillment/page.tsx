'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast, { Toaster } from 'react-hot-toast'
import { Package, Truck } from 'lucide-react'

interface OrderItem {
  name: string
  quantity: number
  unitAmount: number
}

interface FulfillmentOrder {
  id: string
  customerName: string
  address: string
  notes: string
  internalNotes: string
  total: number
  items: OrderItem[]
  status: string
  createdAt: number
}

export default function FulfillmentPage() {
  const [orders, setOrders] = useState<FulfillmentOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      const res = await fetch('/api/admin/fulfillment')
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function markAsShipped(orderId: string) {
    // Basic optimistic UI
    setOrders(prev => prev.filter(o => o.id !== orderId))
    const res = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, updates: { status: 'shipped' } }),
    })
    if (!res.ok) {
      toast.error('Failed to mark shipped')
      fetchOrders() // revert
    } else {
      toast.success('Order marked shipped!')
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading fulfillment...</div>
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <h2 className="text-2xl font-bold text-[#1C1C1C] mb-2">Fulfillment Queue Empty</h2>
          <p className="text-gray-500 mb-6">No orders currently ready for shipping.</p>
          <Link href="/admin" className="text-amber-600 font-semibold hover:underline">← Back to Admin</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <Toaster />
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <Link href="/admin" className="text-amber-600 text-sm font-semibold hover:underline mb-4 inline-block">← Back to Admin</Link>
            <h1 className="text-3xl font-bold text-[#1C1C1C] flex items-center gap-3">
              <Package className="w-8 h-8 text-amber-600" />
              Order Fulfillment
            </h1>
            <p className="text-gray-500 mt-1">Orders ready to pack and ship</p>
          </div>
          <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg text-sm font-bold border border-amber-200">
            {orders.length} Orders to Ship
          </div>
        </div>

        <div className="grid gap-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h3 className="font-bold text-lg text-[#1C1C1C]">{order.customerName}</h3>
                  <p className="text-sm text-gray-500 font-mono">Order #{order.id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => markAsShipped(order.id)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm"
                  >
                    <Truck className="w-4 h-4" /> Mark Shipped
                  </button>
                </div>
              </div>
              <div className="p-6 grid sm:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Shipping Address</h4>
                  <p className="text-sm text-[#1C1C1C] bg-gray-50 p-3 rounded border border-gray-100">
                    {order.address}
                  </p>
                  
                  {(order.notes || order.internalNotes) && (
                    <div className="mt-4 space-y-3">
                      {order.notes && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Customer Notes</h4>
                          <p className="text-sm bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-100">{order.notes}</p>
                        </div>
                      )}
                      {order.internalNotes && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Internal Notes</h4>
                          <p className="text-sm bg-blue-50 text-blue-800 p-2 rounded border border-blue-100">{order.internalNotes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Packing List</h4>
                  <ul className="space-y-2">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                        <span className="font-medium text-[#1C1C1C]">{item.name}</span>
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">x{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 text-right">
                    <Link href={`/admin/orders?id=${order.id}`} className="text-sm text-amber-600 hover:underline">
                      View full order details →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
