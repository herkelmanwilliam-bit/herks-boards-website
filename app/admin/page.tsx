'use client'
import React, { useState, useEffect } from 'react'
import { products } from '@/lib/products'
import { Image as ImageIcon, Plus } from 'lucide-react'

interface InventoryItem {
  qty: number
  published: boolean
  price?: number
  image?: string
  description?: string
  name?: string
  category?: string
  isDynamic?: boolean
}

type Inventory = Record<string, InventoryItem>

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [inventory, setInventory] = useState<Inventory>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({})
  const [testEmailStatus, setTestEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [testEmailMsg, setTestEmailMsg] = useState('')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  // New Product State
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', price: '', qty: '-1', category: 'cutting-boards', description: '', image: '' })

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
      body: JSON.stringify({ username, password }),
    })
    if (res.ok) {
      setAuthed(true)
      loadInventory()
    } else {
      setLoginError('Invalid username or password.')
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

  async function saveItem(productId: string, item: InventoryItem, defaultPrice: number = 0) {
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

  async function deleteProduct(productId: string) {
    if (!confirm('Are you sure you want to delete this custom product?')) return
    setSaving(productId)
    await fetch(`/api/admin/inventory?id=${productId}`, { method: 'DELETE' })
    setInventory(prev => { const n = {...prev}; delete n[productId]; return n; })
    setSaving(null)
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!newProduct.name || !newProduct.price) return
    const productId = `custom-${Date.now()}`
    
    setSaving('new')
    const itemToSave: InventoryItem = {
      qty: parseInt(newProduct.qty) || 0,
      published: true,
      price: parseFloat(newProduct.price),
      name: newProduct.name,
      category: newProduct.category,
      description: newProduct.description,
      image: newProduct.image,
      isDynamic: true
    }

    const res = await fetch('/api/admin/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, ...itemToSave }),
    })
    if (res.ok) {
      setInventory(prev => ({ ...prev, [productId]: itemToSave }))
      setPriceInputs(prev => ({ ...prev, [productId]: newProduct.price }))
      setShowAddForm(false)
      setNewProduct({ name: '', price: '', qty: '-1', category: 'cutting-boards', description: '', image: '' })
    }
    setSaving(null)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (dataUrl: string) => void) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 1000
        const MAX_HEIGHT = 1000
        let width = img.width
        let height = img.height
        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        callback(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    setAuthed(false)
    setInventory({})
    setUsername('')
    setPassword('')
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
        <div className="bg-[#1e293b] rounded-sm p-10 w-full max-w-sm shadow-2xl border border-slate-700">
          <div className="text-center mb-8">
            <span className="text-4xl mb-4 block">🪵</span>
            <h1 className="text-2xl font-serif text-white tracking-widest uppercase">Admin</h1>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="bg-[#0f172a] text-white border border-slate-600 rounded-sm px-4 py-4 text-sm focus:outline-none focus:border-white"
              autoFocus
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-[#0f172a] text-white border border-slate-600 rounded-sm px-4 py-4 text-sm focus:outline-none focus:border-white"
            />
            {loginError && <p className="text-red-400 text-xs text-center">{loginError}</p>}
            <button
              type="submit"
              className="bg-white text-[#0f172a] tracking-widest text-xs font-bold py-4 rounded-sm hover:bg-slate-200 transition-colors mt-2"
            >
              LOG IN
            </button>
          </form>
        </div>
      </div>
    )
  }

  const categories = ['cutting-boards', 'plaques', 'custom'] as const
  const categoryLabels = { 'cutting-boards': '🔪 Cutting Boards', plaques: '🖼️ Decorative Plaques', custom: '🛠️ Custom Builds' }

  // Merge static products + dynamic products
  const allProductsList = [
    ...products,
    ...Object.entries(inventory)
      .filter(([_, item]) => item.isDynamic)
      .map(([id, item]) => ({
        id,
        name: item.name || 'Unnamed Product',
        category: item.category as any,
        description: item.description || '',
        price: item.price || 0,
        unit: 'each',
        image: item.image || '/images/placeholder-board.jpg',
        featured: false,
        inStock: true,
        details: []
      }))
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="bg-[#0f172a] px-8 py-5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-4">
          <span className="text-2xl">🪵</span>
          <div>
            <h1 className="text-white font-serif tracking-widest text-lg uppercase leading-tight">Admin</h1>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <a href="/shop" target="_blank" className="text-slate-300 text-xs tracking-widest font-bold hover:text-white transition-colors">
            VIEW STORE
          </a>
          <button onClick={handleLogout} className="text-slate-400 text-xs tracking-widest font-bold hover:text-white transition-colors">
            LOG OUT
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-6 bg-slate-800 rounded-sm shadow-sm px-8 py-5 flex items-center justify-between text-white border border-slate-700">
          <div>
            <p className="font-bold tracking-widest text-xs mb-1">REVENUE & ANALYTICS</p>
            <p className="text-slate-400 text-xs">Sales by product, period & customer</p>
          </div>
          <a href="/admin/analytics" className="bg-[#0f172a] text-white font-bold px-6 py-3 rounded-sm text-xs tracking-widest hover:bg-black transition-colors whitespace-nowrap">
            VIEW ANALYTICS
          </a>
        </div>

        <div className="mb-10 bg-white rounded-sm shadow-sm border border-slate-200 px-8 py-6">
          <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Order Management</h2>
          <div className="flex flex-wrap gap-4">
            <a href="/admin/orders" className="flex items-center gap-2 bg-slate-100 text-[#0f172a] border border-slate-200 px-6 py-3 rounded-sm text-xs tracking-widest font-bold hover:bg-slate-200 transition-colors">
              OPEN ORDERS
            </a>
            <a href="/admin/build-queue" className="flex items-center gap-2 bg-blue-50 text-blue-800 border border-blue-200 px-6 py-3 rounded-sm text-xs tracking-widest font-bold hover:bg-blue-100 transition-colors">
              BUILD QUEUE
            </a>
            <a href="/admin/fulfillment" className="flex items-center gap-2 bg-green-50 text-green-800 border border-green-200 px-6 py-3 rounded-sm text-xs tracking-widest font-bold hover:bg-green-100 transition-colors">
              SHIPPING
            </a>
            <a href="/admin/orders/closed" className="flex items-center gap-2 bg-slate-50 text-slate-500 border border-slate-200 px-6 py-3 rounded-sm text-xs tracking-widest font-bold hover:bg-slate-100 transition-colors">
              HISTORY
            </a>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-serif text-[#0f172a]">Inventory Manager</h2>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-[#0f172a] text-white px-5 py-3 rounded-sm text-xs tracking-widest font-bold hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" /> ADD PRODUCT
          </button>
        </div>

        {/* Add Product Form */}
        {showAddForm && (
          <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-8 mb-10">
            <h3 className="font-serif text-xl text-[#0f172a] mb-6">Create New Product</h3>
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold tracking-widest text-slate-400 mb-2">PRODUCT NAME</label>
                  <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-[#f8fafc] border border-slate-200 rounded-sm p-3 text-sm focus:outline-none focus:border-[#0f172a]" />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest text-slate-400 mb-2">CATEGORY</label>
                  <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-[#f8fafc] border border-slate-200 rounded-sm p-3 text-sm focus:outline-none focus:border-[#0f172a]">
                    <option value="cutting-boards">Cutting Boards</option>
                    <option value="plaques">Decorative Plaques</option>
                    <option value="custom">Custom Builds</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest text-slate-400 mb-2">PRICE ($)</label>
                  <input required type="number" step="0.01" min="0" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-[#f8fafc] border border-slate-200 rounded-sm p-3 text-sm focus:outline-none focus:border-[#0f172a]" />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest text-slate-400 mb-2">INITIAL QUANTITY (-1 for Unlimited)</label>
                  <input required type="number" min="-1" value={newProduct.qty} onChange={e => setNewProduct({...newProduct, qty: e.target.value})} className="w-full bg-[#f8fafc] border border-slate-200 rounded-sm p-3 text-sm focus:outline-none focus:border-[#0f172a]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-slate-400 mb-2">DESCRIPTION</label>
                <textarea rows={3} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-[#f8fafc] border border-slate-200 rounded-sm p-3 text-sm focus:outline-none focus:border-[#0f172a] resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-slate-400 mb-2">PHOTO</label>
                <div className="flex items-center gap-4">
                  {newProduct.image && (
                    <img src={newProduct.image} className="w-16 h-16 object-cover border border-slate-200 rounded-sm" alt="Preview" />
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (dataUrl) => setNewProduct({...newProduct, image: dataUrl}))} className="text-sm" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={saving === 'new'} className="bg-[#0f172a] text-white px-6 py-3 rounded-sm text-xs tracking-widest font-bold hover:bg-slate-800 transition-colors disabled:opacity-50">
                  {saving === 'new' ? 'SAVING...' : 'SAVE PRODUCT'}
                </button>
                <button type="button" onClick={() => setShowAddForm(false)} className="bg-transparent border border-slate-300 text-slate-600 px-6 py-3 rounded-sm text-xs tracking-widest font-bold hover:bg-slate-50 transition-colors">
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-center text-slate-400 py-20 font-serif text-xl tracking-widest">Loading catalog...</p>
        ) : (
          categories.map(cat => {
            const catProducts = allProductsList.filter(p => p.category === cat)
            if (catProducts.length === 0) return null
            return (
              <div key={cat} className="mb-12">
                <h2 className="text-xl font-serif text-[#0f172a] mb-4">{categoryLabels[cat]}</h2>
                <div className="bg-white rounded-sm shadow-sm overflow-hidden border border-slate-200">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-[#f8fafc]">
                        <th className="text-left px-6 py-4 text-xs font-bold tracking-widest text-slate-400 w-12"></th>
                        <th className="text-left px-6 py-4 text-xs font-bold tracking-widest text-slate-400">PRODUCT</th>
                        <th className="text-left px-6 py-4 text-xs font-bold tracking-widest text-slate-400 w-36">STOCK</th>
                        <th className="text-left px-6 py-4 text-xs font-bold tracking-widest text-slate-400 w-32">PRICE</th>
                        <th className="text-left px-6 py-4 text-xs font-bold tracking-widest text-slate-400 w-28">VISIBLE</th>
                        <th className="px-6 py-4 w-48"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {catProducts.map((product) => {
                        const item = getItem(product.id)
                        const inStock = item.published && (item.qty === -1 || item.qty > 0)
                        const displayImage = item.image || product.image
                        
                        return (
                          <React.Fragment key={product.id}>
                            <tr className="hover:bg-[#f8fafc] transition-colors">
                              <td className="px-6 py-4">
                                {displayImage === '/images/placeholder-board.jpg' ? (
                                  <div className="w-10 h-10 rounded-sm bg-slate-100 border border-slate-200" />
                                ) : (
                                  <img src={displayImage} alt="" className="w-10 h-10 rounded-sm object-cover border border-slate-200" />
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-bold text-[#0f172a] text-sm">{product.name}</p>
                                {item.isDynamic && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-sm uppercase tracking-widest mt-1 inline-block border border-slate-200">Custom SKU</span>}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min={-1}
                                    value={item.qty}
                                    onChange={e => setInventory(prev => ({
                                      ...prev,
                                      [product.id]: { ...getItem(product.id), qty: parseInt(e.target.value) || 0 }
                                    }))}
                                    className="w-20 border border-slate-300 rounded-sm px-3 py-2 text-sm text-center focus:outline-none focus:border-[#0f172a]"
                                  />
                                  <span className="text-slate-400 text-xs font-bold">{item.qty === -1 ? '∞' : ''}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-400 text-sm font-bold">$</span>
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={priceInputs[product.id] ?? String(item.price ?? product.price)}
                                    onChange={e => setPriceInputs(prev => ({ ...prev, [product.id]: e.target.value }))}
                                    onBlur={e => {
                                      const parsed = parseFloat(e.target.value)
                                      if (isNaN(parsed)) setPriceInputs(prev => ({ ...prev, [product.id]: String(item.price ?? product.price) }))
                                    }}
                                    className="w-20 border border-slate-300 rounded-sm px-3 py-2 text-sm text-center focus:outline-none focus:border-[#0f172a]"
                                  />
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                  <div
                                    onClick={() => setInventory(prev => ({
                                      ...prev,
                                      [product.id]: { ...getItem(product.id), published: !item.published }
                                    }))}
                                    className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${item.published ? 'bg-[#0f172a]' : 'bg-slate-300'}`}
                                  >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.published ? 'translate-x-5' : 'translate-x-1'}`} />
                                  </div>
                                </label>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => setExpandedRow(expandedRow === product.id ? null : product.id)}
                                  className="text-slate-400 text-xs tracking-widest font-bold hover:text-[#0f172a] mr-4 transition-colors"
                                >
                                  {expandedRow === product.id ? 'CLOSE' : 'EDIT INFO'}
                                </button>
                                {saved === product.id ? (
                                  <span className="text-green-600 text-xs tracking-widest font-bold">SAVED!</span>
                                ) : (
                                  <button
                                    onClick={() => saveItem(product.id, getItem(product.id), product.price)}
                                    disabled={saving === product.id}
                                    className="bg-[#0f172a] text-white text-xs tracking-widest font-bold px-4 py-2 rounded-sm hover:bg-slate-800 transition-colors disabled:opacity-50"
                                  >
                                    {saving === product.id ? '...' : 'SAVE'}
                                  </button>
                                )}
                              </td>
                            </tr>
                            
                            {expandedRow === product.id && (
                              <tr className="bg-slate-50 border-b border-slate-200">
                                <td colSpan={6} className="px-8 py-8">
                                  <div className="grid md:grid-cols-2 gap-10">
                                    <div>
                                      <label className="block text-xs font-bold tracking-widest text-slate-400 mb-3">OVERRIDE DESCRIPTION</label>
                                      <textarea
                                        rows={5}
                                        value={item.description ?? product.description}
                                        onChange={e => setInventory(prev => ({
                                          ...prev,
                                          [product.id]: { ...getItem(product.id), description: e.target.value }
                                        }))}
                                        className="w-full border border-slate-300 rounded-sm p-4 text-sm focus:outline-none focus:border-[#0f172a] resize-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold tracking-widest text-slate-400 mb-3">PRODUCT PHOTO</label>
                                      <div className="flex items-start gap-6">
                                        <div className="w-32 h-32 border border-slate-300 rounded-sm overflow-hidden flex-shrink-0 bg-white flex items-center justify-center shadow-sm">
                                          {displayImage === '/images/placeholder-board.jpg' ? (
                                            <ImageIcon className="w-8 h-8 text-slate-300" />
                                          ) : (
                                            <img src={displayImage} alt="Preview" className="w-full h-full object-cover" />
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, (url) => setInventory(prev => ({ ...prev, [product.id]: { ...getItem(product.id), image: url } })))}
                                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:tracking-widest file:font-bold file:bg-slate-200 file:text-[#0f172a] hover:file:bg-slate-300 cursor-pointer transition-colors"
                                          />
                                          <p className="text-xs text-slate-500 mt-4 leading-relaxed font-light">Upload a photo. Image will automatically compress to save space before updating the storefront.</p>
                                          
                                          {item.isDynamic && (
                                            <button 
                                              onClick={() => deleteProduct(product.id)}
                                              className="mt-6 text-xs text-red-600 font-bold tracking-widest hover:underline"
                                            >
                                              DELETE PRODUCT COMPLETELY
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
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
