'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProductById, Product } from '@/lib/products'
import { useCart } from '@/lib/cart'
import { Plus, ArrowLeft, Ruler, ShieldCheck, Truck, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface InventoryItem { qty: number; published: boolean; price?: number }

const productDescriptions: Record<string, { tagline: string; story: string; highlights: string[]; specs: string }> = {
  'board-standard-8x12': {
    tagline: 'The everyday essential.',
    story: `Our classic 8"x12" cutting board is built for the daily grind. Whether you're slicing fruit for breakfast or chopping herbs for dinner, this board offers a clean, flat surface that protects your knives. Crafted by hand from premium hardwoods, glued with food-safe adhesives, and finished with a blend of mineral oil and beeswax to keep the wood nourished.`,
    highlights: ['Flat edge-grain surface', 'Protects knife edges', 'Hand-rubbed oil finish', 'Perfect for everyday prep'],
    specs: '8" x 12" • 3/4" Thick • Solid Hardwood'
  },
  'board-juice-groove-8x12': {
    tagline: 'Keep the mess on the board, not the counter.',
    story: `Take our classic 8"x12" board and add a precision-routed juice groove around the perimeter. It's the perfect board for resting steaks, carving roasts, or cutting juicy fruits like tomatoes and watermelon. The groove catches the liquids before they spill onto your countertop, making cleanup incredibly simple.`,
    highlights: ['Deep routed juice groove', 'Keeps counters perfectly clean', 'Great for resting meats', 'Hand-rubbed oil finish'],
    specs: '8" x 12" • 3/4" Thick • Solid Hardwood'
  },
  'board-rubber-feet-8x12': {
    tagline: 'Maximum stability. Zero sliding.',
    story: `There is nothing more frustrating (or dangerous) than a cutting board that slips while you're chopping. We've taken our standard 8"x12" board and elevated it with non-slip rubber feet secured with stainless steel screws. The feet anchor the board firmly to your counter, provide clearance underneath to prevent moisture trapping, and make the board easier to pick up.`,
    highlights: ['Non-slip rubber feet', 'Prevents dangerous sliding', 'Allows air flow underneath', 'Stainless steel hardware'],
    specs: '8" x 12" • 3/4" Thick • Solid Hardwood'
  },
  'board-chamfered-8x12': {
    tagline: 'Modern lines. Easy lifting.',
    story: `For a more modern, refined look, we offer our 8"x12" board with chamfered (angled) edges. Not only does the chamfer give the board a striking, floating appearance on your counter, but the angled undercut gives your fingers a natural ledge to easily lift the board off flat surfaces.`,
    highlights: ['Elegant angled edges', 'Modern "floating" profile', 'Natural finger ledge for lifting', 'Hand-rubbed oil finish'],
    specs: '8" x 12" • 3/4" Thick • Solid Hardwood'
  }
}

const defaultDescription = {
  tagline: 'Handcrafted custom woodworking.',
  story: 'Built by hand using premium hardwoods and food-safe finishes.',
  highlights: ['Premium hardwood', 'Handcrafted', 'Built to last'],
  specs: 'Custom Dimensions'
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const product = getProductById(id)
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

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Product not found.</p>
          <Link href="/shop" className="text-amber-700 font-semibold">← Back to Shop</Link>
        </div>
      </div>
    )
  }

  const desc = productDescriptions[product.id] ?? defaultDescription
  const price = inventory?.price ?? product.price
  const inStock = !inventory || (inventory.published && (inventory.qty === -1 || inventory.qty > 0))
  const lowStock = inventory && inventory.qty !== -1 && inventory.qty > 0 && inventory.qty <= 5

  function handleAddToCart() {
    if (!product) return
    for (let i = 0; i < qty; i++) addItem(product)
    toast.success(`${qty}x ${product.name} added to cart!`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-amber-700">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-amber-700">Shop</Link>
          <span>/</span>
          <span className="text-[#1C1C1C] font-medium">{product.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100 shadow-md flex items-center justify-center">
              {product.image === '/images/placeholder-board.jpg' ? (
                <span className="text-gray-400">No Image</span>
              ) : (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {!inStock && (
              <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center">
                <span className="bg-white text-[#1C1C1C] font-bold px-6 py-3 rounded-full text-lg">Sold Out</span>
              </div>
            )}
            {lowStock && inStock && (
              <div className="absolute top-4 left-4 bg-orange-500 text-white text-sm font-semibold px-3 py-1.5 rounded-full">
                Only {inventory!.qty} left
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-amber-700 font-semibold text-sm uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Ruler className="w-4 h-4" /> {desc.specs}
              </p>
              <h1 className="text-4xl font-bold text-[#1C1C1C] mb-2">{product.name}</h1>
              <p className="text-xl text-gray-500 italic">{desc.tagline}</p>
            </div>

            {/* Price + add to cart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-baseline gap-2 mb-5">
                <span className="text-3xl font-bold text-[#1C1C1C]">${price.toFixed(2)}</span>
              </div>

              {inStock ? (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setQty(q => Math.max(1, q - 1))}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
                      >−</button>
                      <span className="w-10 text-center font-semibold">{qty}</span>
                      <button
                        onClick={() => setQty(q => q + 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
                      >+</button>
                    </div>
                    <span className="text-gray-400 text-sm">Total: <span className="text-[#1C1C1C] font-semibold">${(price * qty).toFixed(2)}</span></span>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-2 bg-[#1C1C1C] text-amber-500 py-4 rounded-xl font-bold text-lg hover:bg-amber-700 hover:text-white transition-colors border border-amber-700/30"
                  >
                    <Plus className="w-5 h-5" /> Add to Cart
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400 font-medium mb-3">
                    Currently sold out — check back soon.
                  </p>
                  <Link href="/shop" className="text-amber-700 font-semibold hover:text-amber-800">Browse other boards →</Link>
                </div>
              )}
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-2 gap-3">
              {desc.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 bg-white rounded-xl p-3 shadow-sm border border-gray-50">
                  <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Story section */}
        <div className="mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold text-[#1C1C1C] mb-4">About This Board</h2>
          <p className="text-gray-600 leading-relaxed text-lg">{desc.story}</p>
        </div>

        {/* Board icons */}
        <div className="mt-10 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-gray-600">Food-Safe Finish</span>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
            <Ruler className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-gray-600">Premium Hardwood</span>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
            <Truck className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-gray-600">Ships Nationwide</span>
          </div>
        </div>

        <div className="mt-12">
          <Link href="/shop" className="inline-flex items-center gap-2 text-amber-700 font-semibold hover:text-amber-800">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>
        </div>
      </div>
    </div>
  )
}
