'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProductById, Product, products as staticProducts } from '@/lib/products'
import { useCart } from '@/lib/cart'
import { Plus, ArrowLeft, Ruler, ShieldCheck, Truck, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface InventoryItem { qty: number; published: boolean; price?: number; image?: string; description?: string; name?: string; category?: string; isDynamic?: boolean }

const defaultDescription = {
  tagline: 'Handcrafted custom woodworking.',
  highlights: ['Premium hardwood', 'Handcrafted', 'Built to last'],
  specs: 'Custom Profile'
}

export default function ProductPage() {
  const params = useParams()
  const id = params?.id as string
  const staticProduct = getProductById(id)
  
  const [inventory, setInventory] = useState<InventoryItem | null>(null)
  const [qty, setQty] = useState(1)
  const addItem = useCart(s => s.addItem)

  useEffect(() => {
    fetch('/api/inventory')
      .then(r => r.json())
      .then((data: Record<string, InventoryItem>) => {
        setInventory(data[id] ?? { qty: -1, published: true })
      })
      .catch(() => setInventory({ qty: -1, published: true }))
  }, [id])

  // Merge dynamic product details if it's not a static product
  const isDynamic = !staticProduct && inventory?.isDynamic;
  const product = staticProduct || (isDynamic ? {
    id,
    name: inventory.name || 'Unnamed Product',
    category: inventory.category as any,
    description: inventory.description || '',
    price: inventory.price || 0,
    unit: 'each',
    image: inventory.image || '/images/placeholder-board.jpg',
    featured: false,
    inStock: true,
    details: []
  } : null)

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-6 font-light">This piece is not available.</p>
          <Link href="/shop" className="border-b border-[#0f172a] text-[#0f172a] text-xs font-bold tracking-widest pb-1">RETURN TO COLLECTION</Link>
        </div>
      </div>
    )
  }

  const price = inventory?.price ?? product.price
  const inStock = !inventory || (inventory.published && (inventory.qty === -1 || inventory.qty > 0))
  const lowStock = inventory && inventory.qty !== -1 && inventory.qty > 0 && inventory.qty <= 5

  const displayImage = inventory?.image || product.image
  const displayDesc = inventory?.description || product.description
  const dynamicProduct = { ...product, price, image: displayImage, description: displayDesc }

  function handleAddToCart() {
    if (!product) return
    for (let i = 0; i < qty; i++) addItem(dynamicProduct)
    toast.success(`${qty}x ${product.name} added to cart!`)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3 text-xs tracking-widest font-bold text-slate-400 uppercase">
          <Link href="/" className="hover:text-[#0f172a] transition-colors">HOME</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#0f172a] transition-colors">SHOP</Link>
          <span>/</span>
          <span className="text-[#0f172a] truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Image */}
          <div className="relative">
            <div className="aspect-square bg-slate-50 border border-slate-200 flex items-center justify-center p-4">
              {displayImage === '/images/placeholder-board.jpg' ? (
                <span className="text-slate-300 font-serif tracking-widest text-sm">NO IMAGE</span>
              ) : (
                <img src={displayImage} alt={product.name} className="w-full h-full object-cover shadow-sm" />
              )}
            </div>
            {!inStock && (
              <div className="absolute inset-4 bg-[#0f172a]/80 flex items-center justify-center backdrop-blur-sm">
                <span className="text-white font-bold tracking-[0.3em] text-sm">SOLD OUT</span>
              </div>
            )}
            {lowStock && inStock && (
              <div className="absolute top-8 left-8 bg-white border border-slate-200 text-[#0f172a] text-[10px] tracking-widest font-bold px-4 py-2 shadow-md">
                ONLY {inventory!.qty} LEFT IN SHOP
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-10 border-b border-slate-100 pb-10">
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <Ruler className="w-3 h-3" /> {defaultDescription.specs}
              </p>
              <h1 className="text-4xl sm:text-5xl font-serif text-[#0f172a] mb-6 leading-tight">{product.name}</h1>
              <div className="text-2xl text-slate-500 font-light tracking-wide">${price.toFixed(2)}</div>
            </div>

            <div className="mb-12">
              <p className="text-slate-600 font-light leading-relaxed whitespace-pre-wrap">{displayDesc}</p>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-12">
              {defaultDescription.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-1 h-1 bg-[#0f172a] rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-slate-500 font-light">{h}</span>
                </div>
              ))}
            </div>

            {/* Add to cart */}
            <div className="bg-[#f8fafc] p-8 border border-slate-200">
              {inStock ? (
                <>
                  <div className="flex items-center gap-6 mb-6">
                    <div className="text-xs font-bold tracking-widest text-slate-400">QUANTITY</div>
                    <div className="flex items-center border border-slate-300 bg-white">
                      <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors">−</button>
                      <span className="w-12 text-center font-bold text-[#0f172a]">{qty}</span>
                      <button onClick={() => setQty(q => q + 1)} className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors">+</button>
                    </div>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-3 bg-[#0f172a] text-white py-5 text-xs tracking-[0.2em] font-bold hover:bg-slate-800 transition-colors"
                  >
                    ADD TO CART <span className="text-slate-500 font-normal">|</span> ${(price * qty).toFixed(2)}
                  </button>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-[#0f172a] font-serif text-xl mb-4">
                    Currently Unavailable.
                  </p>
                  <Link href="/custom-order" className="text-xs font-bold tracking-widest text-slate-400 border-b border-slate-300 pb-1 hover:text-[#0f172a] hover:border-[#0f172a] transition-all">COMMISSION A SIMILAR BUILD</Link>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="mt-12 pt-10 border-t border-slate-100 flex gap-8">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-slate-300" />
                <span className="text-xs font-bold tracking-widest text-slate-500">FOOD-SAFE FINISH</span>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-slate-300" />
                <span className="text-xs font-bold tracking-widest text-slate-500">NATIONWIDE SHIPPING</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
