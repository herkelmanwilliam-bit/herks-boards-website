'use client'
import { useState, useEffect } from 'react'
import { products, Product } from '@/lib/products'
import { useCart } from '@/lib/cart'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface InventoryItem {
  qty: number
  published: boolean
  price?: number
}

type Inventory = Record<string, InventoryItem>
type Category = 'all' | 'cutting-boards' | 'custom' | 'plaques'

function isInStock(inv: InventoryItem | undefined): boolean {
  if (!inv) return true
  return inv.published && (inv.qty === -1 || inv.qty > 0)
}

export default function ShopPage() {
  const [category, setCategory] = useState<Category>('all')
  const [inventory, setInventory] = useState<Inventory>({})
  const [invLoaded, setInvLoaded] = useState(false)
  const addItem = useCart(s => s.addItem)

  useEffect(() => {
    fetch('/api/inventory')
      .then(r => r.json())
      .then(data => {
        setInventory(data)
        setInvLoaded(true)
      })
      .catch(() => setInvLoaded(true))
  }, [])

  const allVisible = products.filter(p => {
    const inv = inventory[p.id]
    if (!invLoaded) return true
    return !inv || inv.published !== false
  })

  const filtered = category === 'all' ? allVisible : allVisible.filter(p => p.category === category)

  const categories: { key: Category; label: string; emoji: string }[] = [
    { key: 'all', label: 'All Products', emoji: '🪵' },
    { key: 'cutting-boards', label: 'Cutting Boards', emoji: '🔪' },
    { key: 'plaques', label: 'Decorative Plaques', emoji: '🖼️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1C1C1C] py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Shop Herk's Boards</h1>
          <p className="text-amber-500 text-lg">Handcrafted in Iowa • Nationwide US Shipping</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category filter */}
        <div className="flex flex-wrap gap-3 mb-10">
          {categories.map(c => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-colors ${
                category === c.key
                  ? 'bg-[#1C1C1C] text-amber-500 shadow-md border border-amber-500/30'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <span className="text-xl">{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(product => {
            const inv = inventory[product.id]
            const inStock = isInStock(inv)
            const lowStock = inv && inv.qty !== -1 && inv.qty > 0 && inv.qty <= 5

            return (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-amber-500/30 border border-transparent transition-all">
                <Link href={`/shop/${product.id}`} className="block">
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative flex items-center justify-center">
                    {product.image === '/images/placeholder-board.jpg' ? (
                      <span className="text-gray-400">No Image</span>
                    ) : (
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`w-full h-full object-cover hover:scale-105 transition-transform duration-300 ${!inStock ? 'opacity-50' : ''}`}
                      />
                    )}
                    {!inStock && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-gray-800/80 text-white text-sm font-semibold px-3 py-1 rounded-full">
                          Sold Out
                        </span>
                      </div>
                    )}
                    {lowStock && inStock && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                          Only {inv!.qty} left
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <Link href={`/shop/${product.id}`} className="font-bold text-[#1C1C1C] hover:text-amber-700 transition-colors">{product.name}</Link>
                  </div>
                  <p className="text-gray-500 text-sm mb-1 line-clamp-2">{product.description}</p>
                  <p className="text-amber-700 font-semibold text-sm mb-3">${(inv?.price ?? product.price).toFixed(2)}</p>
                  <button
                    onClick={() => { addItem(product); toast.success(`${product.name} added!`) }}
                    disabled={!inStock}
                    className="w-full flex items-center justify-center gap-2 bg-[#1C1C1C] text-amber-500 py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-amber-700/30"
                  >
                    <Plus className="w-4 h-4" /> {inStock ? 'Add to Cart' : 'Sold Out'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && invLoaded && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">Nothing available in this category right now.</p>
            <p className="text-sm mt-1">Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}
