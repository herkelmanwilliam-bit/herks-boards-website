import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative bg-[#1C1C1C] overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-px bg-amber-600"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-amber-600"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-8">
          Handcrafted.<br />
          <span className="text-amber-500">Built for Life.</span>
        </h1>

        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Custom woodworking, end-grain cutting boards, and decorative state plaques. Hand-finished and built to last generations.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/shop" className="inline-flex items-center justify-center gap-2 bg-amber-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-amber-800 transition-colors shadow-lg">
            Shop Boards
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/custom-order" className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-amber-600/50 text-amber-500 px-8 py-4 rounded-xl font-bold text-lg hover:border-amber-500 hover:bg-amber-500/10 transition-colors">
            Request Custom Build
          </Link>
        </div>
      </div>
    </section>
  )
}
