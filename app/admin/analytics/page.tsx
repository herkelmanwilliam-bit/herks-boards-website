'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TrendingUp, Package, ShoppingBag, Users, RefreshCw, DollarSign } from 'lucide-react'

type Period = 'week' | 'month' | 'quarter' | 'year' | 'all'

interface ProductStat { name: string; revenue: number; qty: number; orders: number }
interface CategoryStat { category: string; revenue: number; qty: number }
interface MonthStat { month: string; revenue: number }
interface WeekStat { week: string; revenue: number }
interface CustomerStat { name: string; revenue: number; orders: number }

interface AnalyticsData {
  period: string
  totalRevenue: number
  orderCount: number
  avgOrder: number
  byProduct: ProductStat[]
  byCategory: CategoryStat[]
  byMonth: MonthStat[]
  byWeek: WeekStat[]
  topCustomers: CustomerStat[]
}

const PERIODS: { key: Period; label: string }[] = [
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'quarter', label: 'This Quarter' },
  { key: 'year', label: 'This Year' },
  { key: 'all', label: 'All Time' },
]

function fmt(cents: number) { return `$${(cents / 100).toFixed(2)}` }
function fmtMonth(key: string) {
  const [y, m] = key.split('-')
  return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
function fmtWeek(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function Bar({ pct, color = 'bg-slate-400' }: { pct: number; color?: string }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  )
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('month')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async (p: Period) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/analytics?period=${p}`)
      if (!res.ok) throw new Error('Failed to load analytics')
      setData(await res.json())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(period) }, [period, load])

  const maxProductRevenue = data ? Math.max(...data.byProduct.map(p => p.revenue), 1) : 1
  const maxMonthRevenue = data ? Math.max(...data.byMonth.map(m => m.revenue), 1) : 1
  const maxCategoryRevenue = data ? Math.max(...data.byCategory.map(c => c.revenue), 1) : 1
  const totalForPct = data?.totalRevenue || 1

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0f172a] border-b border-slate-800/20 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-slate-400 hover:text-slate-300 text-sm">← Admin</Link>
            <h1 className="text-white font-bold text-xl flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-slate-400" />
              Revenue & Analytics
            </h1>
          </div>
          <button onClick={() => load(period)} className="text-white/60 hover:text-white p-2 rounded-sm hover:bg-white/10 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Period tabs */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="flex gap-2 flex-wrap">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-4 py-2 rounded-sm text-sm font-semibold transition-colors ${
                period === p.key
                  ? 'bg-slate-500 text-white'
                  : 'bg-white text-gray-500 hover:text-[#0f172a] border border-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-sm p-4 text-red-700 text-sm">{error}</div>
        )}

        {loading && (
          <div className="text-center py-16 text-[#0f172a]/40">Loading analytics...</div>
        )}

        {!loading && data && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-1">
                  <DollarSign className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-gray-500 font-medium">Total Revenue</span>
                </div>
                <div className="text-3xl font-bold text-[#0f172a]">{fmt(data.totalRevenue)}</div>
                <div className="text-xs text-gray-400 mt-1">{PERIODS.find(p => p.key === period)?.label}</div>
              </div>
              <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-1">
                  <ShoppingBag className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-gray-500 font-medium">Orders Delivered</span>
                </div>
                <div className="text-3xl font-bold text-[#0f172a]">{data.orderCount}</div>
                <div className="text-xs text-gray-400 mt-1">completed orders</div>
              </div>
              <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-1">
                  <TrendingUp className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-gray-500 font-medium">Avg Order Value</span>
                </div>
                <div className="text-3xl font-bold text-[#0f172a]">{fmt(data.avgOrder)}</div>
                <div className="text-xs text-gray-400 mt-1">per order</div>
              </div>
            </div>

            {/* Revenue by Category */}
            {data.byCategory.length > 0 && (
              <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-[#0f172a]">📊 Revenue by Category</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{PERIODS.find(p => p.key === period)?.label}</p>
                </div>
                <div className="p-6 space-y-4">
                  {data.byCategory.map(cat => (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-[#0f172a]">{cat.category}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-400">{cat.qty} units</span>
                          <span className="font-bold text-slate-600 w-20 text-right">{fmt(cat.revenue)}</span>
                          <span className="text-gray-400 w-10 text-right">{Math.round(cat.revenue / totalForPct * 100)}%</span>
                        </div>
                      </div>
                      <Bar pct={cat.revenue / maxCategoryRevenue * 100} color="bg-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revenue by Product */}
            {data.byProduct.length > 0 && (
              <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-[#0f172a]">🪵 Revenue by Product</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{PERIODS.find(p => p.key === period)?.label}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Units</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Orders</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Revenue</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">% Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.byProduct.map((p, i) => (
                        <tr key={p.name} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-400 w-5 text-right">{i + 1}</span>
                              <div>
                                <div className="text-sm font-medium text-[#0f172a]">{p.name}</div>
                                <div className="w-32 mt-1"><Bar pct={p.revenue / maxProductRevenue * 100} color="bg-slate-400" /></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-500 tabular-nums">{p.qty}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-500 tabular-nums">{p.orders}</td>
                          <td className="px-4 py-3 text-right text-sm font-bold text-slate-600 tabular-nums">{fmt(p.revenue)}</td>
                          <td className="px-6 py-3 text-right text-sm text-gray-400 tabular-nums">
                            {Math.round(p.revenue / totalForPct * 100)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Revenue by Month */}
            {data.byMonth.length > 0 && (
              <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-[#0f172a]">📅 Monthly Revenue (All Time)</h2>
                </div>
                <div className="p-6 space-y-3">
                  {data.byMonth.map(m => (
                    <div key={m.month}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[#0f172a]">{fmtMonth(m.month)}</span>
                        <span className="text-sm font-bold text-slate-600">{fmt(m.revenue)}</span>
                      </div>
                      <Bar pct={m.revenue / maxMonthRevenue * 100} color="bg-gray-200" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Customers */}
            {data.topCustomers.length > 0 && (
              <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-[#0f172a]">
                    <Users className="w-4 h-4 inline mr-2 text-slate-500" />
                    Top Customers
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">{PERIODS.find(p => p.key === period)?.label}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Orders</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Spent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.topCustomers.map((c, i) => (
                        <tr key={c.name} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3 text-sm text-gray-400 tabular-nums">{i + 1}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-[#0f172a]">{c.name}</div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-500 tabular-nums">{c.orders}</td>
                          <td className="px-6 py-3 text-right text-sm font-bold text-slate-600 tabular-nums">{fmt(c.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {data.orderCount === 0 && (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400">No shipped orders in this period yet.</p>
                <p className="text-gray-400 text-sm mt-1">Close some orders as shipped to see revenue data.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
