'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getFeaturedProducts } from '@/lib/products'
import { useCart } from '@/lib/cart'
import toast from 'react-hot-toast'
import React from 'react'

interface InventoryItem {
  qty: number
  published: boolean
  price?: number
  image?: string
  description?: string
}

export default function FeaturedProducts() {
  const [inventory, setInventory] = useState<Record<string, InventoryItem>>({})
  const [invLoaded, setInvLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/inventory')
      .then(r => r.json())
      .then(data => { setInventory(data); setInvLoaded(true); })
      .catch(() => setInvLoaded(true))
  }, [])

  const featured = getFeaturedProducts()
    .filter(p => !invLoaded || (inventory[p.id]?.published !== false))
    .slice(0, 3)

  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <h2 className="text-[10px] tracking-[0.4em] text-slate-400 font-bold mb-4 uppercase">Latest Additions</h2>
            <h3 className="text-4xl font-serif text-[#0f172a]">Shop the Collection</h3>
          </div>
          <Link href="/shop" className="text-xs font-bold tracking-[0.2em] text-[#0f172a] border-b border-[#0f172a] pb-1 hover:text-slate-500 hover:border-slate-500 transition-colors whitespace-nowrap">
            VIEW ALL BOARDS
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {featured.map(product => {
            const inv = inventory[product.id]
            const price = inv?.price ?? product.price
            const displayImage = inv?.image || product.image
            const inStock = !inv || (inv.qty === -1 || inv.qty > 0)

            return (
              <Link href={`/shop/${product.id}`} key={product.id} className="group flex flex-col">
                <div className="w-full aspect-[4/5] bg-[#f8fafc] mb-6 overflow-hidden relative">
                  {displayImage === '/images/placeholder-board.jpg' ? (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-serif text-sm tracking-widest border border-slate-200 m-4">NO IMAGE</div>
                  ) : (
                    <img src={displayImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  )}
                  {!inStock && (
                    <div className="absolute top-4 left-4 bg-[#0f172a] text-white text-[10px] font-bold tracking-[0.2em] px-3 py-1">
                      SOLD OUT
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <h4 className="font-serif text-xl text-[#0f172a] mb-2 group-hover:text-slate-500 transition-colors">{product.name}</h4>
                  <div className="text-sm font-bold tracking-widest text-slate-400">${price.toFixed(2)}</div>
                </div>
              </Link>
            )
          })}
        </div>

      </div>
    </section>
  )
}
