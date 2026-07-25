import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center bg-[#0f172a] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] to-slate-900"></div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col lg:flex-row items-center justify-between">
        
        <div className="w-full lg:w-1/2 pr-0 lg:pr-12 text-center lg:text-left">
          <div className="inline-block border border-slate-700 text-slate-400 text-xs tracking-[0.3em] px-5 py-2 mb-10">
            CRAFTED IN IOWA, USA
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif text-white leading-tight mb-8">
            Mastercraft<br />
            <span className="text-slate-400 italic font-light">Woodworking</span>
          </h1>
          <div className="h-px w-24 bg-slate-700 mb-8 mx-auto lg:mx-0"></div>
          <p className="text-lg text-slate-400 mb-14 font-light leading-relaxed max-w-lg mx-auto lg:mx-0">
            Heirloom-quality edge-grain cutting boards, decorative plaques, and bespoke custom builds forged by hand. Built to endure generations.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
            <Link href="/shop" className="bg-white text-[#0f172a] px-8 py-4 text-xs tracking-[0.2em] font-bold hover:bg-slate-200 transition-colors text-center border border-white">
              EXPLORE COLLECTION
            </Link>
            <Link href="/custom-order" className="bg-transparent border border-slate-600 text-slate-300 px-8 py-4 text-xs tracking-[0.2em] font-bold hover:bg-slate-800 transition-colors text-center">
              COMMISSION A BUILD
            </Link>
          </div>
        </div>

        <div className="w-full lg:w-1/2 mt-20 lg:mt-0 hidden md:block">
          <div className="relative w-full aspect-[4/5] bg-slate-900 border border-slate-800 flex items-center justify-center p-8">
            <div className="w-full h-full border border-slate-700 relative flex items-center justify-center bg-[#0f172a] shadow-2xl">
              <div className="absolute inset-4 border border-slate-800/50"></div>
              <div className="text-slate-600 font-serif italic text-2xl">HB</div>
            </div>
            <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-slate-800 -z-10"></div>
            <div className="absolute top-1/2 -right-4 w-24 h-px bg-slate-600"></div>
          </div>
        </div>

      </div>
    </section>
  )
}
