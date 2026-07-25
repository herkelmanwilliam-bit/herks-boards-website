import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative bg-[#0f172a] overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-px bg-slate-500"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-slate-500"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-8">
          Handcrafted.<br />
          <span className="text-slate-400">Built for Life.</span>
        </h1>

        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Custom woodworking, end-grain cutting boards, and decorative state plaques. Hand-finished and built to last generations.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/shop" className="inline-flex items-center justify-center gap-2 bg-slate-600 text-white px-8 py-4 rounded-sm font-bold text-lg hover:bg-slate-700 transition-colors shadow-lg">
            Shop Boards
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/custom-order" className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-slate-500/50 text-slate-400 px-8 py-4 rounded-sm font-bold text-lg hover:border-slate-400 hover:bg-slate-400/10 transition-colors">
            Request Custom Build
          </Link>
        </div>
      </div>
    </section>
  )
}
