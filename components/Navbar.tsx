'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCart } from '@/lib/cart'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const itemCount = useCart(s => s.itemCount())

  const links = [
    { href: '/shop', label: 'THE COLLECTION' },
    { href: '/custom-order', label: 'BESPOKE BUILDS' },
    { href: '/about', label: 'HERITAGE' },
    { href: '/contact', label: 'INQUIRIES' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-[#0f172a] border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <Link href="/" className="flex items-center">
            <span className="text-2xl text-white tracking-[0.3em] font-serif uppercase">Herk's Boards</span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {links.map(l => (
              <Link key={l.href} href={l.href} className="text-xs text-slate-300 tracking-widest hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-8">
            <Link href="/cart" className="relative text-slate-300 hover:text-white transition-colors flex items-center gap-3">
              <span className="text-xs tracking-widest hidden sm:block">CART</span>
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-white text-[#0f172a] text-[10px] w-4 h-4 flex items-center justify-center font-bold shadow-sm">
                    {itemCount}
                  </span>
                )}
              </div>
            </Link>
            <button className="md:hidden text-slate-300 hover:text-white" onClick={() => setOpen(!open)}>
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-[#0f172a] border-t border-slate-800 px-4 py-6 space-y-4 shadow-xl">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="block text-slate-300 text-xs tracking-widest py-3 border-b border-slate-800/50" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link href="/shop" className="block w-full text-center bg-white text-[#0f172a] py-4 text-xs tracking-widest font-bold mt-6 hover:bg-slate-200 transition-colors" onClick={() => setOpen(false)}>
            ENTER SHOP
          </Link>
        </div>
      )}
    </nav>
  )
}
