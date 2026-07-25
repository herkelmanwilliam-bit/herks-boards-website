'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
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

type Inventory = Record<string, InventoryItem>

function isInStock(inv: InventoryItem | undefined): boolean {
  if (!inv) return true
  return inv.published && (inv.qty === -1 || inv.qty > 0)
}

export default function FeaturedProducts() {
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

  const featured = getFeaturedProducts()
    .filter(p => {
      if (!invLoaded) return true 
      return isInStock(inventory[p.id])
    })
    .slice(0, 6)

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1C1C1C] mb-2">Featured Builds</h2>
            <p className="text-[#1C1C1C]/50 text-lg">Handcrafted and ready to ship.</p>
          </div>
          <Link href="/shop" className="hidden sm:inline-flex text-amber-700 font-semibold hover:text-amber-800">
            View all shop items →
          </Link>
        </div>

        {featured.length === 0 && invLoaded ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium">Check back soon — building more inventory.</p>
            <Link href="/shop" className="mt-4 inline-block text-amber-700 font-semibold hover:text-amber-800">
              Browse all products →
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(product => {
              const inv = inventory[product.id]
              const price = inv?.price ?? product.price
              const displayImage = inv?.image || product.image
              const displayDesc = inv?.description || product.description
              
              const dynamicProduct = { ...product, price, image: displayImage, description: displayDesc }

              return (
                <div key={product.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-amber-700/30 transition-all group">
                  <Link href={`/shop/${product.id}`} className="block">
                    <div className="aspect-[4/3] overflow-hidden bg-gray-50 flex items-center justify-center">
                      {displayImage === '/images/placeholder-board.jpg' ? (
                        <span className="text-gray-400">No Image</span>
                      ) : (
                        <img
                          src={displayImage}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                  </Link>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <Link href={`/shop/${product.id}`} className="font-bold text-[#1C1C1C] text-lg hover:text-amber-700 transition-colors">{product.name}</Link>
                      <span className="text-amber-700 font-semibold text-sm ml-2 shrink-0">${price.toFixed(2)}</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{displayDesc}</p>
                    <button
                      onClick={() => {
                        addItem(dynamicProduct)
                        toast.success(`${product.name} added to cart!`)
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-[#1C1C1C] text-amber-500 py-3 rounded-xl font-semibold hover:bg-amber-700 hover:text-white transition-colors border border-amber-700/30"
                    >
                      <Plus className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="text-center mt-8 sm:hidden">
          <Link href="/shop" className="inline-flex items-center gap-2 text-amber-700 font-semibold">
            View all products →
          </Link>
        </div>
      </div>
    </section>
  )
}
