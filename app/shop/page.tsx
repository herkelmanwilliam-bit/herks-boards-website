'use client'
import { useState, useEffect } from 'react'
import { products, Product } from '@/lib/products'
import { useCart } from '@/lib/cart'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface InventoryItem { qty: number; published: boolean; price?: number; image?: string; description?: string; name?: string; category?: string; isDynamic?: boolean }
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
      .then(data => { setInventory(data); setInvLoaded(true); })
      .catch(() => setInvLoaded(true))
  }, [])

  const allProductsList = [
    ...products,
    ...Object.entries(inventory)
      .filter(([_, item]) => item.isDynamic && item.published)
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

  const allVisible = allProductsList.filter(p => {
    const inv = inventory[p.id]
    if (!invLoaded) return true
    return !inv || inv.published !== false
  })

  const filtered = category === 'all' ? allVisible : allVisible.filter(p => p.category === category)

  const categories: { key: Category; label: string }[] = [
    { key: 'all', label: 'ALL PIECES' },
    { key: 'cutting-boards', label: 'CUTTING BOARDS' },
    { key: 'plaques', label: 'DECORATIVE PLAQUES' },
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="bg-[#0f172a] py-24 px-4 text-center border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-serif text-white mb-6">The Collection</h1>
          <p className="text-slate-400 text-sm tracking-[0.2em] font-bold">HANDCRAFTED IN IOWA • NATIONWIDE US SHIPPING</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-wrap gap-4 mb-16 justify-center">
          {categories.map(c => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`px-8 py-3 text-xs tracking-[0.2em] font-bold border transition-colors ${
                category === c.key
                  ? 'bg-[#0f172a] text-white border-[#0f172a]'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map(product => {
            const inv = inventory[product.id]
            const inStock = isInStock(inv)
            const lowStock = inv && inv.qty !== -1 && inv.qty > 0 && inv.qty <= 5
            const price = inv?.price ?? product.price
            const displayImage = inv?.image || product.image
            const displayDesc = inv?.description || product.description
            
            const dynamicProduct = { ...product, price, image: displayImage, description: displayDesc }

            return (
              <div key={product.id} className="bg-white border border-slate-200 hover:border-[#0f172a] transition-colors flex flex-col group shadow-sm hover:shadow-md">
                <Link href={`/shop/${product.id}`} className="block aspect-square bg-slate-100 relative overflow-hidden">
                  {displayImage === '/images/placeholder-board.jpg' ? (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-serif tracking-widest text-sm">NO IMAGE</div>
                  ) : (
                    <img src={displayImage} alt={product.name} className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${!inStock ? 'opacity-40 grayscale' : ''}`} />
                  )}
                  {!inStock && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-[#0f172a]/80 text-white text-xs tracking-[0.3em] font-bold px-4 py-2 backdrop-blur-sm">SOLD OUT</span>
                    </div>
                  )}
                  {lowStock && inStock && (
                    <div className="absolute top-3 right-3 bg-white text-[#0f172a] text-[10px] tracking-widest font-bold px-3 py-1 shadow-sm border border-slate-200">
                      ONLY {inv!.qty} LEFT
                    </div>
                  )}
                </Link>
                <div className="p-6 flex flex-col flex-grow">
                  <Link href={`/shop/${product.id}`} className="font-serif text-xl text-[#0f172a] mb-2 hover:text-slate-600 transition-colors line-clamp-1">{product.name}</Link>
                  <p className="text-slate-500 text-xs font-light mb-4 line-clamp-2 leading-relaxed flex-grow">{displayDesc}</p>
                  <div className="text-[#0f172a] font-bold text-sm tracking-wider mb-6">${price.toFixed(2)}</div>
                  <button
                    onClick={() => { addItem(dynamicProduct); toast.success('Added to Cart'); }}
                    disabled={!inStock}
                    className="w-full bg-white border border-[#0f172a] text-[#0f172a] py-3 text-xs tracking-[0.2em] font-bold hover:bg-[#0f172a] hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#0f172a]"
                  >
                    {inStock ? 'ADD TO CART' : 'UNAVAILABLE'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && invLoaded && (
          <div className="text-center py-32 border border-slate-200 bg-white">
            <p className="text-lg font-serif text-[#0f172a]">The collection is currently empty.</p>
            <p className="text-sm font-light text-slate-500 mt-2">More mastercraft pieces arriving soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}
