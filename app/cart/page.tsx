'use client'

import { useCart } from '@/lib/cart'
import Link from 'next/link'
import { Plus, Minus, ArrowRight } from 'lucide-react'
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
      <div className="bg-[#f8fafc] min-h-screen py-32 text-center">
        <h1 className="text-5xl font-serif text-[#0f172a] mb-6">Your Cart is Empty</h1>
        <p className="mb-12 text-slate-500 font-light text-lg">You have not added any pieces to your collection.</p>
        <Link href="/shop" className="bg-[#0f172a] text-white px-10 py-5 text-xs tracking-[0.2em] font-bold hover:bg-slate-800 transition-colors inline-block">
          RETURN TO SHOP
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-4xl font-serif text-[#0f172a] mb-12">Your Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-8">
            <div className="hidden sm:grid grid-cols-12 gap-4 pb-4 border-b border-slate-200 text-xs tracking-[0.2em] font-bold text-slate-400">
              <div className="col-span-6">PRODUCT</div>
              <div className="col-span-3 text-center">QUANTITY</div>
              <div className="col-span-3 text-right">TOTAL</div>
            </div>

            {items.map((item) => (
              <div key={item.product.id} className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center py-6 border-b border-slate-100">
                
                <div className="sm:col-span-6 flex items-center gap-6">
                  <div className="w-24 h-24 bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-200">
                    {item.product.image === '/images/placeholder-board.jpg' ? (
                      <span className="text-slate-300 text-[10px] tracking-widest font-serif">NO IMAGE</span>
                    ) : (
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-[#0f172a] mb-1 leading-snug">{item.product.name}</h3>
                    <p className="text-slate-400 text-sm tracking-wider">${item.product.price.toFixed(2)}</p>
                    <button onClick={() => removeItem(item.product.id)} className="text-xs text-red-500 font-bold tracking-widest mt-3 hover:underline">
                      REMOVE
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-3 flex justify-start sm:justify-center">
                  <div className="flex items-center border border-slate-300">
                    <button onClick={() => updateQuantity(item.product.id, Math.max(0, item.quantity - 1))} className="p-3 hover:bg-slate-50 transition-colors text-slate-600">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center font-bold text-[#0f172a] text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-3 hover:bg-slate-50 transition-colors text-slate-600">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-3 text-left sm:text-right font-bold text-[#0f172a] text-lg tracking-wide">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-[#f8fafc] p-8 border border-slate-200 h-fit">
            <h2 className="text-xs tracking-[0.2em] font-bold text-slate-400 mb-6">ORDER SUMMARY</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-light">Subtotal</span>
                <span className="font-bold text-[#0f172a] tracking-wider">${total().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-light">Shipping</span>
                <span className="text-slate-400 text-xs tracking-wider">Calculated at checkout</span>
              </div>
            </div>

            <div className="flex justify-between items-end border-t border-slate-200 pt-6 mb-8">
              <span className="text-xs tracking-[0.2em] font-bold text-slate-400">TOTAL</span>
              <span className="font-serif text-3xl text-[#0f172a] tracking-wide">${total().toFixed(2)}</span>
            </div>
            
            <button 
              onClick={handleCheckout} 
              disabled={isCheckingOut}
              className="w-full flex items-center justify-center gap-3 bg-[#0f172a] text-white py-5 text-xs tracking-[0.2em] font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {isCheckingOut ? 'REDIRECTING...' : 'SECURE CHECKOUT'}
              {!isCheckingOut && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
