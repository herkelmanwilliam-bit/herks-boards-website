import { Ruler, Hammer, Droplets, Package } from 'lucide-react'

const standards = [
  { icon: Ruler, title: 'Bespoke Sizing', text: 'Select a profile from the collection or commission exact dimensions tailored to your space.' },
  { icon: Hammer, title: 'Premium Timber', text: 'Every board is cut and joined using hand-selected, kiln-dried domestic and exotic hardwoods.' },
  { icon: Droplets, title: 'Food-Safe Finish', text: 'Conditioned in a proprietary blend of mineral oil and beeswax to preserve and protect.' },
  { icon: Package, title: 'Nationwide Delivery', text: 'Securely packaged and shipped direct from the workshop to your kitchen counter.' },
]

export default function HowItWorks() {
  return (
    <section className="py-32 bg-[#0f172a] text-white">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-24">
          <h2 className="text-[10px] tracking-[0.4em] text-slate-500 font-bold mb-6 uppercase">The Standard</h2>
          <h3 className="text-4xl sm:text-5xl font-serif italic text-white">Craftsmanship without compromise.</h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {standards.map((s, i) => (
            <div key={i} className="text-center group">
              <div className="w-20 h-20 mx-auto border border-slate-700 rounded-full flex items-center justify-center mb-8 group-hover:border-slate-400 group-hover:bg-slate-800 transition-all duration-500">
                <s.icon className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" strokeWidth={1.5} />
              </div>
              <h4 className="font-serif text-xl mb-4 text-slate-200">{s.title}</h4>
              <p className="text-sm text-slate-500 font-light leading-relaxed px-4">{s.text}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
