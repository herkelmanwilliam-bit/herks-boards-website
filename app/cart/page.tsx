'use client'

import { useCart } from '@/lib/cart'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus } from 'lucide-react'
import { useState } from 'react'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error(data.error)
        setIsCheckingOut(false)
      }
    } catch (err) {
      console.error(err)
      setIsCheckingOut(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="mb-8 text-gray-600 text-lg">Looks like you haven't added any boards yet.</p>
        <Link href="/shop" className="bg-amber-800 text-white px-8 py-4 rounded-lg font-bold hover:bg-amber-900 transition-colors inline-block">
          Explore Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={item.product.id} className="flex gap-6 border-b pb-6">
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">No Image</div>
                {item.product.image && item.product.image !== '/images/placeholder-board.jpg' && (
                  <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-grow">
                <h3 className="font-bold text-lg">{item.product.name}</h3>
                <p className="text-gray-500">${item.product.price.toFixed(2)}</p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center border rounded-md">
                    <button onClick={() => updateQuantity(item.product.id, Math.max(0, item.quantity - 1))} className="p-2 hover:bg-gray-50">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-2 hover:bg-gray-50">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.product.id)} className="text-red-500 hover:text-red-700 p-2">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="text-right font-bold text-lg">
                ${(item.product.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-50 p-6 rounded-xl h-fit border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Order Summary</h2>
          <div className="flex justify-between mb-4">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${total().toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-6">
            <span className="text-gray-600">Shipping</span>
            <span className="text-gray-500 text-sm">Calculated at checkout</span>
          </div>
          <div className="flex justify-between font-bold text-2xl mb-8 border-t pt-4">
            <span>Total</span>
            <span>${total().toFixed(2)}</span>
          </div>
          <button 
            onClick={handleCheckout} 
            disabled={isCheckingOut}
            className="w-full bg-amber-800 text-white py-4 rounded-lg font-bold hover:bg-amber-900 transition-colors disabled:opacity-50 text-lg shadow-sm"
          >
            {isCheckingOut ? 'Redirecting to Stripe...' : 'Checkout securely'}
          </button>
        </div>
      </div>
    </div>
  )
}
