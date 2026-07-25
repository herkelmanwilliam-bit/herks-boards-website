import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-slate-400 border-t border-slate-800 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          
          <div className="lg:col-span-2">
            <h4 className="text-3xl text-white font-serif tracking-widest uppercase mb-6">Herk's Boards</h4>
            <p className="text-slate-500 font-light leading-relaxed max-w-sm mb-10 text-sm">
              Premium custom woodworking and edge-grain cutting boards crafted in Iowa. Designed to be the centerpiece of your kitchen.
            </p>
            <div className="text-xs tracking-[0.2em] text-slate-300 space-y-3 font-semibold">
              <div>IOWA, USA</div>
              <div><a href="mailto:info@herksboards.com" className="hover:text-white transition-colors">INFO@HERKSBOARDS.COM</a></div>
            </div>
          </div>

          <div>
            <h5 className="text-white text-xs tracking-[0.3em] font-bold mb-8">COLLECTION</h5>
            <ul className="space-y-4 text-sm font-light text-slate-400">
              <li><Link href="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/custom-order" className="hover:text-white transition-colors">Bespoke Builds</Link></li>
              <li><Link href="/shop" className="hover:text-white transition-colors">Cutting Boards</Link></li>
              <li><Link href="/shop" className="hover:text-white transition-colors">Decorative Plaques</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white text-xs tracking-[0.3em] font-bold mb-8">SUPPORT</h5>
            <ul className="space-y-4 text-sm font-light text-slate-400">
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Our Heritage</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] tracking-[0.2em] text-slate-600 font-bold uppercase">
          <div>© {new Date().getFullYear()} HERK'S BOARDS. ALL RIGHTS RESERVED.</div>
          <div className="flex gap-6">
            <span>NATIONWIDE SHIPPING</span>
            <span>•</span>
            <span>SECURE CHECKOUT</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
