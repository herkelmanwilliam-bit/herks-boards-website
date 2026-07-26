'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Menu, X, Instagram } from 'lucide-react'
import { useCart } from '@/lib/cart'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const itemCount = useCart(s => s.itemCount())

  const links = [
    { href: '/shop', label: 'SHOP BOARDS' },
    { href: '/custom-order', label: 'COMMISSION' },
    { href: '/about', label: 'THE WORKSHOP' },
  ]

  return (
    <>
      <div className="bg-[#0f172a] text-slate-400 text-[10px] tracking-[0.3em] font-medium py-2 px-6 flex justify-between items-center border-b border-slate-800">
        <div>IOWA, USA • CRAFTED BY HAND</div>
        <div className="hidden sm:flex items-center gap-6">
          <a href="mailto:Herkelmanwilliam@gmail.com" className="hover:text-white transition-colors">HERKELMANWILLIAM@GMAIL.COM</a>
          <a href="https://instagram.com/herksboards" target="_blank" className="hover:text-white transition-colors flex items-center gap-1.5"><Instagram className="w-3 h-3" /> FOLLOW US</a>
        </div>
      </div>

      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-24">
            
            <div className="hidden md:flex items-center gap-10 w-1/3">
              {links.slice(0, 2).map(l => (
                <Link key={l.href} href={l.href} className="text-xs text-slate-500 font-bold tracking-[0.2em] hover:text-[#0f172a] transition-colors relative group">
                  {l.label}
                  <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-[#0f172a] transition-all group-hover:w-full"></span>
                </Link>
              ))}
            </div>

            <Link href="/" className="flex justify-center w-auto md:w-1/3">
              <img src="/images/logo.jpg" alt="Herk's Boards" className="h-16 w-auto object-contain mix-blend-multiply" />
            </Link>

            <div className="hidden md:flex items-center justify-end gap-10 w-1/3">
              <Link href="/about" className="text-xs text-slate-500 font-bold tracking-[0.2em] hover:text-[#0f172a] transition-colors relative group">
                THE WORKSHOP
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-[#0f172a] transition-all group-hover:w-full"></span>
              </Link>

              <Link href="/cart" className="flex items-center gap-2 group">
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 text-slate-800 group-hover:text-[#0f172a] transition-colors" strokeWidth={1.5} />
                  {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#0f172a] text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 font-bold tracking-[0.2em] group-hover:text-[#0f172a] transition-colors">CART</span>
              </Link>
            </div>

            <div className="flex md:hidden items-center gap-6">
              <Link href="/cart" className="relative text-slate-800">
                <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#0f172a] text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                    {itemCount}
                  </span>
                )}
              </Link>
              <button className="text-slate-800" onClick={() => setOpen(!open)}>
                {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {open && (
          <div className="md:hidden bg-white border-t border-slate-100 px-6 py-8 space-y-6 absolute w-full shadow-xl">
            {links.map(l => (
              <Link key={l.href} href={l.href} className="block text-[#0f172a] text-sm font-bold tracking-[0.2em] py-2" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <a href="mailto:Herkelmanwilliam@gmail.com" className="block text-slate-400 text-xs font-bold tracking-[0.2em] pt-6 border-t border-slate-100">
              CONTACT US
            </a>
          </div>
        )}
      </nav>
    </>
  )
}
