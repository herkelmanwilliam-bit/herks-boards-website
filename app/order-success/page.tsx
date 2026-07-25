'use client'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { useEffect } from 'react'
import { useCart } from '@/lib/cart'

export default function OrderSuccess() {
  const clearCart = useCart(s => s.clearCart)

  useEffect(() => {
    clearCart()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-sm border border-gray-100">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-100">
          <CheckCircle className="w-10 h-10 text-amber-600" />
        </div>
        <h1 className="text-3xl font-bold text-[#1C1C1C] mb-3">Order Confirmed!</h1>
        <p className="text-gray-500 mb-4 leading-relaxed">
          Thank you for your order! Your handcrafted board will be prepared and securely packaged for transit.
        </p>
        <p className="text-amber-700 font-medium mb-8">
          You will receive an email with tracking information as soon as it ships.
        </p>
        <div className="space-y-3">
          <Link href="/shop" className="block w-full bg-[#1C1C1C] text-amber-500 py-3 rounded-xl font-semibold hover:bg-amber-600 hover:text-white transition-colors border border-amber-700/30">
            Continue Shopping
          </Link>
          <Link href="/" className="block w-full border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
