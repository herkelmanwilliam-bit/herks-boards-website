import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-12 mb-20">
          
          <div className="lg:col-span-5">
            <h4 className="text-3xl text-[#0f172a] font-serif tracking-widest uppercase mb-6">Herk's Boards</h4>
            <p className="text-slate-500 font-light leading-relaxed max-w-sm mb-8 text-sm">
              Crafting premium end-grain cutting boards, decorative state plaques, and bespoke woodworking from our shop in Iowa.
            </p>
          </div>

          <div className="lg:col-span-3 lg:col-start-7">
            <h5 className="text-[#0f172a] text-[10px] tracking-[0.3em] font-bold mb-6 uppercase">Directory</h5>
            <ul className="space-y-4 text-sm font-light text-slate-500">
              <li><Link href="/shop" className="hover:text-[#0f172a] transition-colors">The Collection</Link></li>
              <li><Link href="/custom-order" className="hover:text-[#0f172a] transition-colors">Commission a Build</Link></li>
              <li><Link href="/about" className="hover:text-[#0f172a] transition-colors">The Workshop</Link></li>
              <li><Link href="/contact" className="hover:text-[#0f172a] transition-colors">Contact & Inquiries</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h5 className="text-[#0f172a] text-[10px] tracking-[0.3em] font-bold mb-6 uppercase">Connect</h5>
            <ul className="space-y-4 text-sm font-light text-slate-500">
              <li><a href="https://instagram.com/herksboards" target="_blank" className="hover:text-[#0f172a] transition-colors">Instagram</a></li>
              <li><a href="mailto:info@herksboards.com" className="hover:text-[#0f172a] transition-colors">Email Us</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] tracking-[0.2em] text-slate-400 font-bold uppercase">
          <div>© {new Date().getFullYear()} HERK'S BOARDS. ALL RIGHTS RESERVED.</div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-[#0f172a] transition-colors">PRIVACY POLICY</Link>
            <Link href="/terms" className="hover:text-[#0f172a] transition-colors">TERMS</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
