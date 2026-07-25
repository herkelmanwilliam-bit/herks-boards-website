'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface BuildOrder {
  customerName: string
  customerEmail: string
  qty: number
  address: string
  orderId: string
  notes: string
  createdAt: number
}

interface BuildItem {
  name: string
  qty: number
  orders: BuildOrder[]
}

interface BuildQueueData {
  totalOrders: number
  totalItems: number
  itemMap: BuildItem[]
  generatedAt: number
}

export default function BuildQueuePage() {
  const [data, setData] = useState<BuildQueueData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/build-queue')
      .then(r => r.json())
      .then(json => {
        setData(json)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading build queue...</div>
  }

  if (!data || data.totalOrders === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-sm shadow-sm border border-gray-100 p-10 text-center">
          <h2 className="text-2xl font-bold text-[#0f172a] mb-2">Build Queue Empty</h2>
          <p className="text-gray-500 mb-6">No open orders currently require building.</p>
          <Link href="/admin" className="text-slate-500 font-semibold hover:underline">← Back to Admin</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Print Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Link href="/admin" className="text-slate-500 text-sm font-semibold hover:underline mb-4 inline-block print:hidden">← Back to Admin</Link>
            <h1 className="text-3xl font-bold text-[#0f172a]">Shop Build Queue</h1>
            <p className="text-gray-500 text-sm mt-1">Generated {new Date(data.generatedAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-slate-50 text-slate-700 px-4 py-2 rounded-sm text-sm font-bold border border-slate-100">
              {data.totalItems} Items to Build ({data.totalOrders} Orders)
            </div>
            <button onClick={handlePrint} className="bg-[#0f172a] text-white px-4 py-2 rounded-sm text-sm font-semibold hover:bg-gray-800 print:hidden shadow-sm">
              🖨️ Print Queue
            </button>
          </div>
        </div>

        {/* Print Layout */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 print:shadow-none print:border-0 print:bg-transparent">
          {data.itemMap.map((item, index) => (
            <div key={item.name} className={`p-6 ${index > 0 ? 'border-t border-gray-100 print:break-inside-avoid' : ''}`}>
              <div className="flex justify-between items-end mb-4 bg-gray-50 p-3 rounded-sm border border-gray-100">
                <h3 className="text-lg font-bold text-[#0f172a]">{item.name}</h3>
                <div className="text-xl font-black text-slate-600 bg-slate-50 px-3 py-1 rounded border border-slate-100">
                  {item.qty}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="pb-2 w-12 text-center">Done</th>
                      <th className="pb-2 font-semibold">Order</th>
                      <th className="pb-2 font-semibold text-center">Qty</th>
                      <th className="pb-2 font-semibold">Customer</th>
                      <th className="pb-2 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {item.orders.map((order, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="py-3 text-center">
                          <div className="w-5 h-5 border-2 border-gray-300 rounded mx-auto"></div>
                        </td>
                        <td className="py-3 text-gray-500 font-mono text-xs">
                          <Link href={`/admin/orders?id=${order.orderId}`} className="hover:text-slate-500 hover:underline">
                            {order.orderId.slice(-8).toUpperCase()}
                          </Link>
                        </td>
                        <td className="py-3 text-center font-bold text-gray-700">{order.qty}</td>
                        <td className="py-3 font-medium text-[#0f172a]">{order.customerName}</td>
                        <td className="py-3 text-gray-600 text-xs max-w-xs truncate">{order.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
