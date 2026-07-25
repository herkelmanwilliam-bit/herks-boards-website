import Link from 'next/link'
import { MapPin, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-gray-400 border-t border-slate-800/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-bold text-xl text-slate-400">Herk's Boards</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Handcrafted custom cutting boards and woodworking, built to last a lifetime.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" />Iowa, USA</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" />info@herksboards.com</div>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-slate-400 font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              {['All Products', 'Cutting Boards', 'Decorative Plaques'].map(l => (
                <li key={l}><Link href="/shop" className="hover:text-slate-400 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-slate-400 font-semibold mb-4">Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Shop', href: '/shop' },
                { label: 'Custom Build', href: '/custom-order' },
                { label: 'About Us', href: '/about' },
                { label: 'Contact Us', href: '/contact' },
              ].map(l => (
                <li key={l.label}><Link href={l.href} className="hover:text-slate-400 transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Orders */}
          <div>
            <h4 className="text-slate-400 font-semibold mb-4">Orders</h4>
            <ul className="space-y-2 text-sm">
              <li>Nationwide US Shipping</li>
              <li>Secure Online Checkout</li>
              <li>Custom Orders Welcome</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <div>© 2026 Herk's Boards. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
