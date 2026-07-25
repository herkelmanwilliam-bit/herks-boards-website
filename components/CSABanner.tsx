import Link from 'next/link'
import { ArrowRight, CheckCircle } from 'lucide-react'

const perks = [
  'Weekly box of our freshest produce',
  'Priority access to seasonal items',
  'Flexible pickup or delivery',
  'Support a local Minnesota farm',
]

export default function CSABanner() {
  return (
    <section className="py-20 bg-[#1C1C1C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block bg-[#C9A84C] text-[#1C1C1C] text-sm font-bold px-4 py-1 rounded-full mb-4">
              CSA MEMBERSHIP
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Never Run Out of Fresh Produce
            </h2>
            <p className="text-[#F5F0E1]/60 text-lg mb-8">
              Join our Community Supported Agriculture program and get a weekly box of our best vegetables and eggs delivered to you or ready for pickup.
            </p>
            <div className="space-y-3 mb-10">
              {perks.map(p => (
                <div key={p} className="flex items-center gap-3 text-[#F5F0E1]/80">
                  <CheckCircle className="w-5 h-5 text-[#C9A84C] flex-shrink-0" />
                  <span>{p}</span>
                </div>
              ))}
            </div>
            <Link href="/csa" className="inline-flex items-center gap-2 bg-[#C9A84C] text-[#1C1C1C] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#e0c87a] transition-colors">
              Learn About CSA
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { price: "Small", label: 'Small Box', sub: '1-2 people · 6-8 items' },
              { price: "Large", label: 'Large Box', sub: '3-4 people · 12-15 items' },
            ].map(box => (
              <div key={box.label} className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-2xl p-6 text-white text-center">
                <div className="text-2xl font-bold text-[#C9A84C] mb-1">{box.price} Box</div>
                <div className="font-bold text-lg mt-3 mb-1">{box.label}</div>
                <div className="text-[#F5F0E1]/50 text-sm">{box.sub}</div>
              </div>
            ))}
            <div className="col-span-2 bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-2xl p-5 text-white">
              <div className="text-[#C9A84C] font-semibold text-sm uppercase tracking-wide mb-3">🥚 Add Farm-Fresh Eggs</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-[#C9A84C]/20 rounded-xl p-3 text-center">
                  <div className="font-bold text-[#C9A84C]">Half Dozen</div>
                  <div className="text-[#F5F0E1]/50 text-xs mt-1">6 farm-fresh eggs</div>
                </div>
                <div className="bg-white/5 border border-[#C9A84C]/20 rounded-xl p-3 text-center">
                  <div className="font-bold text-[#C9A84C]">Full Dozen</div>
                  <div className="text-[#F5F0E1]/50 text-xs mt-1">Dozen farm-fresh eggs</div>
                </div>
              </div>
              <div className="text-center text-[#F5F0E1]/30 text-xs mt-3">No commitment · Cancel anytime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

