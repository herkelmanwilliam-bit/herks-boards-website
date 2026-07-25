import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative w-full">
      <div className="flex flex-col lg:flex-row min-h-[90vh]">
        
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-20 py-24 bg-[#f8fafc]">
          <div className="mb-8">
            <span className="inline-block text-[10px] font-bold tracking-[0.3em] text-slate-400 border border-slate-300 px-3 py-1 uppercase">
              Established 2024
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif text-[#0f172a] leading-[1.1] mb-8">
            Precision.<br />
            Patience.<br />
            <span className="italic text-slate-500 font-light">Perfection.</span>
          </h1>
          <p className="text-lg text-slate-600 font-light leading-relaxed max-w-md mb-12">
            Heirloom-quality edge-grain cutting boards, bespoke decorative plaques, and custom commissions forged by hand in Iowa. Built to endure generations of use.
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
            <Link href="/shop" className="group flex items-center justify-center gap-3 bg-[#0f172a] text-white px-8 py-5 text-xs tracking-[0.2em] font-bold hover:bg-slate-800 transition-all w-fit">
              SHOP BOARDS
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/custom-order" className="flex items-center justify-center border-b-2 border-slate-300 text-slate-500 px-4 py-4 text-xs tracking-[0.2em] font-bold hover:text-[#0f172a] hover:border-[#0f172a] transition-all w-fit">
              COMMISSION A BUILD
            </Link>
          </div>
        </div>

        <div className="w-full lg:w-1/2 bg-[#0f172a] relative flex items-center justify-center p-12 min-h-[50vh]">
          <div className="relative w-full max-w-md aspect-[3/4] border border-slate-800 bg-[#1e293b] shadow-2xl flex flex-col items-center justify-center p-8 overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #334155 25%, transparent 25%, transparent 75%, #334155 75%, #334155), linear-gradient(45deg, #334155 25%, transparent 25%, transparent 75%, #334155 75%, #334155)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}></div>
            <div className="w-full h-full border border-slate-600 flex items-center justify-center bg-[#f8fafc] z-10 p-8 shadow-inner">
              <img src="/images/logo.jpg" alt="Herk's Boards Logo" className="w-full h-full object-contain mix-blend-multiply" />
            </div>
          </div>
          
          <div className="absolute bottom-10 right-10 text-right text-slate-600 text-[10px] tracking-[0.4em] font-medium hidden lg:block uppercase">
            Iowa, USA<br />Mastercraft
          </div>
        </div>

      </div>
    </section>
  )
}
