'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCart } from '@/lib/cart'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const itemCount = useCart(s => s.itemCount())

  const links = [
    { href: '/shop', label: 'Shop' },
    { href: '/custom-order', label: 'Custom Build' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-[#0f172a] border-b border-[#94a3b8]/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl text-[#94a3b8] uppercase" style={{fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, letterSpacing: '0.25em'}}>Herk's Boards</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map(l => (
              <Link key={l.href} href={l.href} className="text-[#f8fafc]/80 hover:text-[#94a3b8] font-medium transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Cart + Mobile */}
          <div className="flex items-center gap-3">
            <Link href="/cart" className="relative p-2 text-[#f8fafc]/80 hover:text-[#94a3b8] transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#94a3b8] text-[#0f172a] text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Link>
            <button className="md:hidden p-2 text-[#f8fafc]" onClick={() => setOpen(!open)}>
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#0f172a] border-t border-[#94a3b8]/20 px-4 py-4 space-y-3">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="block text-[#f8fafc] font-medium py-2" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link href="/shop" className="block w-full text-center bg-[#94a3b8] text-[#0f172a] py-3 rounded-sm font-bold mt-2" onClick={() => setOpen(false)}>
            Shop Now
          </Link>
        </div>
      )}
    </nav>
  )
}
