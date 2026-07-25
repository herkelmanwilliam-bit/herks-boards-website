import { Ruler, Hammer, Truck, ShieldCheck } from 'lucide-react'

const steps = [
  { icon: Ruler, step: 'I', title: 'Consult & Design', description: 'Select a standard profile from our collection or commission a completely bespoke piece tailored to your dimensions.' },
  { icon: Hammer, step: 'II', title: 'Craftsmanship', description: 'Each piece is cut, joined, routed, and sanded by hand using premium, hand-selected hardwoods.' },
  { icon: ShieldCheck, step: 'III', title: 'Finishing', description: 'Sealed and conditioned in a proprietary blend of food-grade mineral oil and natural beeswax.' },
  { icon: Truck, step: 'IV', title: 'Delivery', description: 'Securely packaged and shipped nationwide. Arrives ready to anchor your kitchen.' },
]

export default function HowItWorks() {
  return (
    <section className="py-32 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-24 flex flex-col md:flex-row justify-between items-end gap-8 border-b border-slate-200 pb-12">
          <div>
            <h2 className="text-xs tracking-[0.3em] text-slate-400 font-bold mb-4">THE PROCESS</h2>
            <h3 className="text-4xl sm:text-5xl font-serif text-[#0f172a] leading-tight">From raw timber<br/>to your tabletop.</h3>
          </div>
          <div className="text-slate-500 max-w-sm md:text-right font-light leading-relaxed">
            Every board that leaves our shop represents hours of meticulous labor, precision, and passion.
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16">
          {steps.map((s) => (
            <div key={s.step} className="group flex flex-col">
              <div className="flex items-end justify-between mb-6 pb-4 border-b border-slate-200 group-hover:border-[#0f172a] transition-colors">
                <span className="text-4xl font-serif text-slate-300 group-hover:text-[#0f172a] transition-colors">{s.step}</span>
                <s.icon className="w-6 h-6 text-slate-800" strokeWidth={1.5} />
              </div>
              <h4 className="font-bold text-[#0f172a] text-lg mb-3 tracking-wide">{s.title}</h4>
              <p className="text-slate-500 text-sm leading-loose font-light flex-grow">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
