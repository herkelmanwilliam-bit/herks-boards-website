'use client'
import { useState, useEffect } from 'react'
import { products } from '@/lib/products'

interface InventoryItem {
  qty: number
  published: boolean
  price?: number
}

type Inventory = Record<string, InventoryItem>

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [inventory, setInventory] = useState<Inventory>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({})
  const [testEmailStatus, setTestEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [testEmailMsg, setTestEmailMsg] = useState('')

  async function sendTestEmail() {
    setTestEmailStatus('sending')
    setTestEmailMsg('')
    try {
      const res = await fetch('/api/admin/test-email', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setTestEmailStatus('sent')
        setTestEmailMsg(data.message ?? 'Test emails sent!')
      } else {
        setTestEmailStatus('error')
        setTestEmailMsg(data.error ?? 'Failed to send test email.')
      }
    } catch {
      setTestEmailStatus('error')
      setTestEmailMsg('Network error — check console.')
    }
    setTimeout(() => { setTestEmailStatus('idle'); setTestEmailMsg('') }, 6000)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      setAuthed(true)
      loadInventory()
    } else {
      setLoginError('Wrong password.')
    }
  }

  async function loadInventory() {
    setLoading(true)
    const res = await fetch('/api/admin/inventory')
    if (res.ok) {
      const data = await res.json()
      setInventory(data)
      setAuthed(true)
      const initialPrices: Record<string, string> = {}
      for (const [id, item] of Object.entries(data as Inventory)) {
        if (item.price !== undefined) initialPrices[id] = String(item.price)
      }
      setPriceInputs(initialPrices)
    } else if (res.status === 401) {
      setAuthed(false)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadInventory()
  }, [])

  function getItem(productId: string): InventoryItem {
    return inventory[productId] ?? { qty: -1, published: true }
  }

  async function saveItem(productId: string, item: InventoryItem, defaultPrice: number) {
    setSaving(productId)
    const rawPrice = priceInputs[productId]
    const parsedPrice = rawPrice !== undefined ? parseFloat(rawPrice) : undefined
    const priceToSave = parsedPrice !== undefined && !isNaN(parsedPrice) ? parsedPrice : defaultPrice
    const itemToSave = { ...item, price: priceToSave }
    const res = await fetch('/api/admin/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, ...itemToSave }),
    })
    if (res.ok) {
      setInventory(prev => ({ ...prev, [productId]: itemToSave }))
      setSaved(productId)
      setTimeout(() => setSaved(null), 2000)
    }
    setSaving(null)
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    setAuthed(false)
    setInventory({})
    setPassword('')
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#1C1C1C] flex items-center justify-center px-4">
        <div className="bg-[#2a2a2a] rounded-2xl p-8 w-full max-w-sm shadow-2xl border border-amber-500/20">
          <div className="text-center mb-6">
            <span className="text-4xl">🪵</span>
            <h1 className="text-2xl font-bold text-white mt-2">Herk's Boards Admin</h1>
            <p className="text-gray-400 text-sm mt-1">Inventory Management</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-[#1C1C1C] text-white border border-amber-500/30 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500"
              autoFocus
            />
            {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
            <button
              type="submit"
              className="bg-amber-600 text-white font-bold py-3 rounded-xl hover:bg-amber-700 transition-colors"
            >
              Log In
            </button>
          </form>
        </div>
      </div>
    )
  }

  const categories = ['cutting-boards', 'plaques', 'custom'] as const
  const categoryLabels = { 'cutting-boards': '🔪 Cutting Boards', plaques: '🖼️ Decorative Plaques', custom: '🛠️ Custom Builds' }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1C1C1C] px-6 py-4 flex items-center justify-between border-b border-amber-900/20">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🪵</span>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Herk's Boards Admin</h1>
            <p className="text-amber-500 text-xs">Inventory Management</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/shop"
            target="_blank"
            className="text-amber-500 text-sm hover:underline"
          >
            View Shop →
          </a>
          <button
            onClick={handleLogout}
            className="text-gray-400 text-sm hover:text-white transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-4 bg-amber-600 rounded-2xl shadow-sm px-6 py-4 flex items-center justify-between text-white">
          <div>
            <p className="font-bold text-sm">📊 Revenue & Analytics</p>
            <p className="text-white/80 text-xs mt-0.5">Sales by product, period & customer</p>
          </div>
          <a
            href="/admin/analytics"
            className="bg-[#1C1C1C] text-amber-500 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#2a2a2a] transition-colors whitespace-nowrap"
          >
            View Analytics →
          </a>
        </div>

        <div className="mb-6 bg-[#1C1C1C] rounded-2xl shadow-sm border border-amber-900/20 px-6 py-4">
          <h2 className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-3">Order Management</h2>
          <div className="flex flex-wrap gap-3">
            <a
              href="/admin/orders"
              className="flex items-center gap-2 bg-amber-500/10 text-amber-500 border border-amber-500/30 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-500 hover:text-[#1C1C1C] transition-colors"
            >
              📥 Open Orders
            </a>
            <a
              href="/admin/build-queue"
              className="flex items-center gap-2 bg-blue-700/20 text-blue-400 border border-blue-600/40 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 hover:text-white transition-colors"
            >
              🪚 Build Queue
            </a>
            <a
              href="/admin/fulfillment"
              className="flex items-center gap-2 bg-green-700/20 text-green-400 border border-green-600/40 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 hover:text-white transition-colors"
            >
              📦 Fulfillment / Shipping
            </a>
            <a
              href="/admin/orders/closed"
              className="flex items-center gap-2 bg-white/5 text-white/70 border border-white/10 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/10 hover:text-white transition-colors"
            >
              📦 Closed Orders
            </a>
          </div>
        </div>

        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-[#1C1C1C]">📧 Email System</h2>
            <p className="text-sm text-gray-500 mt-0.5">Send a test order confirmation to info@herksboards.com</p>
            {testEmailMsg && (
              <p className={`text-sm mt-1 font-medium ${testEmailStatus === 'error' ? 'text-red-500' : 'text-green-600'}`}>{testEmailMsg}</p>
            )}
          </div>
          <button
            onClick={sendTestEmail}
            disabled={testEmailStatus === 'sending'}
            className="bg-[#1C1C1C] text-amber-500 font-semibold px-5 py-2.5 rounded-xl hover:bg-amber-500 hover:text-[#1C1C1C] transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
          >
            {testEmailStatus === 'sending' ? 'Sending...' : testEmailStatus === 'sent' ? '✅ Sent!' : 'Send Test Email'}
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-20">Loading inventory...</p>
        ) : (
          categories.map(cat => {
            const catProducts = products.filter(p => p.category === cat)
            if (catProducts.length === 0) return null
            return (
              <div key={cat} className="mb-10">
                <h2 className="text-xl font-bold text-[#1C1C1C] mb-4">{categoryLabels[cat]}</h2>
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600 w-8"></th>
                        <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">Product</th>
                        <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600 w-36">Quantity</th>
                        <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600 w-32">Price</th>
                        <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600 w-28">Visible</th>
                        <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600 w-24">Status</th>
                        <th className="px-5 py-3 w-24"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {catProducts.map((product, i) => {
                        const item = getItem(product.id)
                        const inStock = item.published && (item.qty === -1 || item.qty > 0)
                        return (
                          <tr key={product.id} className={`border-b border-gray-50 last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                            <td className="px-5 py-3">
                              {product.image === '/images/placeholder-board.jpg' ? (
                                <div className="w-8 h-8 rounded-lg bg-gray-200" />
                              ) : (
                                <img src={product.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                              )}
                            </td>
                            <td className="px-5 py-3">
                              <p className="font-medium text-[#1C1C1C] text-sm">{product.name}</p>
                              <p className="text-gray-400 text-xs">${product.price} / {product.unit}</p>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min={-1}
                                  value={item.qty}
                                  onChange={e => setInventory(prev => ({
                                    ...prev,
                                    [product.id]: { ...getItem(product.id), qty: parseInt(e.target.value) || 0 }
                                  }))}
                                  className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-amber-500"
                                />
                                <span className="text-gray-400 text-xs">{item.qty === -1 ? '∞' : ''}</span>
                              </div>
                              <p className="text-gray-400 text-xs mt-1">-1 = unlimited</p>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-1">
                                <span className="text-gray-400 text-sm">$</span>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={priceInputs[product.id] ?? String(item.price ?? product.price)}
                                  onChange={e => setPriceInputs(prev => ({ ...prev, [product.id]: e.target.value }))}
                                  onBlur={e => {
                                    const parsed = parseFloat(e.target.value)
                                    if (isNaN(parsed)) {
                                      setPriceInputs(prev => ({ ...prev, [product.id]: String(item.price ?? product.price) }))
                                    }
                                  }}
                                  className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-amber-500"
                                />
                              </div>
                              <p className="text-gray-400 text-xs mt-1">per {product.unit}</p>
                            </td>
                            <td className="px-5 py-3">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <div
                                  onClick={() => setInventory(prev => ({
                                    ...prev,
                                    [product.id]: { ...getItem(product.id), published: !item.published }
                                  }))}
                                  className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${item.published ? 'bg-amber-500' : 'bg-gray-300'}`}
                                >
                                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.published ? 'translate-x-5' : 'translate-x-1'}`} />
                                </div>
                                <span className="text-sm text-gray-600">{item.published ? 'On' : 'Off'}</span>
                              </label>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                                inStock
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-600'
                              }`}>
                                {inStock ? '✓ In Stock' : '✕ Sold Out'}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right">
                              {saved === product.id ? (
                                <span className="text-green-600 text-sm font-medium">✅ Saved</span>
                              ) : (
                                <button
                                  onClick={() => saveItem(product.id, getItem(product.id), product.price)}
                                  disabled={saving === product.id}
                                  className="bg-[#1C1C1C] text-amber-500 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-amber-600 hover:text-white transition-colors disabled:opacity-50"
                                >
                                  {saving === product.id ? '...' : 'Save'}
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
