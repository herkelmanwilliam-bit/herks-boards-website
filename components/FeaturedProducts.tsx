'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getFeaturedProducts } from '@/lib/products'
import { useCart } from '@/lib/cart'
import toast from 'react-hot-toast'

interface InventoryItem {
  qty: number
  published: boolean
  price?: number
  image?: string
  description?: string
}

type Inventory = Record<string, InventoryItem>

export default function FeaturedProducts() {
  const [inventory, setInventory] = useState<Inventory>({})
  const [invLoaded, setInvLoaded] = useState(false)
  const addItem = useCart(s => s.addItem)

  useEffect(() => {
    fetch('/api/inventory')
      .then(r => r.json())
      .then(data => { setInventory(data); setInvLoaded(true); })
      .catch(() => setInvLoaded(true))
  }, [])

  const featured = getFeaturedProducts()
    .filter(p => !invLoaded || (inventory[p.id]?.published !== false))
    .slice(0, 4)

  return (
    <section className="py-32 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-24">
          <h2 className="text-xs tracking-[0.3em] text-slate-400 font-bold mb-4">SIGNATURE PIECES</h2>
          <h3 className="text-4xl sm:text-5xl font-serif text-[#0f172a]">The Master Collection</h3>
          <div className="h-px w-16 bg-slate-300 mx-auto mt-8"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {featured.map(product => {
            const inv = inventory[product.id]
            const price = inv?.price ?? product.price
            const displayImage = inv?.image || product.image
            const displayDesc = inv?.description || product.description
            const inStock = !inv || (inv.qty === -1 || inv.qty > 0)

            return (
              <div key={product.id} className="group bg-white flex flex-col sm:flex-row border border-slate-200 hover:border-[#0f172a] transition-all duration-500 overflow-hidden shadow-sm hover:shadow-xl">
                <Link href={`/shop/${product.id}`} className="w-full sm:w-1/2 block aspect-square sm:aspect-auto bg-slate-100 relative overflow-hidden">
                  {displayImage === '/images/placeholder-board.jpg' ? (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-serif text-sm tracking-widest bg-slate-50">NO IMAGE</div>
                  ) : (
                    <img src={displayImage} alt={product.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  )}
                  {!inStock && (
                    <div className="absolute inset-0 bg-[#0f172a]/80 flex items-center justify-center text-white tracking-[0.3em] text-xs font-bold backdrop-blur-sm">
                      SOLD OUT
                    </div>
                  )}
                </Link>
                
                <div className="w-full sm:w-1/2 p-8 sm:p-10 flex flex-col justify-center relative bg-white z-10">
                  <h4 className="font-serif text-2xl text-[#0f172a] mb-2 leading-snug">{product.name}</h4>
                  <div className="text-slate-400 text-sm mb-6 tracking-widest font-medium">${price.toFixed(2)}</div>
                  <p className="text-slate-500 text-sm font-light leading-relaxed mb-8 line-clamp-3">
                    {displayDesc}
                  </p>
                  <button
                    onClick={() => { addItem({ ...product, price, image: displayImage, description: displayDesc }); toast.success('Added to Cart'); }}
                    disabled={!inStock}
                    className="mt-auto w-full bg-white text-[#0f172a] border border-[#0f172a] py-4 text-xs tracking-[0.2em] font-bold hover:bg-[#0f172a] hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#0f172a]"
                  >
                    {inStock ? 'ADD TO CART' : 'UNAVAILABLE'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-24">
          <Link href="/shop" className="inline-block border-b border-[#0f172a] pb-2 text-xs tracking-[0.2em] font-bold text-[#0f172a] hover:text-slate-500 hover:border-slate-500 transition-colors">
            VIEW ENTIRE CATALOG
          </Link>
        </div>
      </div>
    </section>
  )
}
